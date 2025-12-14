const supabase = require("../supabase/supabaseClient");
const { recalculatePlaceRating } = require("../helpers/ratingHelper");

// =============================================
// HELPER: Hitung level user berdasarkan review & like
// =============================================
function calculateUserLevel(reviewCount, likeReceived) {
  likeReceived = likeReceived ?? 0;

  if (reviewCount >= 30 || likeReceived >= 50) return 5;
  if (reviewCount >= 20 || likeReceived >= 30) return 4;
  if (reviewCount >= 10 || likeReceived >= 15) return 3;
  if (reviewCount >= 3 || likeReceived >= 5) return 2;

  return 1;
}

// =============================================
// GET ALL REVIEWS FOR A PLACE
// =============================================
exports.getReviewsByPlace = async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);

    const { data, error } = await supabase
      .from("reviews")
      .select(
        `
        id,
        user_id,
        rating,
        comment,
        is_anonymous,
        photo_urls,
        thumbs_up_count,
        created_at,
        users ( id, name )
      `
      )
      .eq("place_id", placeId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("getReviewsByPlace error:", err);
    return res.status(500).json({ error: err.message });
  }
};


exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const { data, error } = await supabase
      .from("reviews")
      .select(`
        id,
        rating,
        comment,
        created_at,
        place_id,
        places ( id, name )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ reviews: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// =============================================
// ADD REVIEW — otomatis hitung rating & level user
// =============================================
  exports.addReview = async (req, res) => {
    try {
      const {
        user_id,
        place_id,
        rating,
        comment,
        is_anonymous,
        photo_urls
      } = req.body;

      if (!user_id || !place_id || !rating) {
        return res.status(400).json({
          message: "user_id, place_id, dan rating wajib diisi."
        });
      }

      // INSERT review ke Supabase
      const { data: review, error: insertError } = await supabase
        .from("reviews")
        .insert([{
          user_id,
          place_id,
          rating,
          comment: comment ?? "",
          is_anonymous: is_anonymous ?? false,
          photo_urls: photo_urls ?? [],
          thumbs_up_count: 0
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Ambil info user dari tabel users
      const { data: userData } = await supabase
        .from("users")
        .select("id, name, photo_url")
        .eq("id", user_id)
        .single();

      // Recalculate rating tempat
      await recalculatePlaceRating(place_id);

      // Hitung ulang review & like user
      const { data: userReviews } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user_id);

      const reviewCount = userReviews.length;

      const { data: likeRec } = await supabase
        .from("reviews")
        .select("thumbs_up_count")
        .eq("user_id", user_id);

      const likeReceived = likeRec.reduce(
        (acc, r) => acc + r.thumbs_up_count,
        0
      );

      const newLevel = calculateUserLevel(reviewCount, likeReceived);

      await supabase
        .from("users")
        .update({
          review_count: reviewCount,
          like_received: likeReceived,
          level: newLevel
        })
        .eq("id", user_id);

      // Generate avatar jika user tidak punya photo_url
      const avatarUrl = userData?.photo_url
        ? userData.photo_url
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData?.name || "User"
          )}&background=e11d48&color=fff`;

      // RESPONSE lengkap untuk frontend
      return res.status(201).json({
        success: true,
        review: {
          ...review,
          user_name: userData?.name || "Pengguna",
          user_avatar_url: avatarUrl || null
        },
        new_user_level: newLevel
      });

    } catch (err) {
      console.error("addReview error:", err);
      return res.status(500).json({ error: err.message });
    }
  };



// =============================================
// DELETE REVIEW — rating & user level update
// =============================================
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const userId = req.user.id;

    // Ambil review
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("*")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({ error: "Review tidak ditemukan." });
    }

    if (review.user_id !== userId) {
      return res.status(403).json({ error: "Tidak boleh menghapus review orang lain." });
    }

    // Hapus review
    await supabase.from("reviews").delete().eq("id", reviewId);

    // Recalculate rating restoran
    await recalculatePlaceRating(review.place_id);

    // Hitung ulang level user
    const { data: userReviews } = await supabase
      .from("reviews")
      .select("id")
      .eq("user_id", userId);

    const reviewCount = userReviews.length;

    const { data: likeRec } = await supabase
      .from("reviews")
      .select("thumbs_up_count")
      .eq("user_id", userId);

    const likeReceived = likeRec.reduce(
      (acc, r) => acc + r.thumbs_up_count,
      0
    );

    const newLevel = calculateUserLevel(reviewCount, likeReceived);

    await supabase
      .from("users")
      .update({
        review_count: reviewCount,
        like_received: likeReceived,
        level: newLevel
      })
      .eq("id", userId);

    return res.json({
      success: true,
      message: "Review berhasil dihapus.",
      new_user_level: newLevel
    });
  } catch (err) {
    console.error("deleteReview error:", err);
    return res.status(500).json({ error: err.message });
  }
};

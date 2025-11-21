const supabase = require("../supabase/supabaseClient");

// =============================================
// ADD LIKE
// POST /reviews/:reviewId/like
// =============================================
exports.likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id; // user dari token middleware

    // 1. Cek apakah review ada
    const { data: review, error: reviewError } = await supabase
      .from("reviews")
      .select("id, user_id")
      .eq("id", reviewId)
      .single();

    if (reviewError || !review) {
      return res.status(404).json({ error: "Review tidak ditemukan" });
    }

    // 2. Cegah user like review sendiri
    if (review.user_id === userId) {
      return res.status(400).json({
        error: "Anda tidak bisa memberikan like pada review sendiri."
      });
    }

    // 3. Insert like
    const { error: insertError } = await supabase
      .from("review_likes")
      .insert([{ review_id: reviewId, user_id: userId }]);

    if (insertError) {
      // Jika user sudah like sebelumnya
      if (insertError.code === "23505") {
        return res
          .status(400)
          .json({ error: "Anda sudah memberikan like pada review ini." });
      }

      console.error(insertError);
      return res.status(500).json({ error: insertError.message });
    }

    // 4. Update thumbsUpCount di tabel reviews
    const { count: likeCount, error: countError } = await supabase
      .from("review_likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId);

    if (countError) {
      console.error(countError);
    } else {
      await supabase
        .from("reviews")
        .update({ thumbsUpCount: likeCount })
        .eq("id", reviewId);
    }

    return res.json({
      message: "Berhasil memberi like.",
      review_id: reviewId,
      total_likes: likeCount
    });
  } catch (err) {
    console.error("likeReview error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// REMOVE LIKE
// DELETE /reviews/:reviewId/unlike
// =============================================
exports.unlikeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;

    // Hapus dari tabel review_likes
    const { error: delError } = await supabase
      .from("review_likes")
      .delete()
      .eq("review_id", reviewId)
      .eq("user_id", userId);

    if (delError) {
      console.error(delError);
      return res.status(500).json({ error: delError.message });
    }

    // Hitung ulang total like
    const { count: likeCount, error: countError } = await supabase
      .from("review_likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId);

    await supabase
      .from("reviews")
      .update({ thumbsUpCount: likeCount })
      .eq("id", reviewId);

    return res.json({
      message: "Berhasil menghapus like.",
      review_id: reviewId,
      total_likes: likeCount
    });
  } catch (err) {
    console.error("unlikeReview error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =============================================
// GET LIKE COUNT
// GET /reviews/:reviewId/likes
// =============================================
exports.getReviewLikes = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const { count, error } = await supabase
      .from("review_likes")
      .select("*", { count: "exact", head: true })
      .eq("review_id", reviewId);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ review_id: reviewId, total_likes: count });
  } catch (err) {
    console.error("getReviewLikes error:", err);
    res.status(500).json({ error: err.message });
  }
};

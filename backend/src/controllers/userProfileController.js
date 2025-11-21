const supabase = require("../supabase/supabaseClient");

// =============================================
// GET USER PROFILE + ALL REVIEWS BY USER
// =============================================
exports.getUserProfileReviews = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Ambil data user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, level, review_count, like_received, photo_url")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return res.status(404).json({ message: "User tidak ditemukan." });
    }

    // 2. Ambil semua review yang ditulis user + info restoran
    const { data: reviews, error: reviewError } = await supabase
      .from("reviews")
      .select(
        `
        id,
        place_id,
        rating,
        comment,
        photo_urls,
        thumbs_up_count,
        created_at,
        places (
          id,
          name,
          address,
          average_rating,
          city_id
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (reviewError) {
      console.error(reviewError);
      return res.status(500).json({ error: reviewError.message });
    }

    return res.json({
      profile: user,
      total_reviews: reviews.length,
      reviews
    });
  } catch (err) {
    console.error("getUserProfileReviews error:", err);
    return res.status(500).json({ error: err.message });
  }
};

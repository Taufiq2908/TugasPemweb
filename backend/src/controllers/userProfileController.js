const supabase = require("../supabase/supabaseClient");

// =============================================
// GET USER PROFILE + ALL REVIEWS BY USER
// =============================================
exports.getUserProfileReviews = async (req, res) => {
  try {
    const userId = req.params.id;

    // *** STEP 1: LOGGING UNTUK DEBUGGING ***
    console.log("UserID yang dicari (req.params.id):", userId);

    // 1. Ambil data user
    // Ganti .single() dengan .maybeSingle()
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, name, level, review_count, like_received")
      .eq("id", userId)
      .maybeSingle(); // <= Perubahan di sini!

    // Cek error koneksi/database yang sebenarnya
    if (userError) {
        console.error("Supabase User Error:", userError);
        return res.status(500).json({ error: userError.message });
    }

    // Jika data adalah null, berarti 0 baris ditemukan
    if (!userData) {
      return res.status(404).json({ message: "User tidak ditemukan. (Pastikan ID UUID sudah benar dan ada di database)" });
    }
    
    const user = userData; // Data user berhasil ditemukan
    
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
const supabase = require("../supabase/supabaseClient");

// Hitung ulang rating & total reviews restoran
exports.recalculatePlaceRating = async (placeId) => {
  try {
    // Ambil semua rating di review untuk place ini
    const { data: reviews, error } = await supabase
      .from("reviews")
      .select("rating")
      .eq("place_id", placeId);

    if (error) {
      console.error("Error mengambil review:", error);
      return;
    }

    if (!reviews || reviews.length === 0) {
      // Jika tidak ada review → reset rating
      await supabase
        .from("places")
        .update({
          average_rating: 0,
          total_reviews: 0
        })
        .eq("id", placeId);

      return;
    }

    const totalReviews = reviews.length;
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

    // Update tabel places
    await supabase
      .from("places")
      .update({
        average_rating: avgRating,
        total_reviews: totalReviews
      })
      .eq("id", placeId);
  } catch (err) {
    console.error("recalculatePlaceRating error:", err);
  }
};

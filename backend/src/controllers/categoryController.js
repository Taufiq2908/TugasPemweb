const supabase = require("../supabase/supabaseClient");

// ===========================
// GET ALL CATEGORIES
// ===========================
exports.getAllCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("getAllCategories error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ===========================
// GET PLACES BY CATEGORY ID
// ===========================
exports.getPlacesByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    // 1) Ambil relasi place <-> category
    const { data: relations, error: relationError } = await supabase
      .from("place_categories")
      .select("place_id")
      .eq("category_id", categoryId);

    if (relationError) throw relationError;

    if (!relations || relations.length === 0) {
      return res.json([]);
    }

    const placeIds = relations.map((r) => r.place_id);

    // 2) Ambil data restoran berdasarkan daftar ID
    const { data: places, error: placesError } = await supabase
      .from("places")
      .select("*")
      .in("id", placeIds)
      .order("id", { ascending: true });

    if (placesError) throw placesError;

    return res.json(places);
  } catch (err) {
    console.error("getPlacesByCategory error:", err);
    return res.status(500).json({ error: err.message });
  }
};

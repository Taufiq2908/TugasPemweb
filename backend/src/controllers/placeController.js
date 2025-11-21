const supabase = require("../supabase/supabaseClient");

// =======================
// GET ALL PLACES
// =======================
exports.getAllPlaces = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("getAllPlaces error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// =======================
// GET PLACES BY CITY
// =======================
exports.getPlacesByCity = async (req, res) => {
  try {
    const cityId = parseInt(req.params.id);

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("city_id", cityId)
      .order("id", { ascending: true });

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("getPlacesByCity error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// =======================
// GET ONE PLACE (DETAIL) + CATEGORIES
// =======================
exports.getPlaceById = async (req, res) => {
  try {
    const placeId = parseInt(req.params.id);

    // 1. Ambil data restoran
    const { data: place, error: placeError } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .single();

    if (placeError || !place) {
      return res.status(404).json({ message: "Restoran tidak ditemukan." });
    }

    // 2. Ambil kategori restoran (relasi many-to-many)
    const { data: categories, error: categoryError } = await supabase
      .from("place_categories")
      .select(`
        category_id,
        categories(name)
      `)
      .eq("place_id", placeId);

    if (categoryError) throw categoryError;

    // Format kategori
    const formattedCategories = categories.map((c) => ({
      id: c.category_id,
      name: c.categories?.name || ""
    }));

    return res.json({
      ...place,
      categories: formattedCategories,
    });

  } catch (err) {
    console.error("getPlaceById error:", err);
    return res.status(500).json({ error: err.message });
  }
};

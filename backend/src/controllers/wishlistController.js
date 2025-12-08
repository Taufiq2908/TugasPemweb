const supabase = require("../supabase/supabaseClient");

// =====================================================
// GET ALL WISHLISTS FOR A USER
// =====================================================
exports.getWishlistByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10); // ✅ pastikan integer

    const { data, error } = await supabase
      .from("wishlists")
      .select(`
        id,
        place_id,
        places (*)
      `)
      .eq("user_id", userId);

    if (error) throw error;

    return res.json(data);
  } catch (err) {
    console.error("getWishlistByUser error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// =====================================================
// ADD PLACE TO WISHLIST
// =====================================================
exports.addToWishlist = async (req, res) => {
  try {
    const { user_id, place_id } = req.body;

    if (!user_id || !place_id) {
      return res
        .status(400)
        .json({ message: "user_id dan place_id wajib diisi." });
    }

    const userId = parseInt(user_id, 10);
    const placeId = parseInt(place_id, 10);

    // Cek apakah sudah ada
    const { data: existing, error: existsError } = await supabase
      .from("wishlists")
      .select("*")
      .eq("user_id", userId)
      .eq("place_id", placeId)
      .single();

    if (!existsError && existing) {
      return res.status(400).json({ message: "Sudah ada di wishlist." });
    }

    // Tambahkan
    const { data, error } = await supabase
      .from("wishlists")
      .insert([{ user_id: userId, place_id: placeId }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      wishlist: data,
    });
  } catch (err) {
    console.error("addToWishlist error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// =====================================================
// REMOVE PLACE FROM WISHLIST
// =====================================================
exports.removeFromWishlist = async (req, res) => {
  try {
    const { user_id, place_id } = req.body;

    if (!user_id || !place_id) {
      return res
        .status(400)
        .json({ message: "user_id dan place_id wajib diisi." });
    }

    const userId = parseInt(user_id, 10);
    const placeId = parseInt(place_id, 10);

    const { error } = await supabase
      .from("wishlists")
      .delete()
      .eq("user_id", userId)
      .eq("place_id", placeId);

    if (error) throw error;

    return res.json({
      success: true,
      message: "Berhasil dihapus dari wishlist.",
    });
  } catch (err) {
    console.error("removeFromWishlist error:", err);
    return res.status(500).json({ error: err.message });
  }
};

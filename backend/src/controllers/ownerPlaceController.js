const supabase = require("../supabase/supabaseClient");

// =========================
// GET RESTO MILIK OWNER
// =========================
exports.getMyPlaces = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("owner_id", ownerId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ places: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// TAMBAH RESTO (STATUS: PENDING)
// =========================
exports.createPlace = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const {
      name,
      description,
      address,
      city_id,
      lat,
      lon,
      photos,
      opening_hours,   // ✅ tambah
      price_range      // ✅ tambah
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        message: "Nama dan alamat resto wajib diisi."
      });
    }

    const { data, error } = await supabase
      .from("places")
      .insert([
        {
          name,
          description,
          address,
          city_id,
          lat,
          lon,
          photos,
          opening_hours: opening_hours ?? null, // ✅ simpan
          price_range: price_range ?? null,     // ✅ simpan
          owner_id: ownerId,
          status: "pending"
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Resto berhasil ditambahkan dan menunggu verifikasi admin.",
      place: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// =========================
// EDIT RESTO MILIK SENDIRI
// =========================
exports.updateMyPlace = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const placeId = req.params.id;

    // Ambil resto
    const { data: place, error: findError } = await supabase
      .from("places")
      .select("id, owner_id")
      .eq("id", placeId)
      .single();

    if (findError || !place) {
      return res.status(404).json({ message: "Resto tidak ditemukan." });
    }

    if (place.owner_id !== ownerId) {
      return res.status(403).json({ message: "Akses ditolak." });
    }

    const updates = {
      ...req.body,
      status: "pending" // EDIT → PERLU APPROVAL ULANG
    };

    const { error } = await supabase
      .from("places")
      .update(updates)
      .eq("id", placeId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      message: "Perubahan disimpan dan menunggu verifikasi admin."
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET DETAIL RESTO MILIK OWNER
// =========================
exports.getMyPlaceById = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const placeId = req.params.id;

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .eq("owner_id", ownerId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Resto tidak ditemukan." });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

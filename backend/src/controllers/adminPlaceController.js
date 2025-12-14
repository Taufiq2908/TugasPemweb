const supabase = require("../supabase/supabaseClient");

// =========================
// GET ALL RESTO (ADMIN) ✅ BARU
// =========================
exports.getAllPlacesByAdmin = async (req, res) => {
  try {
    console.log("ADMIN HIT:", req.user);
    
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ places: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET RESTO PENDING (ADMIN) (tetap)
// =========================
exports.getPendingPlaces = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("status", "pending");

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ places: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// ACTIVATE RESTO (APPROVE)
// =========================
exports.approvePlace = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const placeId = req.params.id;

    const { error } = await supabase
      .from("places")
      .update({ status: "active" })
      .eq("id", placeId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Resto berhasil diaktifkan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// REJECT RESTO
// =========================
exports.rejectPlace = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const placeId = req.params.id;

    const { error } = await supabase
      .from("places")
      .update({ status: "rejected" })
      .eq("id", placeId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Resto berhasil ditolak." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// ADMIN TAMBAH RESTO
// =========================
exports.createPlaceByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const {
      name,
      description,
      address,
      city_id,
      lat,
      lon,
      photos
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
          owner_id: null,
          status: "active"
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      message: "Resto berhasil ditambahkan oleh admin.",
      place: data
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// ADMIN EDIT RESTO
// =========================
exports.updatePlaceByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const placeId = req.params.id;

    const updates = {
      ...req.body,
      status: "active"
    };

    const { error } = await supabase
      .from("places")
      .update(updates)
      .eq("id", placeId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Resto berhasil diperbarui oleh admin." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// ADMIN HAPUS RESTO
// =========================
exports.deletePlaceByAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const placeId = req.params.id;

    const { error } = await supabase
      .from("places")
      .delete()
      .eq("id", placeId);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({ message: "Resto berhasil dihapus oleh admin." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET DETAIL RESTO (ADMIN) ✅ WAJIB
// =========================
exports.getPlaceByIdAdmin = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Akses admin saja." });
    }

    const placeId = req.params.id;

    const { data, error } = await supabase
      .from("places")
      .select("*")
      .eq("id", placeId)
      .single();

    if (error || !data) {
      return res.status(404).json({ message: "Restoran tidak ditemukan." });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

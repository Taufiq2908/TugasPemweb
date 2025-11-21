const supabase = require("../supabase/supabaseClient");

// Helper hitung jarak (Haversine) dalam kilometer
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius bumi km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// =========================
// CREATE CITY
// =========================
exports.addCity = async (req, res) => {
  try {
    const { name, lat, lon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama kota wajib diisi." });
    }

    const { data, error } = await supabase
      .from("cities")
      .insert([
        {
          name,
          lat: lat ?? null,
          lon: lon ?? null,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json(data);
  } catch (err) {
    console.error("addCity error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET ALL CITIES
// =========================
exports.getCities = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err) {
    console.error("getCities error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET CITY BY ID
// =========================
exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return res.status(404).json({ message: "Kota tidak ditemukan." });
    }

    return res.json(data);
  } catch (err) {
    console.error("getCityById error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// UPDATE CITY
// =========================
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lat, lon } = req.body;

    const { data, error } = await supabase
      .from("cities")
      .update({
        ...(name !== undefined && { name }),
        ...(lat !== undefined && { lat }),
        ...(lon !== undefined && { lon })
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    if (!data) {
      return res.status(404).json({ message: "Kota tidak ditemukan." });
    }

    return res.json(data);
  } catch (err) {
    console.error("updateCity error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DELETE CITY
// =========================
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase.from("cities").delete().eq("id", id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({ message: "Kota berhasil dihapus." });
  } catch (err) {
    console.error("deleteCity error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DETECT NEARBY CITY
// =========================
exports.detectNearbyCity = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res
        .status(400)
        .json({ message: "lat dan lon query parameter wajib diisi." });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    const { data: cities, error } = await supabase
      .from("cities")
      .select("*");

      console.log("DEBUG CITIES:", cities);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    if (!cities || cities.length === 0) {
      return res.json({ found: false });
    }

    let nearestCity = null;
    let nearestDist = Infinity;

    for (const city of cities) {
      if (city.lat == null || city.lon == null) continue;

      const dist = getDistanceKm(
        userLat,
        userLon,
        parseFloat(city.lat),
        parseFloat(city.lon)
      );

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCity = city;
      }
    }

    if (!nearestCity) {
      return res.json({ found: false });
    }

    return res.json({
      found: true,
      city: nearestCity.name,
      id: nearestCity.id,
      distanceKm: nearestDist
    });
  } catch (err) {
    console.error("detectNearbyCity error:", err);
    res.status(500).json({ error: err.message });
  }
};

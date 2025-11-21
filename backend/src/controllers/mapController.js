const supabase = require("../supabase/supabaseClient");

// ===========================================
// Helper: Hitung jarak (km) dengan Haversine
// ===========================================
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius bumi dalam km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ===========================================
// 1. GET /maps/places
//    → Semua restoran (opsional filter city_id)
// ===========================================
exports.getPlacesForMap = async (req, res) => {
  try {
    const { city_id } = req.query;

    let query = supabase
      .from("places")
      .select(
        `
        id,
        name,
        lat,
        lon,
        address,
        average_rating,
        total_reviews,
        city_id
      `
      )
      .not("lat", "is", null)
      .not("lon", "is", null);

    if (city_id) {
      query = query.eq("city_id", city_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("getPlacesForMap error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      total: data.length,
      city_id: city_id || null,
      data
    });
  } catch (err) {
    console.error("getPlacesForMap exception:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ===========================================
// 2. GET /maps/nearby
//    → Restoran di sekitar (lat, lon, radius)
//    Query:
//      lat, lon (wajib)
//      radius (opsional, default 5 km)
//      city_id (opsional, untuk batasi kota)
//      limit (opsional, default 50)
// ===========================================
exports.getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lon, radius, city_id, limit } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: "Parameter lat dan lon wajib diisi."
      });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);
    const radiusKm = radius ? parseFloat(radius) : 5; // default 5 km
    const maxResults = limit ? parseInt(limit) : 50;

    // Ambil semua places (opsional filter city_id)
    let query = supabase
      .from("places")
      .select(
        `
        id,
        name,
        lat,
        lon,
        address,
        average_rating,
        total_reviews,
        city_id
      `
      )
      .not("lat", "is", null)
      .not("lon", "is", null);

    if (city_id) {
      query = query.eq("city_id", city_id);
    }

    const { data: places, error } = await query;

    if (error) {
      console.error("getNearbyPlaces error:", error);
      return res.status(500).json({ error: error.message });
    }

    // Hitung jarak dan filter berdasarkan radius
    let withDistance = places.map((p) => {
      const distance_km = getDistanceKm(userLat, userLon, p.lat, p.lon);
      return { ...p, distance_km };
    });

    withDistance = withDistance
      .filter((p) => p.distance_km <= radiusKm)
      .sort((a, b) => a.distance_km - b.distance_km);

    if (withDistance.length > maxResults) {
      withDistance = withDistance.slice(0, maxResults);
    }

    return res.json({
      total: withDistance.length,
      radius_km: radiusKm,
      city_id: city_id || null,
      data: withDistance
    });
  } catch (err) {
    console.error("getNearbyPlaces exception:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ===========================================
// 3. GET /maps/place/:id
//    → Data 1 restoran untuk peta detail
// ===========================================
exports.getSinglePlaceForMap = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("places")
      .select(
        `
        id,
        name,
        lat,
        lon,
        address,
        average_rating,
        total_reviews,
        city_id
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("getSinglePlaceForMap error:", error);
      return res.status(404).json({ error: "Tempat tidak ditemukan." });
    }

    if (data.lat == null || data.lon == null) {
      return res.status(400).json({
        error: "Tempat ini belum memiliki koordinat (lat/lon)."
      });
    }

    return res.json(data);
  } catch (err) {
    console.error("getSinglePlaceForMap exception:", err);
    return res.status(500).json({ error: err.message });
  }
};

const supabase = require("../supabase/supabaseClient");

// ==========================================
// Rumus jarak bumi (Haversine)
// ==========================================
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // kilometer
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

// ==========================================
//  MAIN SEARCH (Filter + Sort + Nearby)
// ==========================================
exports.searchPlaces = async (req, res) => {
  try {
    const {
      city_id,
      category,
      halal,
      rating_min,
      lat,
      lon,
      radius,
      sort
    } = req.query;

    // ISI RESPONSE UNTUK DEBUG
    const responseMeta = {
      city_id,
      filters: {},
      sort: sort || null,
      nearby_mode: false
    };

    // ======================================================
    // 1. Ambil restoran berdasarkan kota
    // ======================================================
    if (!city_id && !lat && !lon) {
      return res.status(400).json({
        error: "Wajib mengirim city_id ATAU lat & lon untuk nearby mode."
      });
    }

    let query = supabase.from("places").select("*");

    // Jika city_id ada → ambil data kota
    if (city_id) {
      query = query.eq("city_id", city_id);
    }

    // ======================================================
    // 2. Filter HALAL
    // ======================================================
    if (halal === "1") {
      query = query.eq("is_halal", true);
      responseMeta.filters.halal = true;
    }

    // ======================================================
    // 3. Filter RATING MINIMAL
    // ======================================================
    if (rating_min) {
      query = query.gte("average_rating", Number(rating_min));
      responseMeta.filters.rating_min = Number(rating_min);
    }

    // ======================================================
    // 4. Filter kategori
    // ======================================================
    if (category) {
      responseMeta.filters.category = category;

      const { data: catData } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", `%${category}%`)
        .single();

      if (catData) {
        const { data: rel } = await supabase
          .from("place_categories")
          .select("place_id")
          .eq("category_id", catData.id);

        if (rel.length > 0) {
          const ids = rel.map((r) => r.place_id);
          query = query.in("id", ids);
        } else {
          return res.json({
            total: 0,
            meta: responseMeta,
            data: []
          });
        }
      }
    }

    // ======================================================
    // 5. Eksekusi query dasar
    // ======================================================
    let { data: places, error } = await query;

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    // ======================================================
    // 6. NEARBY MODE (radius + distance)
    // ======================================================
    if ((lat && lon) || sort === "distance" || radius) {
      if (!lat || !lon) {
        return res.status(400).json({
          error:
            "Jika ingin sorting distance ATAU nearby mode, lat dan lon wajib diisi."
        });
      }

      const latNum = Number(lat);
      const lonNum = Number(lon);

      places = places.map((p) => {
        if (p.lat && p.lon) {
          p.distance_km = getDistanceKm(latNum, lonNum, p.lat, p.lon);
        } else {
          p.distance_km = 999999;
        }
        return p;
      });

      // --- Filter radius (Nearby mode)
      if (radius) {
        responseMeta.nearby_mode = true;
        const maxRadius = Number(radius);

        places = places.filter((p) => p.distance_km <= maxRadius);
      }

      // --- Sorting by distance
      if (sort === "distance") {
        places.sort((a, b) => a.distance_km - b.distance_km);
      }
    }

    // ======================================================
    // 7. Sorting Rating
    // ======================================================
    if (sort === "rating_desc") {
      places.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    // ======================================================
    // 8. Return final hasil
    // ======================================================
    return res.json({
      total: places.length,
      meta: responseMeta,
      data: places
    });

  } catch (err) {
    console.error("searchPlaces error:", err);
    return res.status(500).json({ error: err.message });
  }
};

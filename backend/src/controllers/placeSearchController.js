const supabase = require("../supabase/supabaseClient");

// ==========================================
// Rumus jarak bumi (Haversine)
// ==========================================
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==========================================
// SEARCH ENGINE CORE
// Endpoint: GET /search/search
// ==========================================
exports.searchPlaces = async (req, res) => {
  try {
    const {
      q,
      city_id,
      category_id,
      halal,
      rating_min,
      lat,
      lon,
      radius,
      sort
    } = req.query;

    const meta = {
      filters: { q, city_id, category_id },
      sort: sort || "relevance",
    };

    // 1. Validasi Minimal: Harus ada Lokasi (Lat/Lon) ATAU Kota (City ID)
    if (!city_id && (!lat || !lon)) {
      return res.status(400).json({
        error: "Mohon pilih kota atau aktifkan lokasi anda untuk mencari."
      });
    }

    // 2. Base Query
    // Kita select semua kolom places, dan nama kota untuk keperluan frontend
    let query = supabase.from("places").select(`*, cities(name)`);

    // 3. Filter Kota (Langsung di query utama karena relasi 1-to-1)
    if (city_id) {
      query = query.eq("city_id", city_id);
    }

    // 4. Logika Pencarian ID (Intersection Keyword & Category)
    // Kita akan mengumpulkan ID tempat yang valid berdasarkan Text DAN Kategori
    let validPlaceIds = null; 

    // --- A. Jika ada Filter Kategori ---
    if (category_id) {
      // Ambil place_id dari tabel perantara (Many-to-Many)
      const { data: catMatches, error: catErr } = await supabase
        .from("place_categories")
        .select("place_id")
        .eq("category_id", category_id);

      if (catErr) throw new Error(catErr.message);

      // Mapping ke array angka
      const idsFromCat = catMatches.map(item => item.place_id);
      
      // Jika kategori dipilih tapi tidak ada tempatnya -> Hasil kosong
      if (idsFromCat.length === 0) {
        return res.json({ total: 0, meta, data: [] });
      }

      validPlaceIds = idsFromCat;
    }

    // --- B. Jika ada Keyword Pencarian (q) ---
    if (q) {
      const keywords = q.toLowerCase().split(/\s+/).filter(Boolean);
      
      // Cari di Places (Nama & Deskripsi)
      let textQuery = supabase.from("places").select("id");
      keywords.forEach(word => {
        textQuery = textQuery.or(`name.ilike.%${word}%,description.ilike.%${word}%`);
      });
      const { data: textMatches } = await textQuery;
      let idsFromText = textMatches ? textMatches.map(p => p.id) : [];

      // Cari di Nama Kategori (misal user ketik "Coto" tapi itu nama kategori)
      // Kita cari kategori yang namanya mirip keyword
      let idsFromCatName = [];
      const { data: matchingCats } = await supabase
        .from("categories")
        .select("id")
        .ilike("name", `%${q}%`); // Simple ilike pada nama kategori

      if (matchingCats && matchingCats.length > 0) {
        const catIds = matchingCats.map(c => c.id);
        const { data: placeCats } = await supabase
            .from("place_categories")
            .select("place_id")
            .in("category_id", catIds);
        if (placeCats) {
            idsFromCatName = placeCats.map(pc => pc.place_id);
        }
      }

      // Gabungkan hasil Text Search + Category Name Search
      const allKeywordIds = [...new Set([...idsFromText, ...idsFromCatName])];

      // LOGIKA INTERSEKSI (IRISAN)
      if (validPlaceIds !== null) {
        // Jika sudah ada filter kategori sebelumnya, kita iris dengan hasil keyword
        // Artinya: Tempat harus Punya Kategori X DAN mengandung Keyword Y
        validPlaceIds = validPlaceIds.filter(id => allKeywordIds.includes(id));
      } else {
        // Jika belum ada filter kategori, maka validPlaceIds adalah hasil keyword ini
        validPlaceIds = allKeywordIds;
      }
    }

    // --- C. Terapkan Filter ID ke Query Utama ---
    // Jika validPlaceIds tidak null, berarti ada filter (Keyword atau Kategori atau Keduanya)
    if (validPlaceIds !== null) {
      if (validPlaceIds.length === 0) {
        return res.json({ total: 0, meta, data: [] });
      }
      query = query.in("id", validPlaceIds);
    }

    // 5. Filter Halal & Rating (Sisa filter sederhana)
    if (halal === "1") query = query.eq("is_halal", true);
    if (rating_min) query = query.gte("average_rating", Number(rating_min));

    // 6. Eksekusi Query
    let { data: places, error } = await query;

    if (error) throw error;

    // 7. Hitung Jarak & Sorting (Di Node.js)
    if ((lat && lon) || sort === "nearest" || sort === "distance" || radius) {
      const latNum = Number(lat);
      const lonNum = Number(lon);

      places = places.map(p => {
        p.distance_km = (p.lat && p.lon && lat && lon)
          ? getDistanceKm(latNum, lonNum, p.lat, p.lon)
          : null;
        return p;
      });

      if (radius) {
        places = places.filter(p => p.distance_km !== null && p.distance_km <= Number(radius));
      }

      if (sort === "nearest" || sort === "distance") {
        places.sort((a, b) => (a.distance_km || 9999) - (b.distance_km || 9999));
      }
    }

    if (sort === "rating_desc") {
      places.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    return res.json({
      total: places.length,
      meta,
      data: places
    });

  } catch (err) {
    console.error("Search Error:", err);
    return res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};
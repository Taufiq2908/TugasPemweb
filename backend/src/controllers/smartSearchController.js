const supabase = require("../supabase/supabaseClient");
const categoryKeywords = require("../data/categoryKeywords");

// =======================================================
// HELPER: Hitung jarak (Haversine)
// =======================================================
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
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

// =======================================================
// HELPER: Jawaban chatbot manusiawi (lebih natural)
// =======================================================
function buildHumanReply({ total, kota, message, detectedCategory, mode }) {
  const q = message;
  const k = kota;
  const cat = detectedCategory;

  // ----------------------------
  // 1. Jika hasil kosong
  // ----------------------------
  if (total === 0) {
    const options = [
      `Sepertinya belum ada tempat yang cocok untuk "${q}" di ${k}. Mau coba kata lain?`,
      `Hmm… aku tidak menemukan hasil yang pas untuk "${q}" di ${k}. Coba ubah kata pencariannya ya.`,
      `Belum ada hasil untuk "${q}" di ${k}. Mungkin bisa coba makanan lain?`
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // ----------------------------
  // 2. Jika kategori terdeteksi
  // ----------------------------
  if (cat) {
    const options = [
      `Aku menemukan ${total} tempat ${cat} yang bisa kamu coba di ${k}! Ini beberapa pilihannya 👇`,
      `Kalau mau ${cat}, di ${k} ada ${total} pilihan menarik nih. Semoga cocok ya!`,
      `Berikut daftar tempat ${cat} di ${k}. Kamu bisa cek satu-satu 😊`
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // ----------------------------
  // 3. Mode chatbot (pesan panjang)
  // ----------------------------
  if (mode === "chatbot") {
    const options = [
      `Berikut beberapa rekomendasi yang menurutku paling pas untuk "${q}" di ${k} 👇`,
      `Ini beberapa pilihan tempat yang cocok untuk "${q}" di ${k}!`,
      `Oke, ini hasil terbaik yang berhasil aku temukan untuk "${q}" di ${k} 👇`
    ];
    return options[Math.floor(Math.random() * options.length)];
  }

  // ----------------------------
  // 4. Search biasa
  // ----------------------------
  const options = [
    `Aku menemukan ${total} tempat yang cocok dengan pencarian "${q}" di ${k}.`,
    `Ada ${total} tempat yang relevan dengan "${q}" di ${k}.`,
    `Berikut hasil pencarian untuk "${q}" di ${k}, semoga membantu!`
  ];
  return options[Math.floor(Math.random() * options.length)];
}

// =======================================================
// SMART SEARCH (V2.1 — Search + Chatbot Natural)
// =======================================================
exports.smartSearch = async (req, res) => {
  try {
    const { message, city_id, userLat, userLon } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message wajib diisi" });
    }

    const lower = message.toLowerCase().trim();

    // =======================================================
    // 1. Ambil daftar kota
    // =======================================================
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("*");

    if (citiesError) {
      console.error(citiesError);
      return res.status(500).json({ error: citiesError.message });
    }

    if (!cities || cities.length === 0) {
      return res.json({
        found: false,
        message_human: "Belum ada data kota di sistem."
      });
    }

    let selectedCity = null;

    // =======================================================
    // 2A. CITY DETECTION — dari teks
    // =======================================================
    for (const c of cities) {
      if (lower.includes(c.name.toLowerCase())) {
        selectedCity = c;
        break;
      }
    }

    // =======================================================
    // 2B. Jika user tidak menyebut kota → pakai city_id (kota pilihan user)
    // =======================================================
    if (!selectedCity && city_id) {
      selectedCity = cities.find((c) => c.id === city_id);
    }

    // =======================================================
    // 2C. Jika masih tidak ada → pakai autodetect lokasi
    // =======================================================
    if (!selectedCity && userLat != null && userLon != null) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);

      let nearest = null;
      let nearestDist = Infinity;

      for (const c of cities) {
        if (c.lat == null || c.lon == null) continue;

        const d = getDistanceKm(lat, lon, c.lat, c.lon);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = c;
        }
      }

      selectedCity = nearest;
    }

    // =======================================================
    // 2D. Jika TETAP tidak ada → suruh pilih kota
    // =======================================================
    if (!selectedCity) {
      return res.json({
        found: false,
        message_human:
          "Aku belum bisa menentukan kota. Silakan pilih kota terlebih dahulu ya 😊"
      });
    }

    // =======================================================
    // 3. Deteksi kategori
    // =======================================================
    let detectedCategory = null;

    for (const [key, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((k) => lower.includes(k))) {
        detectedCategory = key;
        break;
      }
    }

    // =======================================================
    // 4. Query restoran
    // =======================================================
    let results = [];

    // 4A. Jika kategori terdeteksi → cari via kategori
    if (detectedCategory) {
      const { data: matchedCats } = await supabase
        .from("categories")
        .select("id, name")
        .ilike("name", `%${detectedCategory}%`);

      if (matchedCats && matchedCats.length > 0) {
        const catIds = matchedCats.map((c) => c.id);

        const { data: rel } = await supabase
          .from("place_categories")
          .select("place_id")
          .in("category_id", catIds);

        if (rel && rel.length > 0) {
          const placeIds = rel.map((r) => r.place_id);

          const { data: places } = await supabase
            .from("places")
            .select("*")
            .eq("city_id", selectedCity.id)
            .in("id", placeIds);

          results = places || [];
        }
      }
    }

    // 4B. Jika kategori tidak ditemukan → search kata bebas
    if (!results || results.length === 0) {
      const keyword = `%${lower}%`;

      const { data: places } = await supabase
        .from("places")
        .select("*")
        .eq("city_id", selectedCity.id)
        .or(
          `name.ilike.${keyword},description.ilike.${keyword},address.ilike.${keyword}`
        );

      results = places || [];
    }

    // =======================================================
    // 5. Mode chatbot / search
    // =======================================================
    const mode =
      message.trim().split(/\s+/).length <= 2 ? "search" : "chatbot";

    // =======================================================
    // 6. Bangun jawaban manusiawi
    // =======================================================
    const humanReply = buildHumanReply({
      total: results.length,
      kota: selectedCity.name,
      message,
      detectedCategory,
      mode
    });

    // =======================================================
    // 7. Return final
    // =======================================================
    return res.json({
      mode,
      query: message,
      city: {
        id: selectedCity.id,
        name: selectedCity.name
      },
      detectedCategory,
      total: results.length,
      results,
      message_human: humanReply
    });

  } catch (err) {
    console.error("smartSearch error:", err);
    return res.status(500).json({ error: err.message });
  }
};

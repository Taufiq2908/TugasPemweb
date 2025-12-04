// =======================
// Rule Engine PRO Makanki
// =======================

// 1. Normalisasi teks (perbaiki typo umum, variasi penulisan)
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/makasar/g, "makassar")
    .replace(/mks\b/g, "makassar")
    .replace(/\bjkt\b/g, "jakarta")
    .replace(/\bjk\b/g, "jakarta")
    .replace(/mi /g, "mie ")
    .replace(/cotto/g, "coto")
    .replace(/palu basa/g, "pallubasa")
    .replace(/pallu basa/g, "pallubasa");
}

// 2. Levenshtein distance sederhana untuk fuzzy matching
function levenshtein(a, b) {
  const m = [];
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  for (let i = 0; i <= b.length; i++) {
    m[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    m[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        m[i][j] = m[i - 1][j - 1];
      } else {
        m[i][j] = Math.min(
          m[i - 1][j - 1] + 1, // ganti
          m[i][j - 1] + 1,     // insert
          m[i - 1][j] + 1      // delete
        );
      }
    }
  }
  return m[b.length][a.length];
}

// =======================
// Mapping Kota (harus cocok tabel cities)
// =======================
const cityMap = {
  "medan": "Medan",
  "palembang": "Palembang",
  "jakarta": "Jakarta",
  "surabaya": "Surabaya",
  "balikpapan": "Balikpapan",
  "pontianak": "Pontianak",
  "makassar": "Makassar",
  "manado": "Manado",
  "jayapura": "Jayapura",
  "sorong": "Sorong",
};

// =======================
// Mapping kata kunci → kategori (master + parent)
// Pastikan nama kategori PERSIS sama dengan kolom `categories.name` di Supabase
// =======================
const foodKeywordMap = {
  // Makassar / Nusantara khas
  "coto": ["Coto", "Makanan Daerah", "Daging"],
  "coto makassar": ["Coto", "Makanan Daerah", "Daging"],
  "konro": ["Konro", "Makanan Daerah", "Daging"],
  "konro bakar": ["Konro", "Makanan Daerah", "Daging"],
  "pallubasa": ["Pallubasa", "Makanan Daerah", "Daging"],
  "pallu basa": ["Pallubasa", "Makanan Daerah", "Daging"],

  "pempek": ["Pempek", "Makanan Daerah"],
  "pindang": ["Pindang", "Makanan Daerah"],
  "rendang": ["Rendang", "Makanan Daerah", "Daging"],
  "gulai": ["Gulai", "Makanan Daerah"],
  "rawon": ["Rawon", "Makanan Daerah"],
  "soto": ["Soto", "Makanan Daerah"],
  "tahu telor": ["Tahu Telor", "Makanan Daerah"],

  // Mie
  "mie ayam": ["Mie Ayam", "Mie", "Ayam"],
  "mi ayam": ["Mie Ayam", "Mie", "Ayam"],
  "bakmi": ["Mie"],
  "mie celor": ["Mie Celor", "Mie"],
  "mie titi": ["Mie Titi", "Mie"],
  "ramen": ["Masakan Internasional", "Mie"],

  // Daging / steak / sate
  "steak": ["Steak", "Daging", "Masakan Internasional"],
  "wagyu": ["Steak", "Daging", "Masakan Internasional"],
  "sate ayam": ["Sate Ayam", "Ayam", "Daging"],
  "sate sapi": ["Sate Sapi", "Daging"],
  "sate kambing": ["Sate Kambing", "Daging"],
  "sate": ["Sate Ayam", "Sate Sapi", "Sate Kambing", "Daging"],
  "daging": ["Daging"],

  // Ikan & seafood
  "ikan bakar": ["Ikan Bakar", "Ikan", "Seafood"],
  "ikan rica": ["Ikan", "Seafood"],
  "ikan": ["Ikan"],
  "seafood": ["Seafood"],
  "kepiting": ["Kepiting", "Seafood"],
  "udang": ["Udang", "Seafood"],

  // Dessert / roti
  "durian": ["Durian", "Dessert & Buah"],
  "es krim": ["Es Krim / Ice Cream", "Dessert & Buah"],
  "ice cream": ["Es Krim / Ice Cream", "Dessert & Buah"],
  "gelato": ["Es Krim / Ice Cream", "Dessert & Buah"],
  "cake": ["Kue & Cake", "Roti & Bakery"],
  "kue": ["Kue & Cake", "Roti & Bakery"],
  "roti": ["Roti & Bakery"],
  "dessert": ["Dessert & Buah"],
  "martabak": ["Dessert & Buah"],

  // Kopi / cafe
  "kopi": ["Minuman & Kopi"],
  "coffee": ["Minuman & Kopi"],
  "cafe": ["Minuman & Kopi"],
  "kafe": ["Minuman & Kopi"],
  "kopitiam": ["Kopitiam", "Minuman & Kopi"],

  // Chinese / Western / internasional
  "chinese food": ["Chinese Food", "Masakan Internasional"],
  "chinese": ["Chinese Food", "Masakan Internasional"],
  "dimsum": ["Chinese Food", "Masakan Internasional"],
  "western": ["Western Food", "Masakan Internasional"],
  "pizza": ["Western Food", "Masakan Internasional"],
  "pasta": ["Western Food", "Masakan Internasional"],
  "burger": ["Western Food", "Masakan Internasional"],
  "choipan": ["Choipan / Chai Kue", "Masakan Internasional"],
  "chai kue": ["Choipan / Chai Kue", "Masakan Internasional"],
};

// utk fuzzy (single word)
const foodKeywordSingleWords = [
  "coto",
  "konro",
  "pallubasa",
  "pempek",
  "pindang",
  "rendang",
  "gulai",
  "rawon",
  "soto",
  "tahu",
  "mie",
  "mi",
  "bakmi",
  "steak",
  "wagyu",
  "sate",
  "ikan",
  "seafood",
  "kepiting",
  "udang",
  "durian",
  "dessert",
  "cake",
  "kue",
  "roti",
  "kopi",
  "coffee",
  "cafe",
  "kafe",
  "chinese",
  "dimsum",
  "western",
  "pizza",
  "pasta",
  "burger",
  "choipan",
];

// =======================
// DETEKSI KOTA
// =======================
function detectCity(text) {
  let detected = null;
  for (const key in cityMap) {
    if (text.includes(key)) {
      detected = cityMap[key];
      break;
    }
  }
  return detected;
}

// =======================
// DETEKSI KATEGORI:
// 1) cek frasa multi-kata (lebih spesifik)
// 2) cek kata tunggal (exact)
// 3) fuzzy match kata tunggal (typo kecil)
// =======================
function detectCategories(text) {
  const found = new Set();

  // Step 1: multi-word exact (cek key yang punya spasi dulu)
  const multiWordKeys = Object.keys(foodKeywordMap)
    .filter((k) => k.includes(" "))
    .sort((a, b) => b.length - a.length); // paling panjang dulu

  for (const key of multiWordKeys) {
    if (text.includes(key)) {
      foodKeywordMap[key].forEach((cat) => found.add(cat));
    }
  }

  // Step 2: exact single-word keys
  const singleKeys = Object.keys(foodKeywordMap).filter((k) => !k.includes(" "));
  for (const key of singleKeys) {
    if (text.includes(key)) {
      foodKeywordMap[key].forEach((cat) => found.add(cat));
    }
  }

  // Step 3: fuzzy matching per token (edit distance <= 1)
  const tokens = text.split(/[\s,.;:!?]+/).filter(Boolean);
  for (const token of tokens) {
    for (const kw of foodKeywordSingleWords) {
      if (Math.abs(kw.length - token.length) > 2) continue; // beda terlalu jauh, skip
      const dist = levenshtein(token, kw);
      if (dist > 0 && dist <= 1) {
        // misal: "makasar" vs "makassar" sudah ditangani normalizer
        // contoh lain: "seafod" vs "seafood" (kalau ada)
        // mapping: pakai keyword kw standar → lihat semua foodKeywordMap yang mengandung kw
        for (const key of Object.keys(foodKeywordMap)) {
          if (key.includes(kw)) {
            foodKeywordMap[key].forEach((cat) => found.add(cat));
          }
        }
      }
    }
  }

  return Array.from(found);
}

// =======================
// FUNGSI UTAMA: parseUserMessage
// =======================
exports.parseUserMessage = (rawText) => {
  if (!rawText || typeof rawText !== "string") {
    return { city: null, categories: [] };
  }

  let text = normalizeText(rawText);

  const city = detectCity(text);
  const categories = detectCategories(text);
    // RULE: Gunakan kategori spesifik jika ada.
  // Jangan tampilkan kategori besar kecuali user menyebutnya langsung.

  const specificCategories = categories.filter(cat =>
    [
      "Coto",
      "Konro",
      "Pallubasa",
      "Pempek",
      "Ikan Bakar",
      "Mie Ayam",
      "Soto",
      "Rawon",
      "Gulai",
      "Rendang",
      "Pindang",
      "Es Krim / Ice Cream",
      "Choipan / Chai Kue",
      "Steak"
    ].includes(cat)
  );

  // Jika ada kategori spesifik → pakai hanya kategori spesifik
  let finalCategories = categories;

  if (specificCategories.length > 0) {
    finalCategories = specificCategories;
  }

  return {
    city,
    categories: finalCategories
  };
  
};

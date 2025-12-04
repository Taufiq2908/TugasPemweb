const express = require("express");
const cors = require("cors");
const path = require("path"); // <--- TAMBAHAN 1: Untuk mengatur path folder
require("dotenv").config();

// Inisialisasi express
const app = express();

// --- MIDDLEWARE ---
app.use(express.json()); // Punya temanmu (baca JSON)
app.use(cors()); // Punya temanmu (izin akses)

// <--- TAMBAHAN 2: Agar Form HTML kamu bisa kirim data (search)
app.use(express.urlencoded({ extended: true })); 

// <--- TAMBAHAN 3: Setup Tampilan (EJS) & CSS
// Pastikan folder 'views' dan 'public' ada di luar folder 'src' (sejajar package.json)
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));


// --- IMPORT ROUTES API (PUNYA TEMANMU - JANGAN DIUBAH) ---
const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const userRoutes = require("./routes/userRoutes");
<<<<<<< HEAD

// Prefix route API
=======
const chatbotRoutes = require("./routes/chatbot.routes");
// Prefix route
>>>>>>> 29f3e0e (update : chatbot fix)
app.use("/auth", authRoutes);
app.use("/cities", cityRoutes);
app.use("/users", userRoutes);
app.use("/places", require("./routes/placeRoutes")); // Hati-hati nama file harus sama
app.use("/categories", require("./routes/categoryRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));
app.use("/wishlists", require("./routes/wishlistRoutes"));
app.use("/smart-search", require("./routes/smartSearchRoutes"));
// app.use("/places", require("./routes/placeSearchRoutes")); // <-- TABRAKAN? Cek catatan di bawah
app.use("/users", require("./routes/userLocationRoutes"));
app.use("/reviews", require("./routes/reviewLikeRoutes"));
app.use("/users", require("./routes/userProfileRoutes"));
app.use("/maps", require("./routes/mapRoutes"));
app.use("/api", chatbotRoutes);

// --- IMPORT ROUTES WEB (PUNYA KAMU) ---
// Pastikan kamu sudah buat file src/routes/viewRoutes.js seperti panduan sebelumnya
const viewRoutes = require("./routes/viewRoutes");

// Gunakan route kamu di root ("/") menggantikan text default temanmu
app.use("/", viewRoutes);


// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("✅ Server Gabungan (Web & API) running on port " + PORT);
});


// --- TEST SUPABASE (Opsional, Boleh dibiarkan) ---
const supabase = require("./supabase/supabaseClient");
app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("cities").select("*").limit(1);
  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true, data });
});
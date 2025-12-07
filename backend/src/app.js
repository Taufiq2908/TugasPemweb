const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Inisialisasi express
const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


// --- IMPORT ROUTES API ---
const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const userRoutes = require("./routes/userRoutes");
const chatbotRoutes = require("./routes/chatbot.routes"); // <--- FIX: Gabungkan dari commit kamu

// Prefix route API
app.use("/auth", authRoutes);
app.use("/cities", cityRoutes);
app.use("/users", userRoutes);
app.use("/places", require("./routes/placeRoutes"));
app.use("/categories", require("./routes/categoryRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));
app.use("/wishlists", require("./routes/wishlistRoutes"));
app.use("/smart-search", require("./routes/smartSearchRoutes"));
// app.use("/places", require("./routes/placeSearchRoutes"));
app.use("/users", require("./routes/userLocationRoutes"));
app.use("/review-likes", require("./routes/reviewLikeRoutes"));
app.use("/users", require("./routes/userProfileRoutes"));
app.use("/maps", require("./routes/mapRoutes"));
app.use("/api", chatbotRoutes); // <--- PENTING agar chatbot aktif


// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("✅ Server Gabungan (Web & API) running on port " + PORT);
});

// --- TEST SUPABASE (Opsional) ---
const supabase = require("./supabase/supabaseClient");
app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("cities").select("*").limit(1);
  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true, data });
});

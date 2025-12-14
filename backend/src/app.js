// backend/src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cityRoutes = require("./routes/cityRoutes");
const foodRoutes = require("./routes/foodRoutes");
const placeRoutes = require("./routes/placeRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const reviewLikeRoutes = require("./routes/reviewLikeRoutes");
const userRoutes = require("./routes/userRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const userLocationRoutes = require("./routes/userLocationRoutes");
const chatbotRoutes = require("./routes/chatbot.routes");
const smartSearchRoutes = require("./routes/smartSearchRoutes");
const placeSearchRoutes = require("./routes/placeSearchRoutes");
const mapRoutes = require("./routes/mapRoutes");
const ownerPlaceRoutes = require("./routes/ownerPlaceRoutes");
const adminPlaceRoutes = require("./routes/adminPlaceRoutes");

const app = express();

// CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "*",

  credentials: true,
};
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API Makanki is running" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/categories", categoryRoutes);
app.use("/cities", cityRoutes);
app.use("/places", placeRoutes);
app.use("/reviews", reviewRoutes);
app.use("/review-likes", reviewLikeRoutes);
app.use("/users", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/profile", userProfileRoutes);
app.use("/location", userLocationRoutes);
app.use("/owner", ownerPlaceRoutes);
app.use("/admin", adminPlaceRoutes);

// Chatbot tetap di /api/chatbot
app.use("/api", chatbotRoutes);

app.use("/smart-search", smartSearchRoutes);
app.use("/search", placeSearchRoutes);
app.use("/maps", mapRoutes);

// --- Supabase test route ---
const  supabase = require("./supabase/supabaseClient");

app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("cities").select("*").limit(1);
  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
  res.json({ success: true, data });
});

// --- LOCAL DEV ONLY: jalankan server jika file ini dijalankan langsung ---
//  node src/app.js  --> jalan di localhost:5000
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// --- EXPORT UNTUK SERVERLESS (Vercel akan pakai ini) ---
module.exports = app;

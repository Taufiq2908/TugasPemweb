const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Inisialisasi express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import Routes
const authRoutes = require("./routes/authRoutes");
const cityRoutes = require("./routes/cityRoutes");
const userRoutes = require("./routes/userRoutes");

// Prefix route
app.use("/auth", authRoutes);
app.use("/cities", cityRoutes);
app.use("/users", userRoutes);

// Route default
app.get("/", (req, res) => {
  res.send("Makan Ki Backend API is running...");
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
const supabase = require("./supabase/supabaseClient");

app.get("/test-supabase", async (req, res) => {
  const { data, error } = await supabase.from("cities").select("*").limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }

  res.json({ success: true, data });
});

const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Inisialisasi express
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Import Firestore
const db = require("./firebase/firebase");

// Test Firestore
app.get("/test-firestore", async (req, res) => {
    try {
        const testRef = db.collection("test").doc("hello");
        await testRef.set({ message: "Firestore Connected!" });

        res.json({ success: true, message: "Firestore connection OK" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Route default
app.get("/", (req, res) => {
    res.send("Makan Ki Backend API is running...");
});

// Jalankan server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});

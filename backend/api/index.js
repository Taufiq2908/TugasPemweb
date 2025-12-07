// backend/api/index.js
// Vercel akan memanggil Express app ini sebagai serverless function

const app = require("../src/app");

// Cukup export app, Vercel sudah paham ini Express
module.exports = app;

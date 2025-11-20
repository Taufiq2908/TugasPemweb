const admin = require("firebase-admin");
const path = require("path");

// path ke file service account
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Firestore DB
const db = admin.firestore();

module.exports = db;

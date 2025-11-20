const db = require("../firebase/firebase");

// =========================
// CREATE CITY
// =========================
exports.addCity = async (req, res) => {
  try {
    const { name, lat, lon } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Nama kota wajib diisi." });
    }

    const newCity = await db.collection("cities").add({
      name,
      lat: lat || null,
      lon: lon || null,
      createdAt: new Date()
    });

    res.json({ id: newCity.id, name, lat, lon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET ALL CITIES
// =========================
exports.getCities = async (req, res) => {
  try {
    const snapshot = await db.collection("cities").orderBy("name").get();
    const cities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(cities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// GET CITY BY ID
// =========================
exports.getCityById = async (req, res) => {
  try {
    const { id } = req.params;

    const cityDoc = await db.collection("cities").doc(id).get();

    if (!cityDoc.exists) {
      return res.status(404).json({ message: "Kota tidak ditemukan." });
    }

    res.json({ id: cityDoc.id, ...cityDoc.data() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// UPDATE CITY
// =========================
exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, lat, lon } = req.body;

    const cityRef = db.collection("cities").doc(id);
    const cityDoc = await cityRef.get();

    if (!cityDoc.exists) {
      return res.status(404).json({ message: "Kota tidak ditemukan." });
    }

    await cityRef.update({
      name,
      lat: lat || null,
      lon: lon || null
    });

    res.json({ message: "Kota berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DELETE CITY
// =========================
exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;

    await db.collection("cities").doc(id).delete();

    res.json({ message: "Kota berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =========================
// DISTANCE HELPERS
// =========================
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // radius bumi (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // km
}

// =========================
// DETECT NEARBY CITY
// =========================
exports.detectNearbyCity = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "lat & lon diperlukan." });
    }

    const snapshot = await db.collection("cities").get();
    const cities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    let nearestCity = null;
    let nearestDist = Infinity;

    cities.forEach(city => {
      if (city.lat == null || city.lon == null) return;

      const dist = getDistance(
        parseFloat(lat),
        parseFloat(lon),
        city.lat,
        city.lon
      );

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCity = city;
      }
    });

    if (!nearestCity) {
      return res.json({ found: false });
    }

    if (nearestDist <= 50) {
      return res.json({
        found: true,
        city: nearestCity.name,
        id: nearestCity.id,
        distanceKm: nearestDist
      });
    }

    return res.json({ found: false });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

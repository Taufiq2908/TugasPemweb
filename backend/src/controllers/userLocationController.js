const supabase = require("../supabase/supabaseClient");
const { sendEmail } = require("../services/emailService");

// Helper: hitung jarak antar 2 titik (km) pakai Haversine
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
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

// Helper: bikin HTML untuk email wishlist (keren + tombol detail)
function buildWishlistEmailHtml(userName, cityName, places) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const cardsHtml = places
    .map((p) => {
      const detailUrl = `${frontendUrl}/places/${p.id}`;

      return `
        <div style="
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          padding: 16px 18px;
          margin-bottom: 12px;
          background: #fff;
        ">
          <h3 style="margin:0 0 6px; font-size:16px; color:#111827;">
            ${p.name || "Restoran Tanpa Nama"}
          </h3>
          ${
            p.address
              ? `<p style="margin:0 0 4px; font-size:13px; color:#4b5563;">
                  📍 ${p.address}
                 </p>`
              : ""
          }
          ${
            p.average_rating
              ? `<p style="margin:0 0 8px; font-size:13px; color:#f59e0b;">
                  ⭐ Rating: ${p.average_rating.toFixed(1)}
                 </p>`
              : ""
          }
          <div style="margin-top:8px;">
            <a href="${detailUrl}" target="_blank"
              style="
                display:inline-block;
                background:#f97316;
                color:white;
                text-decoration:none;
                font-size:13px;
                font-weight:600;
                padding:8px 14px;
                border-radius:999px;
              "
            >
              Lihat Detail Restoran →
            </a>
          </div>
        </div>
      `;
    })
    .join("");

  return `
    <div style="font-family: 'Arial', sans-serif; background:#f3f4f6; padding:24px;">
      <div style="
        max-width:560px;
        margin:auto;
        background:white;
        border-radius:16px;
        box-shadow:0 8px 20px rgba(15,23,42,0.12);
        overflow:hidden;
      ">
        <div style="background:#2563eb; padding:20px 24px;">
          <h1 style="color:white; font-size:22px; margin:0;">🍽 Makan Ki'</h1>
          <p style="color:#dbeafe; margin:4px 0 0; font-size:13px;">
            Rekomendasi kuliner dari wishlist-mu
          </p>
        </div>

        <div style="padding:22px 24px;">
          <p style="color:#111827; font-size:15px; margin:0 0 10px;">
            Halo${userName ? " <strong>" + userName + "</strong>" : ""} 👋
          </p>
          <p style="color:#4b5563; font-size:14px; line-height:1.6; margin:0 0 10px;">
            Kamu saat ini terdeteksi berada di <strong>${cityName}</strong>.
          </p>
          <p style="color:#4b5563; font-size:14px; line-height:1.6; margin:0 0 14px;">
            Sebelumnya kamu pernah menyimpan beberapa restoran di kota ini ke wishlist-mu.
            Mungkin sekarang waktu yang pas untuk mencobanya 😊
          </p>

          <div style="margin:14px 0 8px;">
            ${cardsHtml}
          </div>

          <p style="color:#6b7280; font-size:12px; line-height:1.5; margin-top:12px;">
            Tips: kamu juga bisa membuka aplikasi Makan Ki' dan cek tab <strong>Wishlist</strong>
            untuk melihat semua daftar lengkapnya.
          </p>
        </div>

        <div style="background:#f9fafb; padding:16px 20px; text-align:center;">
          <p style="font-size:11px; color:#9ca3af; margin:0;">
            Email ini dikirim otomatis oleh sistem Makan Ki'. Jangan balas email ini.
          </p>
        </div>
      </div>
    </div>
  `;
}

// ===================================================
// POST /users/check-location
// Body: { user_id, lat, lon }
// ===================================================
exports.checkLocationAndNotify = async (req, res) => {
  try {
    const { user_id, lat, lon } = req.body;

    if (!user_id || lat == null || lon == null) {
      return res.status(400).json({
        error: "user_id, lat, dan lon wajib diisi."
      });
    }

    const userLat = parseFloat(lat);
    const userLon = parseFloat(lon);

    // 1. Ambil data user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, email, name")
      .eq("id", user_id)
      .single();

    if (userError || !user) {
      console.error(userError);
      return res.status(404).json({ error: "User tidak ditemukan." });
    }

    // 2. Ambil semua kota
    const { data: cities, error: citiesError } = await supabase
      .from("cities")
      .select("*");

    if (citiesError) {
      console.error(citiesError);
      return res.status(500).json({ error: citiesError.message });
    }

    if (!cities || cities.length === 0) {
      return res.json({
        detected_city: null,
        wishlist_matches: 0,
        email_sent: false,
        message: "Belum ada data kota."
      });
    }

    // 3. Cari kota terdekat
    let nearestCity = null;
    let nearestDist = Infinity;

    for (const c of cities) {
      if (c.lat == null || c.lon == null) continue;
      const dist = getDistanceKm(userLat, userLon, c.lat, c.lon);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCity = c;
      }
    }

    if (!nearestCity) {
      return res.json({
        detected_city: null,
        wishlist_matches: 0,
        email_sent: false,
        message: "Tidak bisa menentukan kota dari koordinat."
      });
    }

    // Batas jarak masuk kota, misalnya 50 km
    if (nearestDist > 50) {
      return res.json({
        detected_city: nearestCity.name,
        distance_km: nearestDist,
        wishlist_matches: 0,
        email_sent: false,
        message: "Lokasi terlalu jauh dari kota mana pun."
      });
    }

    // 4. Ambil wishlist user dan join dengan places
    const { data: wishlists, error: wishlistError } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        last_notified_at,
        places (
          id,
          name,
          address,
          average_rating,
          city_id
        )
      `
      )
      .eq("user_id", user_id);

    if (wishlistError) {
      console.error(wishlistError);
      return res.status(500).json({ error: wishlistError.message });
    }

    const wishlistInCity = wishlists.filter(
      (w) => w.places && w.places.city_id === nearestCity.id
    );

    if (wishlistInCity.length === 0) {
      return res.json({
        detected_city: nearestCity.name,
        distance_km: nearestDist,
        wishlist_matches: 0,
        email_sent: false,
        message: "Tidak ada wishlist di kota ini."
      });
    }

    // 5. Cek cooldown notifikasi (mis: minimal 1 hari sekali)
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const toNotify = wishlistInCity.filter((w) => {
      if (!w.last_notified_at) return true;
      const last = new Date(w.last_notified_at).getTime();
      return now - last > ONE_DAY_MS;
    });

    if (toNotify.length === 0) {
      return res.json({
        detected_city: nearestCity.name,
        distance_km: nearestDist,
        wishlist_matches: wishlistInCity.length,
        email_sent: false,
        message: "Sudah pernah dikirim notifikasi wishlist baru-baru ini."
      });
    }

    // 6. Susun daftar restoran untuk email
    const placesList = toNotify.map((w) => w.places);

    const subject = `Kamu sedang di ${nearestCity.name}! Cek restoran wishlist-mu 🍽️`;
    const html = buildWishlistEmailHtml(
      user.name,
      nearestCity.name,
      placesList
    );

    await sendEmail(user.email, subject, html);

    // 7. Update last_notified_at
    const idsToUpdate = toNotify.map((w) => w.id);

    const { error: updateError } = await supabase
      .from("wishlists")
      .update({ last_notified_at: new Date().toISOString() })
      .in("id", idsToUpdate);

    if (updateError) {
      console.error(updateError);
      // Email sudah terkirim, kalau update gagal ya cukup dicatat di log
    }

    return res.json({
      detected_city: nearestCity.name,
      distance_km: nearestDist,
      wishlist_matches: wishlistInCity.length,
      notified_count: toNotify.length,
      email_sent: true
    });
  } catch (err) {
    console.error("checkLocationAndNotify error:", err);
    return res.status(500).json({ error: err.message });
  }
};

const jwt = require("jsonwebtoken");
const supabase = require("../supabase/supabaseClient");

// Middleware proteksi route dengan JWT
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Tidak ada token, otorisasi ditolak." });
  }

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ambil user dari Supabase
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, is_verified")
      .eq("id", decoded.id);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    if (!users || users.length === 0) {
      return res.status(401).json({ message: "Pengguna tidak ditemukan." });
    }

    const user = users[0];

    // Simpan ke req.user supaya bisa dipakai controller lain
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.is_verified
    };

    return next();
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau kadaluarsa." });
  }
};

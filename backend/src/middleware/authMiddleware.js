const jwt = require("jsonwebtoken");
const supabase = require("../supabase/supabaseClient");

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Tidak ada token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // =========================
    // ✅ ADMIN (TIDAK PERLU ADA DI DB)
    // =========================
    if (
      decoded.role === "admin" ||
      decoded.email === process.env.ADMIN_EMAIL
    ) {
      req.user = {
        id: "admin",
        name: "Admin",
        email: decoded.email || "admin",
        role: "admin"
      };
      return next();
    }

    // =========================
    // USER / OWNER (WAJIB ADA DI DB)
    // =========================
    if (!decoded.id) {
      return res.status(401).json({ message: "Token tidak valid." });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, is_verified, role")
      .eq("id", decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: "Pengguna tidak ditemukan." });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.is_verified,
      role: user.role // user | owner
    };

    return next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res
      .status(401)
      .json({ message: "Token tidak valid atau kadaluarsa." });
  }
};

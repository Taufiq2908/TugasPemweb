const supabase = require("../supabase/supabaseClient");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendVerificationEmail,
  sendResetPasswordEmail
} = require("../services/emailService");

// Helper: buat JWT
const createToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1d" // 1 hari
  });
};

// =========================
// REGISTER USER
// =========================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, dan password wajib diisi." });
    }

    // Cek apakah email sudah terdaftar
    const { data: existing, error: existingError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email);

    if (existingError) {
      console.error(existingError);
      return res.status(500).json({ error: existingError.message });
    }

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = uuidv4();

    // Insert user baru
    const { data: inserted, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          password_hash: hashedPassword,
          is_verified: false,
          verification_token: verificationToken,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error(insertError);
      return res.status(500).json({ error: insertError.message });
    }

    // Kirim email verifikasi
    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (mailErr) {
      console.error("Gagal kirim email verifikasi:", mailErr.message);
      // user tetap terdaftar, hanya emailnya yang gagal terkirim
    }

    return res.status(201).json({
      message:
        "Registrasi berhasil. Silakan cek email untuk verifikasi akun Anda.",
      user: {
        id: inserted.id,
        name: inserted.name,
        email: inserted.email,
        isVerified: inserted.is_verified
      }
    });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// VERIFY EMAIL
// =========================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token verifikasi tidak ada." });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("verification_token", token)
      .single();

    if (error || !user) {
      return res
        .status(400)
        .json({ message: "Token verifikasi tidak valid atau sudah digunakan." });
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_verified: true,
        verification_token: null
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({ message: "Email berhasil diverifikasi. Silakan login." });
  } catch (err) {
    console.error("verifyEmail error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// LOGIN USER
// =========================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email dan password wajib diisi." });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    if (!users || users.length === 0) {
      return res.status(400).json({ message: "Email atau password salah." });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Email atau password salah." });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Email belum diverifikasi. Silakan cek email Anda."
      });
    }

    const token = createToken(user.id);

    return res.json({
      message: "Login berhasil.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: user.is_verified
      }
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// FORGOT PASSWORD
// =========================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email wajib diisi." });
    }

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    if (!users || users.length === 0) {
      // Demi keamanan, jawabannya tetap sama (tidak bocorkan apakah email terdaftar)
      return res.json({
        message:
          "Jika email terdaftar, link reset password telah dikirim ke email tersebut."
      });
    }

    const user = users[0];
    const resetToken = uuidv4();
    const expireDate = new Date(Date.now() + 60 * 60 * 1000); // 1 jam dari sekarang

    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_password_token: resetToken,
        reset_password_expires: expireDate.toISOString()
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: updateError.message });
    }

    try {
      await sendResetPasswordEmail(email, resetToken);
    } catch (mailErr) {
      console.error("Gagal kirim email reset password:", mailErr.message);
      // tetap balas sukses
    }

    return res.json({
      message:
        "Jika email terdaftar, link reset password telah dikirim ke email Anda."
    });
  } catch (err) {
    console.error("forgotPassword error:", err);
    res.status(500).json({ error: err.message });
  }
};

// =========================
// RESET PASSWORD
// =========================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token dan password baru wajib diisi." });
    }

    const now = new Date().toISOString();

    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("reset_password_token", token)
      .gt("reset_password_expires", now);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: error.message });
    }

    if (!users || users.length === 0) {
      return res
        .status(400)
        .json({ message: "Token reset tidak valid atau sudah kadaluarsa." });
    }

    const user = users[0];
    const hashed = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: hashed,
        reset_password_token: null,
        reset_password_expires: null
      })
      .eq("id", user.id);

    if (updateError) {
      console.error(updateError);
      return res.status(500).json({ error: updateError.message });
    }

    return res.json({
      message: "Password berhasil direset. Silakan login dengan password baru."
    });
  } catch (err) {
    console.error("resetPassword error:", err);
    res.status(500).json({ error: err.message });
  }
};

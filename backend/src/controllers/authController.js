const db = require("../firebase/firebase");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const sendVerificationEmail = require("../services/emailService");

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // cek email sudah ada?
    const userRef = db.collection("users").where("email", "==", email);
    const snapshot = await userRef.get();
    if (!snapshot.empty) {
      return res.status(400).json({ message: "Email sudah terdaftar." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const token = uuidv4();

    await db.collection("users").add({
      name,
      email,
      password: hashed,
      isVerified: false,
      verificationToken: token,
      createdAt: new Date()
    });

    // kirim email verifikasi
    await sendVerificationEmail(email, token);

    res.json({ message: "Registrasi berhasil! Silakan cek email untuk verifikasi." });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    const userRef = db.collection("users").where("verificationToken", "==", token);
    const snapshot = await userRef.get();

    if (snapshot.empty) {
      return res.status(400).send("Token verifikasi tidak valid.");
    }

    const userDoc = snapshot.docs[0];

    await userDoc.ref.update({
      isVerified: true,
      verificationToken: null
    });

    res.send("Email berhasil diverifikasi! Anda dapat login.");

  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRef = db.collection("users").where("email", "==", email);
    const snapshot = await userRef.get();

    if (snapshot.empty) {
      return res.status(400).json({ message: "Email tidak ditemukan." });
    }

    const user = snapshot.docs[0].data();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Password salah." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email belum diverifikasi!" });
    }

    res.json({
      message: "Login berhasil.",
      user: {
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Profil user yang sedang login
exports.getProfile = async (req, res) => {
  try {
    // req.user sudah diisi oleh middleware protect
    const user = req.user;

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified || false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.updateProfile = async (req, res) => {
  const { name, photo_url } = req.body;
  const userId = req.user.id;

  const { error } = await supabase
    .from("users")
    .update({ name, photo_url })
    .eq("id", userId);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
};

exports.getUserPublicProfile = async (req, res) => {
  const userId = req.params.id;

  const { data, error } = await supabase
    .from("users")
    .select("id, name, photo_url, level, review_count, like_received")
    .eq("id", userId)
    .single();

  if (error || !data) return res.status(404).json({ error: "User tidak ditemukan" });

  res.json({ user: data });
};


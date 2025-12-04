const chatbotService = require("../services/chatbot.service");

exports.handleChatbotRequest = async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "message is required" });
    }

    // proses intent → RPC → hasil
    const result = await chatbotService.processMessage(userMessage);

    return res.json(result); // langsung tampilkan list restoran
  } catch (err) {
    console.error("Chatbot Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
  console.log("📥 USER INPUT:", req.body.message);
  console.log("🧠 PARSED RESULT:", result);

};


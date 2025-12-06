const supabase = require("../supabase/supabaseClient");
const { parseUserMessage } = require("./chatbotRuleEngine");

// PURE RULE-BASED — 100% FREE — TANPA OPENAI
module.exports.processMessage = async (text) => {
  try {
    // 1. Parse pesan user → { city, categories }
    const { city, categories } = parseUserMessage(text);

    console.log("Parsed:", { city, categories });

    // 2. Fallback: user tidak menyebut apa pun → tampilkan 20 restoran pertama
    if (!city && categories.length === 0) {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .limit(20);

      if (error) {
        console.error("Fallback error:", error);
        return [];
      }

      return data || [];
    }

    // 3. Panggil Supabase RPC search_places
    const { data, error } = await supabase.rpc("search_places", {
      in_city: city,
      in_categories: categories.length > 0 ? categories : null,
    });

    if (error) {
      console.error("RPC ERROR:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Chatbot Service Error:", err);
    return [];
  }

  console.log("🚀 RPC INPUT:", {
    in_city: city,
    in_categories: categories.length > 0 ? categories : null,
  });
  console.log("📡 RPC OUTPUT:", data, error);

  
};


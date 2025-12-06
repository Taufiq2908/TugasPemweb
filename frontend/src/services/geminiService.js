// src/services/geminiService.js

// Ini adalah fungsi dummy untuk simulasi chat.
// Nantinya Anda bisa ganti dengan panggilan API Gemini yang asli.

export async function* streamCulinaryAdvice(userPrompt) {
  // Simulasi delay berpikir
  await new Promise(resolve => setTimeout(resolve, 1000));

  const responseText = "Halo! Sebagai asisten kuliner Makassar, saya sarankan Anda mencoba Coto Makassar di Jalan Nusantara atau Pallubasa Serigala. Keduanya sangat legendaris!";
  
  // Simulasi streaming karakter per karakter
  const words = responseText.split(" ");
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 100)); // Delay ngetik
    yield { text: word + " " };
  }
}
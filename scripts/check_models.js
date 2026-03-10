const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    // Note: The SDK might not have a direct listModels, we might need a fetch or check docs.
    // In @google/generative-ai, there isn't a direct listModels yet in all versions.
    // Let's try to just test gemini-1.5-pro as an alternative.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent("test");
    console.log("Gemini 1.5 Pro works!");
  } catch (e) {
    console.log("Gemini 1.5 Pro failed:", e.message);
  }
}
listModels();

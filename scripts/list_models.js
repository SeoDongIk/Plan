const fetch = require("node-fetch");
const dotenv = require("dotenv");
dotenv.config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log("Available Models:");
      data.models.forEach(m => console.log(`- ${m.name} (supports: ${m.supportedGenerationMethods.join(", ")})`));
    } else {
      console.log("No models found:", JSON.stringify(data));
    }
  } catch (e) {
    console.log("Fetch failed:", e.message);
  }
}

listModels();

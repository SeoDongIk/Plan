const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log("Using API Key:", apiKey ? "FOUND" : "NOT FOUND");
  
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const prompt = "Hello, testing Gemini API.";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (error) {
    console.error("Error:", error.message);
  }
}

test();

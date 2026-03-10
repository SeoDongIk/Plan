const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  try {
    const result = await model.generateContent("Hello!");
    console.log("Success with gemini-flash-latest:", result.response.text());
  } catch (e) {
    console.log("Failed with gemini-flash-latest:", e.message);
  }
}
test();

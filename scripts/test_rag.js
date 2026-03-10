const path = require('path');
require('ts-node').register({
  compilerOptions: {
    module: "commonjs",
    target: "es2022",
    esModuleInterop: true
  }
});
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../.env') });

const { generateAIContent } = require('../src/lib/ai_generator');

async function testRAGCore() {
  console.log("Starting Core Logic RAG Test...");
  const result = await generateAIContent({
    level: 3,
    topic: "최신 AI 스마트폰",
    count: 1
  });
  
  console.log("\n[Final Gemini Generation Result]");
  console.log(result.variations[0].content);
}

testRAGCore().catch(console.error);

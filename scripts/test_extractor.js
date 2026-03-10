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

const { extractTrendTopics } = require('../src/lib/topic_extractor');

async function testExtractor() {
  console.log("Starting Trend-Driven Topic Extractor Test (N=5)...");
  
  try {
    const result = await extractTrendTopics(5, "AI 업무 자동화");
    
    console.log("\n[Extracted Topics (JSON)]");
    console.log(JSON.stringify(result, null, 2));
    
  } catch (e) {
    console.error("Test Failed:", e);
  }
}

testExtractor();

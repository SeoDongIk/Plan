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

const apiKey = process.env.SERP_API_KEY;

async function testYouTubeRaw() {
  const url = `https://serpapi.com/search.json?q=AI&engine=youtube&api_key=${apiKey}`;
  console.log("Fetching:", url.replace(apiKey, "HIDDEN_KEY"));
  
  const res = await fetch(url);
  const data = await res.json();
  
  if (!res.ok) {
    console.error("HTTP Status:", res.status);
    console.error("Error Response:", data);
  } else {
    console.log("Success! Items:", data.video_results?.length);
  }
}

testYouTubeRaw();

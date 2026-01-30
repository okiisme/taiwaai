const https = require('https');
const fs = require('fs');
const path = require('path');

// Try to read API key from .env.local
let apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
    try {
        const envPath = path.resolve(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/);
        if (match) {
            apiKey = match[1].trim();
        }
    } catch (e) {
        console.log("Could not read .env.local");
    }
}

if (!apiKey) {
    console.error("Error: Could not find GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
    process.exit(1);
}

console.log("Checking available models for your API Key...");

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error(`API Request Failed: ${res.statusCode}`);
            console.error("Body:", data);
            return;
        }

        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("\n✅ Available Models:");
                json.models.forEach(m => {
                    if (m.name.includes('gemini')) {
                        console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
                    }
                });
                console.log("\nPlease tell me which 'gemini' models are in this list.");
            } else {
                console.log("No models found in response.");
            }
        } catch (e) {
            console.error("Error parsing JSON:", e.message);
        }
    });

}).on("error", (err) => {
    console.error("Error: " + err.message);
});

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import fs from "fs";
import path from "path";

// Manually load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, "utf8");
    envConfig.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["'](.*)["']$/, '$1'); // Remove quotes
            process.env[key] = value;
        }
    });
}

async function checkApiKey() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    console.log("Checking API Key...");

    if (!apiKey) {
        console.error("❌ GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local");
        return;
    }

    console.log("✅ API Key found (starts with: " + apiKey.substring(0, 4) + "...)");

    try {
        const google = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        console.log("Attempting to connect to Gemini 1.5 Flash...");
        const result = await generateText({
            model: google("gemini-1.5-flash"),
            prompt: "Hello, can you hear me? Reply with 'Yes'.",
        });

        console.log("✅ Connection Successful!");
        console.log("Response:", result.text);
    } catch (error: any) {
        console.error("❌ Connection Failed!");
        console.error("Error Message:", error.message);

        if (error.message.includes("404") || error.message.includes("not found")) {
            console.error("-> Hint: 'gemini-1.5-flash' might not be enabled. Visit https://aistudio.google.com/ and check 'My Library' or 'Get API key'.");
        } else if (error.message.includes("403")) {
            console.error("-> Hint: API Key is invalid or has no quota. Check Billing or create a new key.");
        }
    }
}

checkApiKey();

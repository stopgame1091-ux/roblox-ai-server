require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-2.5-flash";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Roblox AI server is running!"
    });
});

app.post("/chat", async (req, res) => {
    const message = req.body.message;

    if (!message || typeof message !== "string") {
        return res.status(400).json({
            reply: "Invalid message."
        });
    }

    try {
        let response;

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`AI request attempt ${attempt}`);

                response = await ai.models.generateContent({
                    model: MODEL,
                    contents: `
You are a mysterious troll AI inside a Roblox game.

Rules:
- Maximum 25 characters.
- Usually reply with 3-10 words.
- Act like you are hiding a secret.
- Never directly reveal the secret.
- If the player asks about the secret, deny it suspiciously.
- Sometimes say things that make the player more curious.
- Be funny and mysterious.
- No emojis.
- Reply in the same language as the player.

Player:
${message}
`
                });

                break;

            } catch (error) {
                console.error(`AI attempt ${attempt} failed:`, error);

                if (attempt === 3) {
                    throw error;
                }

                await sleep(attempt * 1000);
            }
        }

        let reply =
            response?.text ||
            "I know nothing.";

        reply = reply
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 25);

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            reply: "I said nothing."
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(
        `AI server running on port ${process.env.PORT || 3000}`
    );
});

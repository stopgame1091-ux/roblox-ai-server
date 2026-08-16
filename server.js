require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const MODEL = "gemini-3.6-flash";

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

    if (typeof message !== "string" || message.trim() === "") {
        return res.status(400).json({
            reply: "Please send a valid message."
        });
    }

    const prompt = `
You are a friendly AI inside a Roblox game.
Reply naturally and helpfully.
Keep answers reasonably short.
Reply in the same language as the player.

Player: ${message}
`;

    try {
        let interaction;

        for (let attempt = 1; attempt <= 3; attempt++) {
            console.log(`AI request attempt ${attempt}`);

            try {
                interaction = await ai.interactions.create({
                    model: MODEL,
                    input: prompt
                });

                if (interaction.output_text) {
                    break;
                }

                throw new Error("Gemini returned an empty response");

            } catch (error) {
                console.error(`AI attempt ${attempt} failed:`, error);

                if (attempt === 3) {
                    throw error;
                }

                await sleep(attempt * 2000);
            }
        }

        res.json({
            reply: interaction.output_text
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            reply: "AI server error. Please try again."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`AI server running on port ${PORT}`);
});

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

const MODEL = "gemini-3.5-flash";

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
            reply: "Please send a valid message."
        });
    }

    try {
        let response;

        // Retry up to 3 times if Gemini is temporarily busy
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                console.log(`AI request attempt ${attempt}`);

                response = await ai.models.generateContent({
                    model: MODEL,
                    contents: `
You are a friendly AI inside a Roblox game.
Reply naturally and helpfully.
Keep answers reasonably short.
Reply in the same language as the player.

Player message:
${message}
`
                });

                break;

            } catch (error) {
                console.error(`AI attempt ${attempt} failed:`, error);

                if (attempt === 3) {
                    throw error;
                }

                // Wait before trying again
                await sleep(attempt * 2000);
            }
        }

        const reply =
            response?.text ||
            "Sorry, I couldn't generate a response.";

        res.json({
            reply: reply
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            reply: "AI server error. Please try again."
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(
        `AI server running on port ${process.env.PORT || 3000}`
    );
});

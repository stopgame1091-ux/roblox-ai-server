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

app.post("/chat", async (req, res) => {
    try {
        const messages = req.body.messages || [];

        const conversation = messages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join("\n");

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `
You are a friendly AI inside a Roblox game.
Reply naturally and helpfully.
Keep answers reasonably short.
Reply in the same language as the player.

Conversation:
${conversation}
`
        });

        res.json({
            reply: response.text || "Sorry, I couldn't generate a response."
        });

    } catch (error) {
        console.error("AI Error:", error);

        res.status(500).json({
            reply: "AI server error"
        });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("AI server running on port 3000");
});
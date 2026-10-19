require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('./'));

const API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/convert', async (req, res) => {
    const text = req.body.text;

    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }

    try {
        // استخدام النموذج المستقر 1.5-flash
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a linguist. Convert the following text into International Phonetic Alphabet (IPA) symbols ONLY, without any extra words: "${text}"` }] }]
            })
        });

        const data = await response.json();
        
        // إذا كان هناك خطأ من جوجل، اطبعه في السجلات
        if (!data.candidates) {
            console.log("GOOGLE_ERROR:", JSON.stringify(data));
            return res.status(500).json({ error: "Failed to convert from Google API" });
        }

        res.json({ result: data.candidates[0].content.parts[0].text });

    } catch (error) {
        console.log("SERVER_ERROR:", error.message);
        res.status(500).json({ error: "Server connection error" });
    }
});

const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`✅ Local server on ${PORT}`));
}
module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// هذا السطر ضروري لكي يفتح المتصفح ملف index.html مباشرة من الخادم
app.use(express.static('./'));

const API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/convert', async (req, res) => {
    const text = req.body.text;

    if (!text) {
        return res.status(400).json({ error: "No text provided" });
    }

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a linguist. Convert the following text into International Phonetic Alphabet (IPA) symbols ONLY, without any extra words: "${text}"` }] }],
                
                // 👇 هذا هو السطر الجديد الذي يسرع الاستجابة ويمنع التأخير
                generationConfig: {
                    thinkingConfig: {
                        thinkingBudget: 0
                    }
                }
            })
        });

        const data = await response.json();
        console.log("DEBUG_GOOGLE_RESPONSE:", JSON.stringify(data));
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            res.json({ result: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "Failed to convert from Google API" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server connection error" });
    }
});

const PORT = process.env.PORT || 3000;

// هذا الشرط يسمح للخادم بالعمل على جهازك فقط (أثناء التطوير)
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running locally on port ${PORT}`);
    });
}

// هذا السطر هو الأهم لـ Vercel: يصدر التطبيق لكي تتولى Vercel تشغيله
module.exports = app;
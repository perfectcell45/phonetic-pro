// 1. استدعاء المكتبات
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 2. تشغيل الخادم
const app = express();
app.use(cors());
app.use(express.json());

// 3. قراءة المفتاح السري من ملف .env
const API_KEY = process.env.GEMINI_API_KEY;

// 4. إنشاء نقطة الاتصال (Endpoint) التي سيستخدمها موقعك
app.post('/api/convert', async (req, res) => {
    const text = req.body.text;

    if (!text) {
        return res.status(400).json({ error: "الرجاء إدخال نص" });
    }

    try {
        // 5. إرسال الطلب إلى جوجل باستخدام المفتاح المخفي
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a linguist. Convert the following text into International Phonetic Alphabet (IPA) symbols ONLY, without any extra words: "${text}"` }] }]
            })
        });

        const data = await response.json();
        
        // 6. إرسال النتيجة إلى موقعك
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            res.json({ result: data.candidates[0].content.parts[0].text });
        } else {
            res.status(500).json({ error: "فشل التحويل من جوجل، قد يكون المفتاح خاطئاً." });
        }
    } catch (error) {
        res.status(500).json({ error: "خطأ في الاتصال بجوجل." });
    }
});

// 7. تشغيل الخادم على المنفذ 3000
const PORT = process.env.PORT || 3000;
// هذا التعديل يجعل الخادم يعمل على جهازك وعلى Vercel في نفس الوقت
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server is running on port ${PORT}`);
    });
}
module.exports = app;
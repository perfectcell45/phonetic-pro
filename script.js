async function convertText() {
    const text = document.getElementById('inputText').value;
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    
    if (!text.trim()) {
        alert("Please enter text first.");
        return;
    }

    resultText.textContent = "Loading... ⏳";
    resultBox.style.display = 'block';

    try {
        // ⚠️ هنا التغيير الأهم: نرسل الطلب إلى خادمنا المحلي (server.js)
        // وليس إلى جوجل مباشرة
        const response = await fetch('http://localhost:3000/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text }) // نرسل النص فقط
        });

        const data = await response.json();

        // النتيجة الآن تأتي من خادمنا
        if (data.result) {
            resultText.textContent = data.result;
        } else {
            resultText.textContent = data.error || "Error occurred.";
        }

    } catch (error) {
        resultText.textContent = "Connection Error: Make sure server is running.";
    }
}

// دالة لتغيير اللهجة (تغير القيمة وتغير لون الزر)
function setAccent(accentCode) {
    // 1. تحديث القيمة المخفية
    document.getElementById('accent').value = accentCode;

    // 2. إزالة اللون النشط من كل الأزرار
    const buttons = document.querySelectorAll('.dialect-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 3. إضافة اللون النشط للزر الذي تم الضغط عليه
    const activeBtn = document.getElementById('btn-' + accentCode);
    if(activeBtn) activeBtn.classList.add('active');
}

// دالة النطق
function speakText() {
    const originalText = document.getElementById('inputText').value;
    if (!originalText.trim()) return;

    const selectedAccent = document.getElementById('accent').value;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(originalText);
    utterance.lang = selectedAccent; 
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
}

// دالة النسخ
function copyText() {
    const text = document.getElementById('resultText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Copied successfully!");
    });
}
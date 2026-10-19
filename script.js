async function convertText() {
    const text = document.getElementById('inputText').value;
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const actionButtons = document.getElementById('actionButtons');
    
    if (!text.trim()) {
        alert("Please enter text first.");
        return;
    }

    // 1. إظهار مؤشر التحميل
    resultBox.style.display = 'block';
    if(actionButtons) actionButtons.style.display = 'none';
    resultText.innerHTML = `<div class="loader-container"><div class="spinner"></div><span>Transcribing...</span></div>`;

    // 👇 2. السر هنا: البحث في الذاكرة قبل إرسال الطلب
    const cacheKey = 'ipa_cache_' + text.trim().toLowerCase();
    const cachedResult = localStorage.getItem(cacheKey);

    if (cachedResult) {
        // إذا كانت الكلمة مترجمة سابقاً، أظهرها فوراً (بدون إنترنت)
        resultText.innerHTML = `<div class="result-ipa">${cachedResult}</div>`;
        if(actionButtons) actionButtons.style.display = 'flex';
        return; // توقف عن التنفيذ، لا داعي لسؤال جوجل
    }

    // 3. إذا لم تكن في الذاكرة، أرسل الطلب لجوجل
    try {
        const response = await fetch('http://localhost:3000/api/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });

        const data = await response.json();

        if (data.result) {
            // أظهر النتيجة
            resultText.innerHTML = `<div class="result-ipa">${data.result}</div>`;
            if(actionButtons) actionButtons.style.display = 'flex';
            
            // 👇 4. احفظ النتيجة في الذاكرة للمرة القادمة
            localStorage.setItem(cacheKey, data.result);
        } else {
            resultText.innerHTML = `<div style="color: red;">Error: ${data.error || "Check API Key"}</div>`;
        }

    } catch (error) {
        resultText.innerHTML = `<div style="color: red;">Connection Error.</div>`;
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
    utterance.rate = 0.5;
    window.speechSynthesis.speak(utterance);
}

// دالة النسخ
function copyText() {
    const text = document.getElementById('resultText').textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Copied successfully!");
    });
}
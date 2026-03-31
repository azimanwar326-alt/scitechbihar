// 1. सेटिंग्स और वेरिएबल्स
let lang = "hi"; 
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questions = [];
window.chapterData = null;

const containerId = "mcq-bilingual-container"; // आपकी नई ID

// 2. डेटा लोड करना
const chapter = document.body.getAttribute('data-page') || "chapter01";

fetch("./mcq-bilingual.json")
    .then(res => {
        if (!res.ok) throw new Error("JSON फाइल नहीं मिली");
        return res.json();
    })
    .then(data => {
        console.log("डेटा सफलतापूर्वक मिला:", chapter);
        if (data.class6 && data.class6[chapter]) {
            window.chapterData = data.class6[chapter];
            
            // सेक्शन्स की जाँच
            const sections = Object.keys(window.chapterData);
            let firstSection = sections.includes("section1") ? "section1" : sections[0];
            
            // शुरूआती लोड
            window.loadSection(firstSection); 
        }
    })
    .catch(err => {
        console.error("Error:", err);
        const div = document.getElementById(containerId);
        if(div) div.innerHTML = `<p style="color:red;">❌ डेटा लोड एरर: ${err.message}</p>`;
    });

// 3. सेक्शन लोड करने का फंक्शन (इसे ग्लोबल रखा है)
window.loadSection = function(sectionName, btn) {
    if (!window.chapterData || !window.chapterData[sectionName]) return;

    // बटन का रंग बदलना
    document.querySelectorAll(".section-buttons button").forEach(b => b.classList.remove("active"));
    if (!btn) {
        // अगर पेज पहली बार लोड हो रहा है तो सही बटन ढूंढें
        btn = document.querySelector(`button[onclick*="'${sectionName}'"]`);
    }
    if (btn) btn.classList.add("active");

    // डेटा सेट करें
    questions = window.chapterData[sectionName];
    currentQuestion = 0;
    score = 0;
    loadQuestion();
};

// 4. प्रश्न दिखाना
function loadQuestion() {
    if (timer) clearInterval(timer);
    timeLeft = 30;
    startTimer();

    const q = questions[currentQuestion];
    if (!q) return;

    // प्रोग्रेस बार और स्कोर
    updateProgress();
    document.getElementById("score").innerText = "Score: " + score;

    let optionsHtml = "";
    q.options.forEach(opt => {
        const selectedText = opt[lang];
        const correctText = q.answer[lang];
        optionsHtml += `
            <button onclick="checkAnswer(this, ${JSON.stringify(selectedText)}, ${JSON.stringify(correctText)})">
                ${selectedText}
                <br><span style="color:#777; font-size:12px;">${lang === "hi" ? opt.en : opt.hi}</span>
            </button>`;
    });

    document.getElementById(containerId).innerHTML = `
        <div class="question-box">
            <h4>Question ${currentQuestion + 1} / ${questions.length}</h4>
            <p><strong>${q.q[lang]}</strong><br><small style="color:gray">${lang === "hi" ? q.q.en : q.q.hi}</small></p>
            <div class="options">${optionsHtml}</div>
        </div>`;
}

// 5. उत्तर चेक करना
window.checkAnswer = function(btn, selected, correct) {
    clearInterval(timer);
    const buttons = document.querySelectorAll(".options button");
    buttons.forEach(b => b.disabled = true);

    const correctAudio = document.getElementById("correctSound");
    const wrongAudio = document.getElementById("wrongSound");

    if (String(selected) === String(correct)) {
        btn.classList.add("correct");
        score++;
        if(correctAudio) { correctAudio.currentTime = 0; correctAudio.play().catch(()=>{}); }
    } else {
        btn.classList.add("wrong");
        if(wrongAudio) { wrongAudio.currentTime = 0; wrongAudio.play().catch(()=>{}); }
        buttons.forEach(b => {
            if (b.innerText.includes(correct)) b.classList.add("correct");
        });
    }
    document.getElementById("score").innerText = "Score: " + score;
    setTimeout(nextQuestion, 2000);
};

// 6. अन्य सपोर्ट फंक्शन
function startTimer() {
    const timerElement = document.getElementById("timer");
    timer = setInterval(() => {
        timeLeft--;
        if(timerElement) timerElement.innerText = `Time: ${timeLeft}s`;
        if (timeLeft <= 0) { clearInterval(timer); nextQuestion(); }
    }, 1000);
}

function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) loadQuestion();
    else showResult();
}

function showResult() {
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    document.getElementById(containerId).innerHTML = `
        <div class="result-box" style="text-align:center; padding:20px; border:2px solid #4A90E2; border-radius:10px;">
            <h2>🎉 क्विज समाप्त!</h2>
            <p style="font-size:1.4em;">आपका स्कोर: <b>${score} / ${total}</b> (${percentage}%)</p>
            <button onclick="location.reload()" style="padding:10px 20px; background:#4A90E2; color:white; border:none; border-radius:5px; cursor:pointer;">🔄 Restart</button>
        </div>`;
}

function updateProgress() {
    const percent = ((currentQuestion + 1) / questions.length) * 100;
    const pb = document.getElementById("progress-bar");
    if (pb) pb.style.width = percent + "%";
}

window.toggleLang = function() {
    lang = (lang === "hi") ? "en" : "hi";
    const btn = document.getElementById("langToggle");
    if(btn) btn.innerText = (lang === "hi") ? "🌐 EN" : "🌐 HI";
    loadQuestion();
};
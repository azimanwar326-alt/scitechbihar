function toggleMenu() {
    // 1. Toggle a class on the icon itself for animation
    const icon = document.querySelector('.hamburger');
    icon.classList.toggle('open');

    // 2. Logic to show/hide your actual menu
    const navLinks = document.querySelector('.nav-links'); // Replace with your menu's class
    navLinks.classList.toggle('active');
}


// ==================== GLOBAL VARIABLES ====================
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questions = [];
let chapterData = null;
let currentLang = "hi";        // "hi" या "en"
let currentSection = "section1";

// Sound
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// ==================== LANGUAGE TOGGLE ====================
function toggleLanguage() {
    currentLang = currentLang === "hi" ? "en" : "hi";
    
    const btn = document.getElementById("lang-toggle");
    if (btn) {
        btn.innerHTML = currentLang === "hi" 
            ? "🇬🇧 English" 
            : "हिंदी 🇮🇳";
    }
    
    loadQuestion(); // वर्तमान प्रश्न को नई भाषा में रीलोड करें
}

// ==================== LOAD QUESTIONS FROM JSON ====================
fetch("mcq.json")
    .then(res => res.json())
    .then(data => {
        window.chapterData = data.class6; // अगर आपकी JSON में class6 है

        const page = window.location.pathname;
        let chapter = "chapter06";

        if (page.includes("01")) chapter = "chapter01";
        else if (page.includes("02")) chapter = "chapter02";
        else if (page.includes("03")) chapter = "chapter03";
        else if (page.includes("04")) chapter = "chapter04";
        else if (page.includes("05")) chapter = "chapter05";
        else if (page.includes("06")) chapter = "chapter06";
        else if (page.includes("07")) chapter = "chapter07";
        else if (page.includes("08")) chapter = "chapter08";

        chapterData = window.chapterData[chapter];

        if (!chapterData) {
            document.getElementById("mcq-container").innerHTML = 
                "<p>❌ Chapter not found</p>";
            return;
        }

        questions = chapterData[currentSection] || [];
        
        if (questions.length > 0) {
            loadQuestion();
            // पहले बटन को active करें
            const firstBtn = document.querySelector(".section-buttons button");
            if (firstBtn) firstBtn.classList.add("active");
        }
    })
    .catch(err => console.error("Error loading JSON:", err));

// ==================== LOAD QUESTION (Bilingual) ====================
function loadQuestion() {
    if (timer) clearInterval(timer);
    timeLeft = 30;
    startTimer();

    const q = questions[currentQuestion];
    if (!q) return;

    updateProgress();

    // Score Update
    const scoreElem = document.getElementById("score");
    if (scoreElem) {
        scoreElem.innerText = currentLang === "hi" 
            ? `स्कोर: ${score}` 
            : `Score: ${score}`;
    }

    const container = document.getElementById("mcq-container");
    if (!container) return;

    const questionText = currentLang === "hi" ? q.q_hi : q.q_en;
    const options = currentLang === "hi" ? q.options_hi : q.options_en;

    let optionsHtml = "";
    options.forEach(opt => {
        optionsHtml += `
            <button onclick="checkAnswer(this, '${opt.replace(/'/g, "\\'")}', '${q.answer}')">
                ${opt}
            </button>`;
    });

    container.innerHTML = `
        <div class="question-box">
            <h3>${currentLang === "hi" ? "प्रश्न" : "Question"} ${currentQuestion + 1}/${questions.length}</h3>
            <p>${questionText}</p>
            <div class="options">${optionsHtml}</div>
        </div>`;
}

// ==================== CHECK ANSWER (Bilingual) ====================
function checkAnswer(btn, selected, correct) {
    const buttons = btn.parentElement.querySelectorAll("button");
    buttons.forEach(b => b.disabled = true);

    const feedback = document.createElement("p");
    feedback.id = "feedback-msg";
    feedback.style.fontWeight = "bold";
    feedback.style.marginTop = "15px";
    feedback.style.textAlign = "center";

    if (String(selected).trim() === String(correct).trim()) {
        btn.classList.add("correct");
        feedback.innerText = currentLang === "hi" 
            ? "बहुत बढ़िया! ✅" 
            : "Excellent! ✅";
        feedback.style.color = "#28a745";
        if (correctSound) correctSound.play();
        score++;
    } else {
        btn.classList.add("wrong");
        feedback.innerText = currentLang === "hi" 
            ? `गलत जवाब! ❌ सही उत्तर: ${correct}` 
            : `Wrong Answer! ❌ Correct Answer: ${correct}`;
        feedback.style.color = "#dc3545";

        if (wrongSound) wrongSound.play();

        // सही उत्तर हाइलाइट करें
        buttons.forEach(b => {
            if (String(b.innerText).trim() === String(correct).trim()) {
                b.classList.add("correct");
            }
        });
    }

    document.querySelector(".question-box").appendChild(feedback);
    
    // Score Update
    document.getElementById("score").innerText = currentLang === "hi" 
        ? `स्कोर: ${score}` 
        : `Score: ${score}`;

    if (timer) clearInterval(timer);
    setTimeout(nextQuestion, 2000);
}

// ==================== NEXT QUESTION ====================
function nextQuestion() {
    currentQuestion++;
    if (currentQuestion < questions.length) {
        loadQuestion();
    } else {
        showResult();
    }
}

// ==================== SHOW RESULT (Bilingual) ====================
function showResult() {
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    
    const grade = percentage >= 60 
        ? (currentLang === "hi" ? "शानदार! 👍" : "Excellent! 👍")
        : (currentLang === "hi" ? "फिर से कोशिश करें 😅" : "Try Again 😅");

    const currentNum = parseInt(currentSection.replace('section', ''));
    const nextSectionName = `section${currentNum + 1}`;
    const hasNextSection = chapterData && chapterData[nextSectionName];

    let resultHtml = `
        <div class="result-box">
            <h2>🎉 ${grade}</h2>
            <p style="font-size: 1.3rem; margin: 15px 0;">
                ${currentLang === "hi" 
                    ? `आपका स्कोर: <b>${score} / ${total}</b> (${percentage}%)` 
                    : `Your Score: <b>${score} / ${total}</b> (${percentage}%)`}
            </p>
            <div class="result-buttons" style="display: flex; gap: 12px; justify-content: center; margin-top: 25px; flex-wrap: wrap;">
                <button onclick="restartQuiz()" style="background:#6c757d; padding:12px 20px;">
                    ${currentLang === "hi" ? "🔄 फिर से शुरू करें" : "🔄 Restart Quiz"}
                </button>
    `;

    if (hasNextSection) {
        resultHtml += `
            <button onclick="loadNextSection('${nextSectionName}')" 
                    style="background:#28a745; padding:12px 20px;">
                ${currentLang === "hi" ? "अगला सेक्शन ➡️" : "Next Section ➡️"}
            </button>`;
    }

    resultHtml += `</div></div>`;

    document.getElementById("mcq-container").innerHTML = resultHtml;
}

// ==================== RESTART QUIZ ====================
function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    loadQuestion();
}

// ==================== LOAD SECTION (Language Maintain) ====================
function loadSection(sectionName, btn) {
    // Remove active from all buttons
    document.querySelectorAll(".section-buttons button").forEach(b => {
        b.classList.remove("active");
    });

    // Activate current button
    if (btn) btn.classList.add("active");

    currentSection = sectionName;
    currentQuestion = 0;
    score = 0;
    
    questions = chapterData[sectionName] || [];

    loadQuestion();
}

// ==================== LOAD NEXT SECTION (Language Maintain) ====================
function loadNextSection(nextSectionName) {
    const nextBtn = document.querySelector(`button[onclick*="loadSection"][onclick*="${nextSectionName}"]`);
    
    if (nextBtn) {
        loadSection(nextSectionName, nextBtn);
    } else {
        // अगर बटन नहीं मिले तो भी सेक्शन लोड कर दें
        loadSection(nextSectionName, null);
    }
}

// ==================== TIMER ====================
function startTimer() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return;

    timerElement.innerText = currentLang === "hi" 
        ? `समय: ${timeLeft}s` 
        : `Time: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = currentLang === "hi" 
            ? `समय: ${timeLeft}s` 
            : `Time: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            const buttons = document.querySelectorAll(".options button");
            buttons.forEach(btn => btn.disabled = true);
            setTimeout(nextQuestion, 1000);
        }
    }, 1000);
}

// ==================== PROGRESS BAR ====================
function updateProgress() {
    const percent = ((currentQuestion + 1) / questions.length) * 100;
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) progressBar.style.width = percent + "%";
}



// इसे बदलें
const namespace = "my-unique-quiz-2026-xyz-123"; 

fetch(`https://api.countapi.xyz/hit/${namespace}/visits`)
  .then(res => res.json())
  .then(data => {
    document.getElementById('count').innerText = data.value;
  })
  .catch(err => {
    // यहाँ आप '0' भी लिख सकते हैं अगर आप चाहते हैं कि फेल होने पर 0 दिखे
    document.getElementById('count').innerText = "1"; 
  });
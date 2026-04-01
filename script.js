/**
 * SciTech Bihar - Bilingual MCQ Quiz Engine (Cleaned Version)
 */

// 1. ग्लोबल वेरिएबल्स (सिर्फ एक बार)
let currentLang = "hi"; 
let chapterData = {};      
let currentQuestions = []; 
let currentQIdx = 0;    
let score = 0;
let timerInterval;
let timeLeft = 30;

const chapterKey = document.body.getAttribute('data-page');
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

// 2. JSON डेटा लोड करना
fetch('./mcq-bilingual.json')
    .then(response => {
        if (!response.ok) throw new Error("JSON फाइल लोड नहीं हो सकी!");
        return response.json();
    })
    .then(data => {
        if (data.class6 && data.class6[chapterKey]) {
            chapterData = data.class6[chapterKey];
            const sections = Object.keys(chapterData);
            if (sections.length > 0) {
                // डिफ़ॉल्ट रूप से Section 1 लोड करें
                loadSection('section1');
            }
        } else {
            showError(`Error: JSON में '${chapterKey}' नहीं मिला।`);
        }
    })
    .catch(err => showError("Loading Error: " + err.message));

// 3. सेक्शन लोड करने का फंक्शन
window.loadSection = function(sectionId, btn) {
    if (!chapterData || !chapterData[sectionId]) return;

    // बटन का एक्टिव स्टेट बदलें
    document.querySelectorAll(".section-buttons button").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    currentQuestions = chapterData[sectionId];
    currentQIdx = 0;
    score = 0;
    updateScoreUI();
    displayQuestion(); 
};




function displayQuestion() {
    const container = document.getElementById('mcq-bilingual-container');
    if (!currentQuestions || currentQuestions.length === 0) return;

    const qData = currentQuestions[currentQIdx];
    const questionText = qData.q[currentLang];
    const options = qData.options;

    // यहाँ (opt, index) लिखना बहुत ज़रूरी है, तभी 'index' काम करेगा
    let optionsHTML = options.map((opt, index) => {
        const optionText = opt[currentLang];
        // यहाँ हमने index को बटन के साथ भेज दिया है
        return `<button class="option-btn" onclick="checkAnswer(${index}, this)">${optionText}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="question-card">
            <p class="question-text"><b>प्रश्न ${currentQIdx + 1}:</b> ${questionText}</p>
            <div class="options-grid">${optionsHTML}</div>
            <div id="feedback-area"></div>
        </div>
    `;
    
    document.getElementById("nextBtn").style.display = "none";
    updateProgress();
}





window.checkAnswer = function(clickedIdx, btn) {
    clearInterval(timerInterval);
    const qData = currentQuestions[currentQIdx];
    
    // JSON में 'answer_index' नहीं है, इसलिए हम options एरे में 
    // सही उत्तर का इंडेक्स (0, 1, 2, या 3) ढूंढेंगे।
    const correctIdx = qData.options.findIndex(opt => opt.hi === qData.answer.hi);
    
    const feedbackArea = document.getElementById("feedback-area");
    const allBtns = document.querySelectorAll(".option-btn");
    
    // सभी बटनों को डिसेबल करें
    allBtns.forEach(b => b.disabled = true);

    if (clickedIdx === correctIdx) {
        // सही उत्तर होने पर
        if (btn) btn.classList.add("correct");
        score++;
        if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => {});
        }
        showFeedback(feedbackArea, true, "सही जवाब!");
    } else {
        // गलत उत्तर होने पर
        if (btn) btn.classList.add("wrong");
        if (wrongSound) {
            wrongSound.currentTime = 0;
            wrongSound.play().catch(e => {});
        }
        
        // सही वाले बटन को हाईलाइट करें (Error Resolve)
        if(allBtns[correctIdx]) {
            allBtns[correctIdx].classList.add("correct");
        }

        // सही उत्तर का टेक्स्ट दिखाएं
        const correctText = qData.answer[currentLang];
        showFeedback(feedbackArea, false, `गलत! सही उत्तर <b>${correctText}</b> है।`);
    }

    updateScoreUI();
    document.getElementById("nextBtn").style.display = "block";
};





// 6. भाषा बदलने का फंक्शन
window.toggleLang = function() {
    currentLang = (currentLang === 'hi') ? 'en' : 'hi';
    const btn = document.getElementById('langToggle');
    if (btn) btn.innerText = (currentLang === 'hi') ? '🌐 EN' : '🌐 HI';
    displayQuestion();
};

// --- बाकी के हेल्पर्स (Helpers) ---
function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            checkAnswer(-1, null); 
        }
    }, 1000);
}

function updateTimerUI() {
    const t = document.getElementById("timer");
    if (t) t.innerText = `Time: ${timeLeft}s`;
}

function updateScoreUI() {
    const s = document.getElementById("score");
    if (s) s.innerText = `Score: ${score}`;
}

function updateProgress() {
    const pb = document.getElementById("progress-bar");
    const pt = document.getElementById("progress-text");
    const progress = ((currentQIdx + 1) / currentQuestions.length) * 100;
    if(pb) pb.style.width = progress + "%";
    if(pt) pt.innerText = `Progress: ${Math.round(progress)}%`;
}

function showFeedback(target, isCorrect, msg) {
    if (!target) return;
    target.innerHTML = `<div class="feedback ${isCorrect ? 'correct-msg' : 'wrong-msg'}">
        <strong>${isCorrect ? '✔️ शाबाश!' : '❌ कोई बात नहीं!'}</strong><br>${msg}
    </div>`;
}

window.nextQuestion = function() {
    currentQIdx++;
    if (currentQIdx < currentQuestions.length) {
        displayQuestion();
    } else {
        showFinalResult();
    }
};

function showFinalResult() {
    const container = document.getElementById('mcq-bilingual-container');
    container.innerHTML = `<div class="result-card"><h2>🎉 क्विज़ समाप्त!</h2><p>स्कोर: ${score} / ${currentQuestions.length}</p><button onclick="location.reload()">फिर से शुरू करें</button></div>`;
    document.getElementById("nextBtn").style.display = "none";
}

function showError(msg) {
    const container = document.getElementById('mcq-bilingual-container');
    if (container) container.innerHTML = `<div class="error">${msg}</div>`;
}



function toggleMenu() {
    const menuIcon = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav-links'); // मेनू को सिलेक्ट करें
    console.log("Menu clicked!"); // ब्राउज़र के Console (F12) में चेक करें
    menuIcon.classList.toggle('open');
    nav.classList.toggle('active'); // मेनू को दिखाएँ/छुपाएँ
}


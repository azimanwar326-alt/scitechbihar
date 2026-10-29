/**
 * SciTech Bihar - Universal Bilingual MCQ Quiz Engine
 */

// 1. ग्लोबल वेरिएबल्स
// 1. ग्लोबल वेरिएबल्स के पास इसे जोड़ें
let currentLang = "hi"; 
let chapterData = {};      
let currentQuestions = []; 
let currentQIdx = 0;    
let score = 0;
let timerInterval; // <--- यह लाइन सुनिश्चित करें कि यहाँ लिखी हो
let timeLeft = 30;

// URL पैरामीटर हटा दिए गए हैं। अब डेटा सीधे HTML के body attributes से लिया जाएगा।
const classNum = document.body.getAttribute('data-class') || '6' || '6cbse'; 
const subject = document.body.getAttribute('data-sub') || 'sci'; 

// डायनामिक फाइल का नाम और डेटा की 'Key' तय करना
// अगर class 6 है तो 'mcq-bilingual.json' अन्यथा 'sci7-bilingual.json' आदि



const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");




const board = document.body.dataset.board;

const fileName = {
    cbse: "sc6cbse-bilingual.json",
    biharboard: "sc6biharboard-bilingual.json"
}[board];

const classKey = board === "biharboard"
    ? `class${classNum}biharboard`
    : `class${classNum}`;
const chapterKey = document.body.getAttribute("data-page");

if (!fileName) {
    showError("Unknown board: " + board);
} else {
    fetch(fileName)
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    `${fileName} लोड नहीं हुई: ${response.status}`
                );
            }
            return response.json();
        })
        .then(data => {
            console.log("MCQ JSON loaded:", board, data);
            console.log("CLASS:", classKey);
            console.log("CHAPTER:", chapterKey);
            console.log("CLASS DATA:", data[classKey]);

            if (
                data[classKey] &&
                data[classKey][chapterKey]
            ) {
                chapterData = data[classKey][chapterKey];

                console.log("CHAPTER DATA:", chapterData);

                const sections = Object.keys(chapterData);

                if (sections.length > 0) {
                    loadSection("section1");
                } else {
                    showError("इस अध्याय में कोई सेक्शन नहीं मिला।");
                }
            } else {
                showError(
                    `त्रुटि: ${classKey} के अंदर '${chapterKey}' नहीं मिला।`
                );
            }
        })
        .catch(err => {
            console.error("MCQ loading error:", err);
            showError("Loading Error: " + err.message);
        });
}

window.loadSection = function(sectionId, btn) {

    if (!chapterData || !chapterData[sectionId]) return;

    document.querySelectorAll(".section-buttons button")
        .forEach(b => b.classList.remove("active"));

    if (btn) {
        btn.classList.add("active");
    }

    currentQuestions = chapterData[sectionId];
    currentQIdx = 0;
    score = 0;

    updateScoreUI();
    displayQuestion();

};

function startTimer() {
    clearInterval(timerInterval);

    timeLeft = 30;

    const timerEl = document.getElementById("timer");

    if (!timerEl) {
        console.log("❌ Timer element नहीं मिला");
        return;
    }

    timerEl.innerText = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            nextQuestion();
        }
    }, 1000);
}

// 4. प्रश्न दिखाने का फंक्शन (आपका पुराना लॉजिक)
function displayQuestion() {
    const container = document.getElementById('mcq-bilingual-container');
    if (!currentQuestions || currentQuestions.length === 0) return;

    const qData = currentQuestions[currentQIdx];
    const questionText = qData.q[currentLang];
    const options = qData.options;

    let optionsHTML = options.map((opt, index) => {
        const optionText = opt[currentLang];
        return `<button class="option-btn" onclick="checkAnswer(${index}, this)">${optionText}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="question-card">
        <p>⏱️ Time: <span id="timer">30</span> sec</p>
            <p class="question-text"><b>प्रश्न ${currentQIdx + 1}:</b> ${questionText}</p>
            <div class="options-grid">${optionsHTML}</div>
            <div id="feedback-area"></div>
        </div>
    `;
    
    document.getElementById("nextBtn").style.display = "none";
    updateProgress();

     // ✅ यहीं timer start करें
    startTimer();
}


window.checkAnswer = function(clickedIdx, btn) {
    clearInterval(timerInterval);
    const qData = currentQuestions[currentQIdx];
    
    // सुधार: .trim() का उपयोग करें ताकि एक्स्ट्रा स्पेस की वजह से मैच फेल न हो
   const correctIdx = qData.options.findIndex(opt => 
  opt[currentLang].trim() === qData.answer[currentLang].trim()
);
    
    const feedbackArea = document.getElementById("feedback-area");
    const allBtns = document.querySelectorAll(".option-btn");
    
    // सभी बटनों को डिसेबल करें
    allBtns.forEach(b => b.disabled = true);

    if (clickedIdx === correctIdx) {
        if (btn) btn.classList.add("correct");
        score++;
        if (correctSound) { 
            correctSound.currentTime = 0; 
            correctSound.play().catch(e => console.log("Sound Error")); 
        }
        showFeedback(feedbackArea, true, "सही जवाब!");
    } else {
        if (btn) btn.classList.add("wrong");
        if (wrongSound) { 
            wrongSound.currentTime = 0; 
            wrongSound.play().catch(e => console.log("Sound Error")); 
        }
        
        // सही वाले बटन को हमेशा हाईलाइट करें
        if(allBtns[correctIdx]) {
            allBtns[correctIdx].classList.add("correct");
        }
        
        const correctText = qData.answer[currentLang];
        showFeedback(feedbackArea, false, `गलत! सही उत्तर <b>${correctText}</b> है।`);
    }

    updateScoreUI();
    
    // सुनिश्चित करें कि Next बटन दिखाई दे
    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) {
        nextBtn.style.display = "block";
    }
};


// --- बाकी हेल्पर्स (बिना बदलाव के) ---
window.toggleLang = function() {
    currentLang = (currentLang === 'hi') ? 'en' : 'hi';
    const btn = document.getElementById('langToggle');
    if (btn) btn.innerText = (currentLang === 'hi') ? '🌐 EN' : '🌐 HI';
    displayQuestion();
};

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





document.addEventListener("DOMContentLoaded", () => {

    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {

        hamburger.classList.toggle("active");
        navLinks.classList.toggle("active");

    });
    }
});





const blogGrid = document.querySelector(".blog-grid");

if (blogGrid && typeof blogs !== "undefined") {
    const latestBlogs = blogs.slice(0, 4);

    latestBlogs.forEach(blog => {
        blogGrid.innerHTML += `
            DIL0
        `;
    });
}


function getBoxAnimation() {
  const animations = document.getAnimations();
  return animations[0]; // यह पहला एनिमेशन पकड़ता है
}

function pauseAnimation() {
  const anim = getBoxAnimation();
  if (anim) anim.pause();
}

function playAnimation() {
  const anim = getBoxAnimation();
  if (anim) anim.play();
}
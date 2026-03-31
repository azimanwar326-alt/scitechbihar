/**
 * SciTech Bihar - Bilingual MCQ Quiz Engine
 * सभी सेटिंग्स mcq-bilingual.json के अनुसार अपडेट की गई हैं।
 */

// 1. ग्लोबल वेरिएबल्स
let currentLang = "hi"; 
let questions = [];     
let currentQIdx = 0;
let score = 0;
let timerInterval;
let timeLeft = 30;
let chapterData = null;

// HTML एलिमेंट्स (IDs)
// हमने इसे "mcq-bilingual-container" में बदल दिया है ताकि यह आपकी HTML फाइल से मैच करे
const containerId = "mcq-bilingual-container"; 
const correctSound = document.getElementById("correctSound");
const wrongSound = document.getElementById("wrongSound");

// 2. वर्तमान चैप्टर की पहचान (Body के data-page से)
const chapterKey = document.body.getAttribute('data-page');

console.log("Loading Chapter:", chapterKey);

// 3. JSON डेटा लोड करना
fetch('./mcq-bilingual.json')
    .then(response => {
        if (!response.ok) throw new Error("JSON फाइल लोड नहीं हो सकी!");
        return response.json();
    })
    .then(data => {
        // 'class6' के अंदर चैप्टर की जाँच
        if (data.class6 && data.class6[chapterKey]) {
            chapterData = data.class6[chapterKey];
            
            // उपलब्ध सेक्शन्स की सूची (जैसे section1, section2)
            const sections = Object.keys(chapterData);
            if (sections.length > 0) {
                // डिफ़ॉल्ट रूप से पहला उपलब्ध सेक्शन लोड करें
                const defaultSection = sections.includes("section1") ? "section1" : sections[0];
                loadSection(defaultSection);
            }
        } else {
            showError(`Error: JSON में '${chapterKey}' नहीं मिला। <br> 
                      HTML में data-page="${chapterKey}" है, कृपया JSON फाइल चेक करें।`);
        }
    })
    .catch(err => {
        showError("Loading Error: " + err.message);
    });





// 4. सेक्शन लोड करने का फंक्शन
window.loadSection = function(sectionId, btn) {
    if (!chapterData || !chapterData[sectionId]) return;

    // बटन का एक्टिव स्टेट बदलें
    document.querySelectorAll(".section-buttons button").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");

    questions = chapterData[sectionId];
    currentQIdx = 0;
    score = 0;
    
    updateScoreUI();
    loadQuestion();
};

// 5. प्रश्न को स्क्रीन पर रेंडर करना
function loadQuestion() {
    if (!questions || questions.length === 0) return;

    clearInterval(timerInterval);
    timeLeft = 30;
    updateTimerUI();
    startTimer();

    const qData = questions[currentQIdx];
    const container = document.getElementById(containerId);
    
    if (!container) return;

    updateProgress();

    // Bilingual Data (q.hi, options[i].hi)
    const qText = qData.q[currentLang];
    const options = qData.options;

    let optionsHTML = options.map((opt) => {
        const text = opt[currentLang];
        // जावास्क्रिप्ट एरर से बचने के लिए ' को एस्केप करें
        const safeText = text.replace(/'/g, "\\'");
        return `<button class="option-btn" onclick="checkAnswer('${safeText}', this)">${text}</button>`;
    }).join('');

    container.innerHTML = `
        <div class="question-card" style="animation: fadeIn 0.4s ease;">
            <p class="question-text"><b>प्रश्न ${currentQIdx + 1}:</b> ${qText}</p>
            <div class="options-grid">${optionsHTML}</div>
            <div id="feedback-area"></div>
        </div>
    `;

    document.getElementById("nextBtn").style.display = "none";
}





// 6. उत्तर की जाँच (यहाँ साउंड और मैसेज काम करेगा)
window.checkAnswer = function(selectedOption, btn) {
    clearInterval(timerInterval);
    const qData = questions[currentQIdx];
    const correctAnswer = qData.answer[currentLang];
    const feedbackArea = document.getElementById("feedback-area");
    
    const allBtns = document.querySelectorAll(".option-btn");
    allBtns.forEach(b => b.disabled = true);

    if (selectedOption === correctAnswer) {
        // सही उत्तर होने पर
        if (btn) btn.classList.add("correct");
        score++;
        
        // साउंड बजाना
        if (correctSound) {
            correctSound.currentTime = 0;
            correctSound.play().catch(e => console.log("Sound error"));
        }
        
        showFeedback(feedbackArea, true, qData.explanation ? qData.explanation[currentLang] : "सही जवाब!");
    } else {
        // गलत उत्तर होने पर
        if (btn) btn.classList.add("wrong");
        
        if (wrongSound) {
            wrongSound.currentTime = 0;
            wrongSound.play().catch(e => console.log("Sound error"));
        }
        
        // सही उत्तर हाईलाइट करें
        allBtns.forEach(b => {
            if (b.innerText.trim() === correctAnswer.trim()) b.classList.add("correct");
        });

        const msg = qData.explanation ? qData.explanation[currentLang] : "";
        showFeedback(feedbackArea, false, `गलत! सही उत्तर <b>${correctAnswer}</b> है। <br>${msg}`);
    }

    updateScoreUI();
    document.getElementById("nextBtn").style.display = "block";
};

// 7. UI और प्रोग्रेस ट्रैकर्स
function showFeedback(target, isCorrect, msg) {
    if (!target) return;
    target.innerHTML = `
        <div style="margin-top:15px; padding:15px; border-radius:10px; 
                    background: ${isCorrect ? '#e8f5e9' : '#ffebee'}; 
                    color: ${isCorrect ? '#2e7d32' : '#c62828'};
                    border-left: 6px solid ${isCorrect ? '#4caf50' : '#f44336'};
                    font-size: 0.95rem;">
            <strong>${isCorrect ? '✔️ शाबाश!' : '❌ कोई बात नहीं!'}</strong><br>${msg}
        </div>
    `;
}





function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerUI();
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            window.checkAnswer(null, null); 
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
    const progress = ((currentQIdx + 1) / questions.length) * 100;
    if(pb) pb.style.width = progress + "%";
    if(pt) pt.innerText = `Progress: ${Math.round(progress)}%`;
}

function showError(msg) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div style="color:red; background:#fee; padding:20px; border:1px solid red; border-radius:8px;">${msg}</div>`;
    }
}

// 8. नेविगेशन
window.nextQuestion = function() {
    currentQIdx++;
    if (currentQIdx < questions.length) {
        loadQuestion();
    } else {
        showFinalResult();
    }
};

function showFinalResult() {
    const container = document.getElementById(containerId);
    const total = questions.length;
    const percent = Math.round((score / total) * 100);
    
    container.innerHTML = `
        <div style="text-align:center; padding:30px; background:white; border-radius:15px; box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color:#003366;">🎉 क्विज़ समाप्त!</h2>
            <p style="font-size:1.6rem;">स्कोर: <b>${score} / ${total}</b></p>
            <p>सफलता दर: ${percent}%</p>
            <button onclick="location.reload()" style="padding:10px 30px; background:#003366; color:white; border:none; border-radius:50px; cursor:pointer; font-size:1.1rem; margin-top:20px;">🔄 फिर से शुरू करें</button>
        </div>
    `;
    document.getElementById("nextBtn").style.display = "none";
}
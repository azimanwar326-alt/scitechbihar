// Global variables
let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questions = [];
let chapterData = null;

// Sound
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// URL से chapter detect
const page = window.location.pathname;
let chapter = "chapter06"; // default
let currentSection = "section1";

if (page.includes("05")) chapter = "chapter05";
else if (page.includes("06")) chapter = "chapter06";
else if (page.includes("07")) chapter = "chapter07";




// 1. Load questions from JSON
fetch("mcq.json")
  .then(res => res.json())
  .then(data => {
    window.chapterData = data.class6[chapter];

    if (!window.chapterData) {
      document.getElementById("mcq-container").innerHTML = "<p>❌ Chapter not found</p>";
      return;
    }

    // JSON स्ट्रक्चर के हिसाब से डेटा सेट करना
    if (Array.isArray(window.chapterData)) {
      questions = window.chapterData;
    } else {
      questions = window.chapterData[currentSection] || [];
    }

    if (questions.length > 0) {
      loadQuestion();

      // पहले बटन को active दिखाने के लिए (Optional)
      const firstBtn = document.querySelector(".section-buttons button");
      if(firstBtn) firstBtn.classList.add("active");
    }
  })
  .catch(err => console.error("Error loading JSON:", err));




// 2. Load individual question
function loadQuestion() {
  if (timer) clearInterval(timer);
  timeLeft = 30;
  startTimer(); // यहाँ कॉल हो रहा है
  
  const q = questions[currentQuestion];
  if (!q) return;
  
  updateProgress();
 
  // 🔥 यहाँ बदलाव करें
  const scoreElem = document.getElementById("score");
  if (scoreElem) {
    scoreElem.innerText = "Score: " + score;
  }
  const container = document.getElementById("mcq-container");
  if (!container) return;
  
  let optionsHtml = "";
  q.options.forEach(opt => {
    // JSON में 'answer' की (key) है, इसलिए q.answer भेजा
    optionsHtml += `
      <button onclick="checkAnswer(this, '${opt}', '${q.answer}')">
        ${opt}
      </button>
    `;
  });
  
  container.innerHTML = `
    <div class="question-box">
      <h3>Question ${currentQuestion + 1}/${questions.length}</h3>
      <p>${q.q}</p> 
      <div class="options">
        ${optionsHtml}
      </div>
    </div>
  `;
}




function loadSection(sectionName, btn) {
    // 1. पुराने 'active' बटन से हाईलाइट हटाएँ
    document.querySelectorAll(".section-buttons button").forEach(b => {
        b.classList.remove("active");
    });

    // 2. अभी वाले बटन को 'active' (Orange) बनाएँ
    btn.classList.add("active");

    // 3. डेटा सेट करें
    currentSection = sectionName;
    currentQuestion = 0;
    score = 0;
    questions = window.chapterData[sectionName];
    
    // 4. पहला सवाल लोड करें
    loadQuestion();
}




// 3. Start Timer Function (यह सबसे ज़रूरी है)
function startTimer() {
  const timerElement = document.getElementById("timer");
  if (!timerElement) return;

  timerElement.innerText = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerElement.innerText = `Time: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      const buttons = document.querySelectorAll(".options button");
      buttons.forEach(btn => btn.disabled = true);
      setTimeout(nextQuestion, 1000);
    }
  }, 1000);
}




function checkAnswer(btn, selected, correct) {
  const buttons = btn.parentElement.querySelectorAll("button");
  buttons.forEach(b => b.disabled = true);

  // फीडबैक मैसेज के लिए एक नया एलिमेंट बनाएँ
  const feedback = document.createElement("p");
  feedback.id = "feedback-msg";
  feedback.style.fontWeight = "bold";
  feedback.style.marginTop = "10px";
  feedback.style.textAlign = "center";

  if (String(selected) === String(correct)) {
    btn.classList.add("correct");
    feedback.innerText = "बहुत बढ़िया! ✅";
    feedback.style.color = "#28a745"; // हरा रंग
    if(correctSound) correctSound.play();
    score++;
  } else {
    btn.classList.add("wrong");
    feedback.innerText = "गलत जवाब! ❌ सही उत्तर: " + correct;
    feedback.style.color = "#dc3545"; // लाल रंग
    if(wrongSound) wrongSound.play();
    
    // सही उत्तर वाले बटन को भी हाईलाइट करें
    buttons.forEach(b => {
      if (String(b.innerText).trim() === String(correct).trim()) {
        b.classList.add("correct");
      }
    });
  }

  // मैसेज को स्क्रीन पर दिखाएँ
  document.querySelector(".question-box").appendChild(feedback);

  document.getElementById("score").innerText = "Score: " + score;
  if (timer) clearInterval(timer);
  
  // 2 सेकंड बाद अगले प्रश्न पर जाएँ
  setTimeout(nextQuestion, 2000);
}





// 5. Next Question
function nextQuestion() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResult();
  }
}


// 6. Show Result (Updated Version)
function showResult() {
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  let grade = percentage >= 60 ? "शानदार! 👍" : "फिर से कोशिश करें 😅";

  // पता करें कि अगला सेक्शन कौन सा है (जैसे section1 -> section2)
  const currentNum = parseInt(currentSection.replace('section', ''));
  const nextSectionName = 'section' + (currentNum + 1);
  
  // चेक करें कि क्या अगला सेक्शन JSON डेटा में है
  const hasNextSection = window.chapterData && window.chapterData[nextSectionName];

  let resultHtml = `
    <div class="result-box">
      <h2>🎉 ${grade}</h2>
      <p style="font-size: 1.2rem; margin: 10px 0;">आपका स्कोर: <b>${score} / ${total}</b> (${percentage}%)</p>
      
      <div class="result-buttons" style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button onclick="location.reload()" style="background:#6c757d;">🔄 Restart</button>
  `;

  // अगर अगला सेक्शन मौजूद है, तो ही "Next Section" बटन दिखाएँ
  if (hasNextSection) {
    resultHtml += `
      <button onclick="loadNextSection('${nextSectionName}')" style="background:#28a745;">
        Next Section ➡️
      </button>`;
  }

  resultHtml += `</div></div>`;
  document.getElementById("mcq-container").innerHTML = resultHtml;
}

// अगला सेक्शन लोड करने के लिए नया फंक्शन
function loadNextSection(nextSectionName) {
    // UI में बटन को ढूंढें ताकि उसे 'active' कर सकें
    const nextBtn = document.querySelector(`button[onclick*="'${nextSectionName}'"]`);
    loadSection(nextSectionName, nextBtn);
}




// 7. Update Progress
function updateProgress() {
  const percent = ((currentQuestion + 1) / questions.length) * 100;
  const progressBar = document.getElementById("progress-bar");
  if (progressBar) progressBar.style.width = percent + "%";
}
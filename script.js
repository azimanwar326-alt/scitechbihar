function toggleMenu() {
const nav = document.getElementById("navLinks");
nav.classList.toggle("active");
}


function toggleSearch() {
    const searchBox = document.getElementById("searchBox");
    searchBox.classList.toggle("active");
    
    // अगर सर्च बॉक्स खुल जाए, तो ऑटोमैटिक कर्सर वहां चला जाए
    if (searchBox.classList.contains("active")) {
        searchBox.querySelector("input").focus();
    }
}


fetch("latest-letter.html")
.then(response => response.text())
.then(data => {
const letterBox = document.getElementById("latestLetter");

if (letterBox && data) {
  letterBox.innerHTML = data;
}
});



let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questions = [];

// 🔊 sound
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// 👇 URL से chapter detect
const page = window.location.pathname;

let chapter = "chapter06"; // default

if (page.includes("05")) chapter = "chapter05";
else if (page.includes("06")) chapter = "chapter06";
else if (page.includes("07")) chapter = "chapter07";

// 👇 fetch system
fetch("mcq.json")
  .then(res => res.json())
  .then(data => {

     questions = data.class6[chapter];

function updateProgress() {

  if (!questions || questions.length === 0) return; // 🔥 safety

  const percent = ((currentQuestion) / questions.length) * 100;

  document.getElementById("progress-bar").style.width = percent + "%";
  document.getElementById("progress-text").innerText =
    "Progress: " + Math.round(percent) + "%";
}


    // 👇 यहीं डालें (IMPORTANT)
    console.log("Data:", data);
    console.log("Chapter:", chapter);
    console.log("Questions:", data.class6[chapter]);

    const questionsData = data.class6[chapter];

    if (!questionsData || questionsData.length === 0) {
      document.getElementById("mcq-container").innerHTML =
        "<p>❌ Questions not found</p>";
      return;
    }

    questions = questionsData;
    loadQuestion();

  })
  .catch(err => console.log(err));




function loadQuestion() {
  clearInterval(timer);
  timeLeft = 30;
  startTimer();

  const container = document.getElementById("mcq-container");

  if (!container) {
    console.log("❌ mcq-container नहीं मिला");
    return;
  }

  const q = questions[currentQuestion];

  if (!q) {
    container.innerHTML = "<p>❌ Question load नहीं हुआ</p>";
    return;
  }

  // 👇 पूरा HTML एक बार में डालें
  container.innerHTML = `
    <div class="mcq">
      <p><strong>Q${currentQuestion + 1}. ${q.q}</strong></p>
      <div id="options">
        ${q.options.map((opt, i) =>
          `<button onclick="checkAnswer(this, '${opt}', '${q.answer}')">${opt}</button>`
        ).join("")}
      </div>
      <p id="result"></p>
    </div>
  `;
}



function checkAnswer(btn, selected, correct) {
  const buttons = btn.parentElement.querySelectorAll("button");

  // सभी buttons disable करें
  buttons.forEach(b => b.disabled = true);

  if (selected === correct) {
    btn.classList.add("correct");
    correctSound.play();
    score++;
  } else {
    btn.classList.add("wrong");
    wrongSound.play();

    // सही answer highlight करें
    buttons.forEach(b => {
      if (b.innerText === correct) {
        b.classList.add("correct");
      }
    });
  }

  document.getElementById("score").innerText = "Score: " + score;

  // ⏭️ 2 सेकंड बाद next question
  setTimeout(nextQuestion, 2000);
}


function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    let grade = "";
    if (percentage >= 90) {
      grade = "Excellent 🏆";
    } else if (percentage >= 60) {
      grade = "Good 👍";
    } else {
      grade = "Try Again 😅";
    }

    // ✅ progress complete
    document.getElementById("progress-bar").style.width = "100%";
    document.getElementById("progress-text").innerText = "Completed ✅";

    // ✅ new result UI
    document.getElementById("mcq-container").innerHTML = `
      <div class="result-box">
        <h2>🎉 Quiz Finished</h2>
        <p><strong>Score:</strong> ${score}/${total}</p>
        <p><strong>Percentage:</strong> ${percentage}%</p>
        <p><strong>Grade:</strong> ${grade}</p>

        <button onclick="location.reload()">🔄 Restart Quiz</button>
      </div>
    `;
  }
}
  


function startTimer() {
  document.getElementById("timer").innerText = `Time: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").innerText = `Time: ${timeLeft}s`;

    if (timeLeft === 0) {
      clearInterval(timer);
      nextQuestion();
    }
  }, 1000);
}

function showResult() {
  const container = document.getElementById("mcq-container");

  container.innerHTML = `
    <h2>🎉 Quiz Complete!</h2>
    <h3>Score: ${score} / ${questions.length}</h3>
  `;
}



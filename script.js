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
document.getElementById("latestLetter").innerHTML = data;
});



let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 30;
let questions = [];

// 🔊 sound
const correctSound = new Audio("correct.mp3");
const wrongSound = new Audio("wrong.mp3");

// ✅ single fetch (ONLY ONE)
fetch("mcq.json")
  .then(res => res.json())
  .then(data => {
    questions = data;
    loadQuestion();
  })
  .catch(err => console.log(err));


function loadQuestion() {
  clearInterval(timer);
  timeLeft = 30;
  startTimer();

  const container = document.getElementById("mcq-container");

  // ✅ safety check
  if (!container) {
    console.log("mcq-container not found ❌");
    return;
  }

  // ✅ question check
  if (!questions[currentQuestion]) {
    console.log("Question not found ❌");
    return;
  }

  container.innerHTML = "";

  const q = questions[currentQuestion];

  const div = document.createElement("div");
  div.classList.add("mcq");

  div.innerHTML = `
    <p><strong>Q${currentQuestion + 1}. ${q.q}</strong></p>
    ${q.options.map(opt =>
      `<button onclick="checkAnswer(this, '${q.answer}')">${opt}</button>`
    ).join("")}
    <p id="result"></p>
  `;

  container.appendChild(div);
}


function checkAnswer(btn, correctAnswer) {
  clearInterval(timer);

  const result = btn.parentElement.querySelector("#result");
  const buttons = document.querySelectorAll("#mcq-container button");

  buttons.forEach(b => {
    b.disabled = true;
  });

  if (btn.innerText.trim() === correctAnswer.trim()) {
    result.innerHTML = "✅ सही उत्तर";
    result.style.color = "green";
    score++;

    correctSound.currentTime = 0;
    correctSound.play().catch(()=>{});

  } else {
    result.innerHTML = `❌ गलत! सही: ${correctAnswer}`;
    result.style.color = "red";

    wrongSound.currentTime = 0;
    wrongSound.play().catch(()=>{});
  }

  document.getElementById("score").innerText = `Score: ${score}`;

  setTimeout(() => {
    nextQuestion();
  }, 1500);
}


function nextQuestion() {
  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion();
  } else {
    showResult();
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



// 🌐 Language
let currentLang = "hi";

// 📊 Data
let questions = [];
let currentQuestion = 0;

// 📥 Get chapter from URL
const params = new URLSearchParams(window.location.search);
const chapter = params.get("chapter") || "chapter01";
const currentSection = "section1";

// 📦 Load JSON
fetch("mcq_bilingual.json")
  .then(res => res.json())
  .then(data => {

    const chapterData = data.class6[chapter];

    if (!chapterData) {
      document.getElementById("mcq-container").innerHTML = "<p>❌ Chapter not found</p>";
      return;
    }

    questions = chapterData[currentSection] || [];

    if (questions.length > 0) {
      loadQuestion();
    }
  })
  .catch(err => console.error("Error loading JSON:", err));

// 📘 Load Question
function loadQuestion() {
  const q = questions[currentQuestion];

  document.getElementById("question").innerText = q.q[currentLang];

  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt[currentLang];

    btn.onclick = () => checkAnswer(opt[currentLang], q.answer[currentLang]);

    optionsDiv.appendChild(btn);
  });
}



function checkAnswer(selected, correct) {
  if (selected === correct) {
    correctSound.currentTime = 0;
    correctSound.play();
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play();
  }

  // 👉 Next question पर जाए
  currentQuestion++;

  if (currentQuestion < questions.length) {
    loadQuestion(); // अगला प्रश्न
  } else {
    document.getElementById("mcq-container").innerHTML =
      "<h2>🎉 Quiz Completed!</h2>";
  }
}


// 🌐 Toggle Language
function toggleLang() {
  currentLang = currentLang === "hi" ? "en" : "hi";
  loadQuestion();
}
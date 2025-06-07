

async function generateQuiz() {
  const topic = document.getElementById("topic").value.trim();
  const count = document.getElementById("count").value.trim();
  const quizDiv = document.getElementById("quiz");

  if (!topic || !count) {
    alert("Please enter both topic and number of questions.");
    return;
  }

  quizDiv.innerHTML = "⏳ Generating quiz...";

  try {
    const response = await fetch("https://js-quiz-1-kfch.onrender.com/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count }),
    });

    const data = await response.json();

    if (data.error) {
      quizDiv.innerText = "❌ Failed to generate quiz.";
      return;
    }

    // Convert quiz text into structured questions
   // Convert quiz text into structured questions
const rawQuestions = data.quiz.split(/Q\d+\./).filter(Boolean);

const questions = rawQuestions
  .map(q => q.trim())
  .filter(q => {
    // Only keep real questions (which have options like "A.", "B.", etc.)
    return q.match(/[A-D]\./);
  });

const quizElements = questions.map((qText, index) => {
  const parts = qText.split(/Answer:\s*/);
  const questionBlock = parts[0].trim();
  const correct = parts[1]?.trim();

  const [questionLine, ...options] = questionBlock.split("\n");
  const question = `Q${index + 1}. ${questionLine.trim()}`;

  const optionsHtml = options.map((opt, i) => {
    const optId = `q${index}_opt${i}`;
    return `
      <div>
        <input type="radio" name="q${index}" id="${optId}" value="${opt.trim().slice(0, 1)}" />
        <label for="${optId}">${opt.trim()}</label>
      </div>
    `;
  }).join("");

  return `
    <div class="question-block" data-answer="${correct}">
      <p><strong>${question}</strong></p>
      ${optionsHtml}
      <div class="result" style="margin-top: 5px;"></div>
    </div>
  `;
});

quizDiv.innerHTML = quizElements.join("") + `<br><button onclick="checkAnswers()">Submit Answers</button>`;

  } catch (error) {
    console.error("Client Error:", error);
    quizDiv.innerText = "❌ Network or server error.";
  }
}


function checkAnswers() {
  const blocks = document.querySelectorAll(".question-block");

  blocks.forEach(block => {
    const correctAnswer = block.dataset.answer.trim();
    const selected = block.querySelector('input[type="radio"]:checked');
    const resultDiv = block.querySelector(".result");

    if (!selected) {
      resultDiv.innerHTML = "⚠️ Please select an answer.";
      resultDiv.style.color = "orange";
    } else if (selected.value === correctAnswer) {
      resultDiv.innerHTML = "✅ 🎉 Congratulations! Correct Answer.";
      resultDiv.style.color = "green";
    } else {
      resultDiv.innerHTML = `❌ Wrong. The correct answer is: <strong>${correctAnswer}</strong>`;
      resultDiv.style.color = "red";
    }
  });
}

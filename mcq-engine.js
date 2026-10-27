
(function () {
  "use strict";

  const QUESTIONS = window.ACADEX_QUESTIONS || [];
  const SUBJECT = document.body.dataset.subject || "All";
  const app = document.getElementById("app");

  if (!app) {
    document.body.innerHTML =
      '<main style="padding:24px;font-family:Arial">' +
      '<h2>ACADEX MCQ</h2><p>HTML file-এ id="app" যোগ করতে হবে।</p></main>';
    return;
  }

  const filteredQuestions = QUESTIONS.filter(function (q) {
    return SUBJECT === "All" || q.subject === SUBJECT;
  });

  let mode = "practice";
  let questions = [];
  let current = 0;
  let answers = {};
  let finished = false;
  let review = false;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function shuffle(array) {
    const copy = array.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

    function startQuiz(selectedMode) {
    mode = selectedMode;
    questions = shuffle(filteredQuestions);
    current = 0;
    answers = {};
    finished = false;
    review = false;
    renderQuestion();
    }

function getCorrectCount() {
  return questions.filter(function (q) {
    return answers[q.id] === q.answer;
  }).length;
}

function getWrongCount() {
  return questions.filter(function (q) {
    return answers[q.id] !== undefined &&
           answers[q.id] !== q.answer;
  }).length;
}


function getScore() {
  const correct = getCorrectCount();
  const wrong = getWrongCount();

  if (mode === "practice") {
    return correct;
  }

  if (mode === "exam") {
    return correct - wrong * 0.25;
  }

  return correct;
}
  


  function getAnsweredCount() {
    return Object.keys(answers).length;
  }

  function renderHome() {
    const subjectName = SUBJECT === "All"
      ? "All Subjects"
      : SUBJECT;

    app.innerHTML = `
      <div class="mcq-shell">
        <header class="mcq-header">
          <a class="mcq-brand" href="index.html">ACADEX</a>
          <span class="mcq-tag">MASTER THE BASICS</span>
        </header>

        <section class="mcq-hero">
          <p class="mcq-eyebrow">ACADEX LEARNING ARENA</p>
          <h1>MCQ Practice Zone</h1>
          <p class="mcq-subtitle">
            Practice smarter. Test yourself. Master the basics.
          </p>
          <div class="mcq-subject-label">
            ${escapeHTML(subjectName)}
          </div>
        </section>

        <section class="mcq-start-card">
          <h2>Choose Your Mode</h2>
          <p class="mcq-muted">
            Select a mode to begin your MCQ session.
          </p>

          <div class="mcq-mode-grid">
            <button class="mcq-mode-card" id="practiceBtn">
              <span class="mcq-mode-icon">✎</span>
              <strong>Practice Mode</strong>
              <small>Instant answers and explanations</small>
            </button>

            <button class="mcq-mode-card" id="examBtn">
              <span class="mcq-mode-icon">◷</span>
              <strong>Exam Mode</strong>
              <small>Answer first, review after finishing</small>
            </button>
          </div>

          <div class="mcq-stats">
            <div>
              <strong>${filteredQuestions.length}</strong>
              <span>Available Questions</span>
            </div>
            <div>
              <strong>${new Set(filteredQuestions.map(q => q.subject)).size}</strong>
              <span>Subjects</span>
            </div>
          </div>
        </section>

        <p class="mcq-footer">
          ACADEX · Master the Basics. Conquer the Admissions.
        </p>
      </div>
    `;

    document.getElementById("practiceBtn").addEventListener(
      "click", function () {
        startQuiz("practice");
      }
    );

    document.getElementById("examBtn").addEventListener(
      "click", function () {
        startQuiz("exam");
      }
    );
  }

  
function renderQuestion() {
  const isPractice = mode === "practice";

  // PRACTICE MODE: আগের মতো একটি প্রশ্ন
  if (isPractice) {
    const q = questions[current];
    const selected = answers[q.id];
    const answered = selected !== undefined;

    const optionsHTML = q.options.map(function (option, index) {
      let classes = "mcq-option";

      if (answered) {
        if (index === q.answer) classes += " correct";
        else if (index === selected) classes += " incorrect";
      }

      const disabled = finished || answered ? "disabled" : "";

      return `
        <button class="${classes}" data-option="${index}" ${disabled}>
          <span class="mcq-option-letter">
            ${String.fromCharCode(65 + index)}
          </span>
          <span class="mcq-option-text">${escapeHTML(option)}</span>
        </button>
      `;
    }).join("");

    let explanationHTML = "";

    if (answered) {
      const correct = selected === q.answer;

      explanationHTML = `
        <div class="mcq-explanation ${correct ? "success" : "error"}">
          <strong>${correct ? "✓ Correct Answer!" : "✗ Not quite right"}</strong>
          <p><b>Answer:</b> ${escapeHTML(q.options[q.answer])}</p>
          <p>${escapeHTML(q.explanation)}</p>
        </div>
      `;
    }

    const lastQuestion = current === questions.length - 1;

    app.innerHTML = `
      <div class="mcq-shell">
        <header class="mcq-header">
          <a class="mcq-brand" href="index.html">ACADEX</a>
          <button class="mcq-text-btn" id="exitBtn">Exit Quiz</button>
        </header>

        <section class="mcq-quiz-card">
          <div class="mcq-quiz-top">
            <span class="mcq-chip">PRACTICE MODE</span>
            <span class="mcq-counter">
              Question ${current + 1} of ${questions.length}
            </span>
          </div>

          <div class="mcq-progress-track">
            <div class="mcq-progress-fill"
              style="width:${((current + 1) / questions.length) * 100}%">
            </div>
          </div>

          <div class="mcq-meta">
            <span>${escapeHTML(q.subject)}</span>
            <span>${getAnsweredCount()} answered</span>
          </div>

          <h2 class="mcq-question">${escapeHTML(q.question)}</h2>
          <div class="mcq-options">${optionsHTML}</div>
          ${explanationHTML}

          <div class="mcq-navigation">
            <button class="mcq-secondary-btn" id="prevBtn"
              ${current === 0 ? "disabled" : ""}>← Previous</button>

            <button class="mcq-primary-btn" id="nextBtn">
              ${lastQuestion ? "View Results" : "Next Question →"}
            </button>
          </div>
        </section>

        <p class="mcq-footer">ACADEX · Learn. Practise. Improve.</p>
      </div>
    `;

    app.querySelectorAll("[data-option]").forEach(function (button) {
      button.addEventListener("click", function () {
        selectAnswer(Number(button.dataset.option));
      });
    });

    document.getElementById("prevBtn").addEventListener("click", function () {
      if (current > 0) {
        current--;
        renderQuestion();
      }
    });

    document.getElementById("nextBtn").addEventListener("click", function () {
      if (current < questions.length - 1) {
        current++;
        renderQuestion();
      } else {
        finished = true;
        renderResults();
      }
    });

    document.getElementById("exitBtn").addEventListener("click", function () {
      if (window.confirm("Exit this quiz? Your current progress will reset.")) {
        renderHome();
      }
    });

    return;
  }

  // EXAM MODE: সব প্রশ্ন একই পেজে
  const navigatorHTML = questions.map(function (q, index) {
    const answered = answers[q.id] !== undefined;
    const active = index === current;

    return `
      <button type="button"
        class="mcq-nav-number ${answered ? "answered" : "unanswered"} ${active ? "active" : ""}"
        data-jump="${index}"
        aria-label="Go to question ${index + 1}">
        ${index + 1}
      </button>
    `;
  }).join("");

  const allQuestionsHTML = questions.map(function (q, index) {
    const selected = answers[q.id];

    const optionsHTML = q.options.map(function (option, optionIndex) {
      const isSelected = selected === optionIndex;

      return `
        <button type="button"
          class="mcq-option ${isSelected ? "selected" : ""}"
          data-qindex="${index}"
          data-option="${optionIndex}"
          ${finished ? "disabled" : ""}>
          <span class="mcq-option-letter">
            ${String.fromCharCode(65 + optionIndex)}
          </span>
          <span class="mcq-option-text">${escapeHTML(option)}</span>
        </button>
      `;
    }).join("");

    return `
      <section class="mcq-quiz-card mcq-exam-question"
        id="exam-question-${index}">
        <div class="mcq-quiz-top">
          <span class="mcq-chip">QUESTION ${index + 1}</span>
          <span class="mcq-counter">
            ${answers[q.id] !== undefined ? "Answered" : "Not answered"}
          </span>
        </div>

        <div class="mcq-meta">
          <span>${escapeHTML(q.subject)}</span>
        </div>

        <h2 class="mcq-question">${escapeHTML(q.question)}</h2>
        <div class="mcq-options">${optionsHTML}</div>
      </section>
    `;
  }).join("");

  app.innerHTML = `
    <div class="mcq-shell">
      <header class="mcq-header">
        <a class="mcq-brand" href="index.html">ACADEX</a>
        <button class="mcq-text-btn" id="exitBtn">Exit Exam</button>
      </header>

      <section class="mcq-quiz-card mcq-exam-navigator">
        <div class="mcq-quiz-top">
          <span class="mcq-chip">EXAM MODE</span>
          <span class="mcq-counter">
            ${getAnsweredCount()} / ${questions.length} answered
          </span>
        </div>

        <div class="mcq-progress-track">
          <div class="mcq-progress-fill"
            style="width:${(getAnsweredCount() / questions.length) * 100}%">
          </div>
        </div>

        <h2>Question Navigator</h2>
        <p class="mcq-muted">
          যেকোনো নম্বরে চাপ দিলে সরাসরি সেই প্রশ্নে যেতে পারবে।
        </p>

        <div class="mcq-question-grid">${navigatorHTML}</div>

        <div class="mcq-nav-legend">
          <span><i class="mcq-legend-dot answered-dot"></i> Answered</span>
          <span><i class="mcq-legend-dot unanswered-dot"></i> Unanswered</span>
          <span><i class="mcq-legend-dot active-dot"></i> Selected question</span>
        </div>
      </section>

      <div class="mcq-exam-list">
        ${allQuestionsHTML}
      </div>

      <section class="mcq-quiz-card">
        <button class="mcq-primary-btn" id="submitExamBtn">
          Submit Exam
        </button>
      </section>

      <p class="mcq-footer">ACADEX · Learn. Practise. Improve.</p>
    </div>
  `;

  // Navigator নম্বরে ক্লিক করে প্রশ্নে যাওয়া
  app.querySelectorAll("[data-jump]").forEach(function (button) {
    button.addEventListener("click", function () {
      current = Number(button.dataset.jump);
      renderQuestion();

      const target = document.getElementById("exam-question-" + current);

      if (target) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    });
  });

  // Exam-এর যেকোনো প্রশ্নের উত্তর নির্বাচন
  app.querySelectorAll("[data-qindex][data-option]").forEach(function (button) {
    button.addEventListener("click", function () {
      current = Number(button.dataset.qindex);
      selectAnswer(Number(button.dataset.option));
    });
  });

  // পরীক্ষা জমা দেওয়া
  document.getElementById("submitExamBtn").addEventListener("click", function () {
    if (finished) return;

    const unanswered = questions.length - getAnsweredCount();

    if (unanswered > 0) {
      const confirmFinish = window.confirm(
        "You have " + unanswered +
        " unanswered question(s). Finish the exam anyway?"
      );

      if (!confirmFinish) return;
    } else {
      if (!window.confirm("Are you sure you want to submit the exam?")) {
        return;
      }
    }

    finished = true;
    review = false;
    renderResults();
  });

  document.getElementById("exitBtn").addEventListener("click", function () {
    if (window.confirm("Exit this exam? Your current progress will reset.")) {
      renderHome();
    }
  });
}

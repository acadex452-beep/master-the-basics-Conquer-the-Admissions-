
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
  const correct = questions.filter(function (q) {
    return answers[q.id] === q.answer;
  }).length;

  const wrong = questions.filter(function (q) {
    return answers[q.id] !== undefined &&
           answers[q.id] !== q.answer;
  }).length;

  if (mode === "exam") {
    return correct - wrong * 0.25;
  }

  return correct;
}

  return correct;
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
    const q = questions[current];
    const selected = answers[q.id];
    const answered = selected !== undefined;
    const isPractice = mode === "practice";

    const optionsHTML = q.options.map(function (option, index) {
      let classes = "mcq-option";

      if (answered && isPractice) {
        if (index === q.answer) classes += " correct";
        else if (index === selected) classes += " incorrect";
      } else if (answered && index === selected) {
        classes += " selected";
      }

      const disabled = finished ||
        (isPractice && answered) ? "disabled" : "";

      return `
        <button class="${classes}" data-option="${index}" ${disabled}>
          <span class="mcq-option-letter">
            ${String.fromCharCode(65 + index)}
          </span>
          <span class="mcq-option-text">
            ${escapeHTML(option)}
          </span>
        </button>
      `;
    }).join("");

    let explanationHTML = "";

    if (isPractice && answered) {
      const correct = selected === q.answer;

      explanationHTML = `
        <div class="mcq-explanation ${correct ? "success" : "error"}">
          <strong>
            ${correct ? "✓ Correct Answer!" : "✗ Not quite right"}
          </strong>
          <p>
            <b>Answer:</b>
            ${escapeHTML(q.options[q.answer])}
          </p>
          <p>${escapeHTML(q.explanation)}</p>
        </div>
      `;
    }

    const previousDisabled = current === 0 ? "disabled" : "";
    const lastQuestion = current === questions.length - 1;

    app.innerHTML = `
      <div class="mcq-shell">
        <header class="mcq-header">
          <a class="mcq-brand" href="index.html">ACADEX</a>
          <button class="mcq-text-btn" id="exitBtn">Exit Quiz</button>
        </header>

        <section class="mcq-quiz-card">
          <div class="mcq-quiz-top">
            <span class="mcq-chip">
              ${mode === "practice" ? "PRACTICE MODE" : "EXAM MODE"}
            </span>
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
              ${previousDisabled}>← Previous</button>

            ${
              lastQuestion
                ? `<button class="mcq-primary-btn" id="nextBtn">
                     ${mode === "exam" ? "Finish Exam" : "View Results"}
                   </button>`
                : `<button class="mcq-primary-btn" id="nextBtn">
                     Next Question →
                   </button>`
            }
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
      } else if (mode === "exam" && !finished) {
        const unanswered = questions.length - getAnsweredCount();

        if (unanswered > 0) {
          const confirmFinish = window.confirm(
            "You have " + unanswered +
            " unanswered question(s). Finish the exam anyway?"
          );
          if (!confirmFinish) return;
        }

        finished = true;
        review = false;
        renderResults();
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
  }

  function selectAnswer(optionIndex) {
    if (finished) return;

    const q = questions[current];
    if (mode === "practice" && answers[q.id] !== undefined) return;

    answers[q.id] = optionIndex;

    if (mode === "practice") {
      renderQuestion();
    } else {
      renderQuestion();
    }
  }

  function renderResults() {
  
const score = getScore();
const correctCount = getCorrectCount();
const wrongCount = getWrongCount();
const total = questions.length;
const unanswered = total - getAnsweredCount();
const percentage = total
  ? Math.round((score / total) * 100)
  : 0;


    app.innerHTML = `
      <div class="mcq-shell">
        <header class="mcq-header">
          <a class="mcq-brand" href="index.html">ACADEX</a>
          <span class="mcq-tag">SESSION COMPLETE</span>
        </header>

        <section class="mcq-result-card">
          <div class="mcq-result-symbol">✓</div>
          <p class="mcq-eyebrow">YOUR PERFORMANCE</p>
          <h1>${mode === "exam" ? "Exam Results" : "Practice Results"}</h1>

          <div class="mcq-score-circle">
            <strong>${score.toFixed(2)}/${total}</strong>
            <span>${percentage}% Score</span>
          </div>

          <div class="mcq-stats">
            <div>
              <strong>${correctCount}</strong>
              <span>Correct</span>
            </div>
            <div>
              <strong>${wrongCount}</strong>
              <span>Incorrect</span>
            </div>
            <div>
              <strong>${unanswered}</strong>
              <span>Unanswered</span>
            </div>
          </div>

          <p class="mcq-muted">
            ${percentage >= 80
              ? "Excellent work! Keep strengthening your basics."
              : percentage >= 50
                ? "Good effort. Review the explanations and try again."
                : "Keep practising. Every attempt is a chance to improve."}
          </p>

          <div class="mcq-result-actions">
            <button class="mcq-primary-btn" id="reviewBtn">
              Review Answers
            </button>
            <button class="mcq-secondary-btn" id="retryBtn">
              Try Again
            </button>
            <button class="mcq-secondary-btn" id="homeBtn">
              Back to MCQ Home
            </button>
          </div>
        </section>

        <p class="mcq-footer">ACADEX · Master the Basics.</p>
      </div>
    `;

    document.getElementById("reviewBtn").addEventListener("click", function () {
      review = true;
      current = 0;
      renderReview();
    });

    document.getElementById("retryBtn").addEventListener("click", function () {
      startQuiz(mode);
    });

    document.getElementById("homeBtn").addEventListener("click", renderHome);
  }

  function renderReview() {
    const q = questions[current];
    const selected = answers[q.id];
    const isCorrect = selected === q.answer;

    const optionsHTML = q.options.map(function (option, index) {
      let classes = "mcq-option";

      if (index === q.answer) classes += " correct";
      else if (index === selected) classes += " incorrect";

      return `
        <div class="${classes}">
          <span class="mcq-option-letter">
            ${String.fromCharCode(65 + index)}
          </span>
          <span class="mcq-option-text">${escapeHTML(option)}</span>
        </div>
      `;
    }).join("");

    app.innerHTML = `
      <div class="mcq-shell">
        <header class="mcq-header">
          <a class="mcq-brand" href="index.html">ACADEX</a>
          <button class="mcq-text-btn" id="resultsBtn">Results</button>
        </header>

        <section class="mcq-quiz-card">
          <div class="mcq-quiz-top">
            <span class="mcq-chip">ANSWER REVIEW</span>
            <span class="mcq-counter">${current + 1} / ${questions.length}</span>
          </div>

          <h2 class="mcq-question">${escapeHTML(q.question)}</h2>

          <div class="mcq-options">${optionsHTML}</div>

          <div class="mcq-explanation ${isCorrect ? "success" : "error"}">
            <strong>${selected === undefined
              ? "Not Answered"
              : isCorrect ? "✓ Correct" : "✗ Incorrect"}</strong>
            <p><b>Correct answer:</b> ${escapeHTML(q.options[q.answer])}</p>
            <p>${escapeHTML(q.explanation)}</p>
          </div>

          <div class="mcq-navigation">
            <button class="mcq-secondary-btn" id="reviewPrev"
              ${current === 0 ? "disabled" : ""}>← Previous</button>
            <button class="mcq-primary-btn" id="reviewNext">
              ${current === questions.length - 1 ? "Finish Review" : "Next →"}
            </button>
          </div>
        </section>
      </div>
    `;

    document.getElementById("resultsBtn").addEventListener("click", renderResults);

    document.getElementById("reviewPrev").addEventListener("click", function () {
      if (current > 0) {
        current--;
        renderReview();
      }
    });

    document.getElementById("reviewNext").addEventListener("click", function () {
      if (current < questions.length - 1) {
        current++;
        renderReview();
      } else {
        renderResults();
      }
    });
  }

  if (!QUESTIONS.length) {
    app.innerHTML = `
      <div class="mcq-shell">
        <h1>ACADEX MCQ</h1>
        <p>Questions could not be loaded.</p>
        <p>Check that questions.js is committed and loaded before mcq-engine.js.</p>
      </div>
    `;
    return;
  }

  if (!filteredQuestions.length) {
    app.innerHTML = `
      <div class="mcq-shell">
        <h1>No questions found</h1>
        <p>Check the subject name in this page's data-subject attribute.</p>
      </div>
    `;
    return;
  }

  renderHome();
})();

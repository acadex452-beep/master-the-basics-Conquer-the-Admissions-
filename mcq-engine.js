
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
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
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
    window.scrollTo(0, 0);
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

  function getAnsweredCount() {
    return questions.filter(function (q) {
      return answers[q.id] !== undefined;
    }).length;
  }

  function getScore() {
    const correct = getCorrectCount();
    const wrong = getWrongCount();

    return mode === "exam"
      ? correct - wrong * 0.25
      : correct;
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
          <p class="mcq-muted">Select a mode to begin your MCQ session.</p>

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
              <strong>${new Set(filteredQuestions.map(function (q) {
                return q.subject;
              })).size}</strong>
              <span>Subjects</span>
            </div>
          </div>
        </section>

        <p class="mcq-footer">
          ACADEX · Master the Basics. Conquer the Admissions.
        </p>
      </div>
    `;

    document.getElementById("practiceBtn").addEventListener("click", function () {
      startQuiz("practice");
    });

    document.getElementById("examBtn").addEventListener("click", function () {
      startQuiz("exam");
    });
  }

  // PRACTICE MODE: one question at a time
  function renderPracticeQuestion() {
    const q = questions[current];
    if (!q) return;

    const selected = answers[q.id];
    const answered = selected !== undefined;

    const optionsHTML = q.options.map(function (option, index) {
      let classes = "mcq-option";

      if (answered) {
        if (index === q.answer) {
          classes += " correct";
        } else if (index === selected) {
          classes += " incorrect";
        }
      }

      return `
        <button type="button" class="${classes}"
          data-option="${index}" ${answered || finished ? "disabled" : ""}>
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
          <p>${escapeHTML(q.explanation || "No explanation available.")}</p>
        </div>
      `;
    }

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
              ${current === questions.length - 1 ? "View Results" : "Next Question →"}
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
        window.scrollTo(0, 0);
      }
    });

    document.getElementById("nextBtn").addEventListener("click", function () {
      if (current < questions.length - 1) {
        current++;
        renderQuestion();
        window.scrollTo(0, 0);
      } else {
        finished = true;
        renderResults();
        window.scrollTo(0, 0);
      }
    });

    document.getElementById("exitBtn").addEventListener("click", confirmExit);
  }

  // EXAM MODE: all questions, then navigator, then submit
  function renderExamQuestion(scrollToIndex) {
    const allQuestionsHTML = questions.map(function (q, index) {
      const selected = answers[q.id];
      const answered = selected !== undefined;

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
              ${answered ? "Answered" : "Not answered"}
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

    app.innerHTML = `
      <div class="mcq-shell">
        <header class="mcq-header">
          <a class="mcq-brand" href="index.html">ACADEX</a>
          <button class="mcq-text-btn" id="exitBtn">Exit Exam</button>
        </header>

        <div class="mcq-exam-list">
          ${allQuestionsHTML}
        </div>

        <!-- Navigator moved below all questions -->
        <section class="mcq-quiz-card mcq-exam-navigator" id="questionNavigator">
          <div class="mcq-quiz-top">
            <span class="mcq-chip">EXAM MODE</span>
            <span class="mcq-counter">
              ${getAnsweredCount()} / ${questions.length} answered
            </span>
          </div>

          <div class="mcq-progress-track">
            <div class="mcq-progress-fill"
              style="width:${questions.length ? getAnsweredCount() / questions.length * 100 : 0}%">
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
            <span><i class="mcq-legend-dot active-dot"></i> Current</span>
          </div>
        </section>

        <section class="mcq-quiz-card">
          <button class="mcq-primary-btn" id="submitExamBtn"
            ${finished ? "disabled" : ""}>
            Submit Exam
          </button>
        </section>

        <p class="mcq-footer">ACADEX · Learn. Practise. Improve.</p>
      </div>
    `;

    app.querySelectorAll("[data-jump]").forEach(function (button) {
      button.addEventListener("click", function () {
        const targetIndex = Number(button.dataset.jump);
        current = targetIndex;
        renderExamQuestion(targetIndex);
      });
    });

    app.querySelectorAll("[data-qindex][data-option]").forEach(function (button) {
      button.addEventListener("click", function () {
        current = Number(button.dataset.qindex);
        selectAnswer(Number(button.dataset.option));
      });
    });

    document.getElementById("submitExamBtn").addEventListener("click", function () {
      if (finished) return;

      const unanswered = questions.length - getAnsweredCount();

      if (unanswered > 0) {
        const confirmed = window.confirm(
          "You have " + unanswered +
          " unanswered question(s). Finish the exam anyway?"
        );

        if (!confirmed) return;
      } else {
        if (!window.confirm("Are you sure you want to submit the exam?")) {
          return;
        }
      }

      finished = true;
      review = false;
      renderResults();
      window.scrollTo(0, 0);
    });

    document.getElementById("exitBtn").addEventListener("click", confirmExit);

    // If a navigator number was clicked, scroll to that question.
    if (scrollToIndex !== undefined) {
      const target = document.getElementById("exam-question-" + scrollToIndex);

      if (target) {
        target.scrollIntoView({
          behavior: "auto",
          block: "start"
        });
      }
    }
  }

  function renderQuestion(scrollToIndex) {
    if (!questions.length) {
      renderHome();
      return;
    }

    if (mode === "practice") {
      renderPracticeQuestion();
    } else {
      renderExamQuestion(scrollToIndex);
    }
  }

  function selectAnswer(optionIndex) {
    if (finished) return;

    const q = questions[current];

    if (!q || !q.options ||
        optionIndex < 0 || optionIndex >= q.options.length) {
      return;
    }

    if (mode === "practice" && answers[q.id] !== undefined) {
      return;
    }

    answers[q.id] = optionIndex;

    if (mode === "practice") {
      renderQuestion();
    } else {
      const questionIndex = current;
      renderQuestion(questionIndex);
    }
  }

  function confirmExit() {
    if (window.confirm("Exit this quiz? Your current progress will reset.")) {
      current = 0;
      answers = {};
      finished = false;
      review = false;
      renderHome();
      window.scrollTo(0, 0);
    }
  }

  function renderResults() {
    const correctCount = getCorrectCount();
    const wrongCount = getWrongCount();
    const total = questions.length;
    const unanswered = total - getAnsweredCount();
    const score = getScore();
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
            <strong>${Number(score.toFixed(2))}/${total}</strong>
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

          ${mode === "exam"
            ? '<p class="mcq-muted">Negative marking: 0.25 marks deducted for each incorrect answer.</p>'
            : '<p class="mcq-muted">Practice Mode has no negative marking.</p>'}

          <div class="mcq-result-actions">
            <button class="mcq-primary-btn" id="reviewBtn">Review Answers</button>
            <button class="mcq-secondary-btn" id="retryBtn">Try Again</button>
            <button class="mcq-secondary-btn" id="homeBtn">Back to MCQ Home</button>
          </div>
        </section>

        <p class="mcq-footer">ACADEX · Master the Basics.</p>
      </div>
    `;

    document.getElementById("reviewBtn").addEventListener("click", function () {
      review = true;
      current = 0;
      renderReview();
      window.scrollTo(0, 0);
    });

    document.getElementById("retryBtn").addEventListener("click", function () {
      startQuiz(mode);
    });

    document.getElementById("homeBtn").addEventListener("click", function () {
      renderHome();
      window.scrollTo(0, 0);
    });
  }

  function renderReview() {
    const q = questions[current];

    if (!q) {
      renderResults();
      return;
    }

    const selected = answers[q.id];
    const isCorrect = selected === q.answer;

    const optionsHTML = q.options.map(function (option, index) {
      let classes = "mcq-option";

      if (index === q.answer) {
        classes += " correct";
      } else if (index === selected) {
        classes += " incorrect";
      }

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
            <p>${escapeHTML(q.explanation || "No explanation available.")}</p>
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

    document.getElementById("resultsBtn").addEventListener("click", function () {
      renderResults();
      window.scrollTo(0, 0);
    });

    document.getElementById("reviewPrev").addEventListener("click", function () {
      if (current > 0) {
        current--;
        renderReview();
        window.scrollTo(0, 0);
      }
    });

    document.getElementById("reviewNext").addEventListener("click", function () {
      if (current < questions.length - 1) {
        current++;
        renderReview();
        window.scrollTo(0, 0);
      } else {
        renderResults();
        window.scrollTo(0, 0);
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

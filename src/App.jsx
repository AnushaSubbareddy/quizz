import { useEffect, useState } from "react";
import questions from "./questions.js";

const QUESTION_SECONDS = 15;
const HIGH_SCORE_KEY = "quizlet-high-score";
const optionLetters = ["A", "B", "C", "D"];

function readHighScore() {
  try {
    const savedScore = Number(window.localStorage.getItem(HIGH_SCORE_KEY));
    return Number.isInteger(savedScore) && savedScore >= 0 ? savedScore : 0;
  } catch {
    return 0;
  }
}

function App() {
  const [screen, setScreen] = useState("start");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(readHighScore);
  const [isNewBest, setIsNewBest] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QUESTION_SECONDS);
  const [selectedOption, setSelectedOption] = useState(null);

  const currentQuestion = questions[questionIndex];
  const progress = ((questionIndex + 1) / questions.length) * 100;

  useEffect(() => {
    if (screen !== "quiz" || selectedOption !== null) return undefined;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((seconds) => Math.max(seconds - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [screen, questionIndex, selectedOption]);

  useEffect(() => {
    if (screen === "quiz" && secondsLeft === 0 && selectedOption === null) {
      setSelectedOption(-1);
    }
  }, [screen, secondsLeft, selectedOption]);

  function startQuiz() {
    setQuestionIndex(0);
    setScore(0);
    setIsNewBest(false);
    setSelectedOption(null);
    setSecondsLeft(QUESTION_SECONDS);
    setScreen("quiz");
  }

  function chooseOption(optionIndex) {
    if (selectedOption !== null) return;

    setSelectedOption(optionIndex);
    if (optionIndex === currentQuestion.answer) {
      setScore((currentScore) => currentScore + 1);
    }
  }

  function finishQuiz() {
    if (score > bestScore) {
      setIsNewBest(true);
      setBestScore(score);
      try {
        window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
      } catch {
        // The result screen still works when browser storage is unavailable.
      }
    }
    setScreen("result");
  }

  function goToNextQuestion() {
    if (questionIndex === questions.length - 1) {
      finishQuiz();
      return;
    }

    setQuestionIndex((index) => index + 1);
    setSelectedOption(null);
    setSecondsLeft(QUESTION_SECONDS);
  }

  const isCorrect = selectedOption === currentQuestion?.answer;
  const scoreMessage =
    score === questions.length
      ? "A perfect round. You really know your stuff!"
      : score >= questions.length / 2
        ? "Nicely done. That was a solid round!"
        : "Every great streak starts somewhere. Try again!";

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#home"
          onClick={(event) => {
            event.preventDefault();
            setScreen("start");
          }}
          aria-label="Quizlet home"
        >
          <span className="brand-mark" aria-hidden="true">Q</span>
          <span>quizlet<span className="brand-period">.</span></span>
        </a>
        <div className="topbar-note">
          <span className="live-dot" aria-hidden="true" />
          A little quiz, a lot of fun
        </div>
      </header>

      {screen === "start" && (
        <section className="panel start-panel" aria-labelledby="welcome-title">
          <div className="eyebrow"><span>✦</span> YOUR DAILY BRAIN BREAK</div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-sparkle sparkle-one">✳</div>
            <div className="art-sparkle sparkle-two">✦</div>
            <div className="art-card">
              <span className="art-card-label">QUICK QUIZ</span>
              <span className="art-card-question">Ready to<br />play?</span>
              <span className="art-card-dots"><i /><i /><i /></span>
            </div>
            <div className="art-orbit orbit-one" />
            <div className="art-orbit orbit-two" />
            <span className="art-star">★</span>
          </div>
          <h1 id="welcome-title">A little quiz,<br />a lot of <span>fun.</span></h1>
          <p className="intro-copy">
            Eight questions. Fifteen seconds each.<br className="desktop-break" />
            How many can you get right?
          </p>
          <div className="quiz-facts">
            <div className="fact">
              <span className="fact-icon fact-purple">◷</span>
              <span><strong>15 sec</strong><small>per question</small></span>
            </div>
            <span className="fact-divider" />
            <div className="fact">
              <span className="fact-icon fact-yellow">✦</span>
              <span><strong>{questions.length} questions</strong><small>all for fun</small></span>
            </div>
            {bestScore > 0 && (
              <>
                <span className="fact-divider" />
                <div className="fact">
                  <span className="fact-icon fact-green">↗</span>
                  <span><strong>{bestScore}/{questions.length}</strong><small>personal best</small></span>
                </div>
              </>
            )}
          </div>
          <button className="button button-primary start-button" onClick={startQuiz}>
            Let&apos;s play <span aria-hidden="true">→</span>
          </button>
          <p className="no-pressure">No pressure. Just good questions.</p>
        </section>
      )}

      {screen === "quiz" && currentQuestion && (
        <section className="panel quiz-panel" aria-labelledby="question-title">
          <div className="quiz-topline">
            <span className="question-count">
              QUESTION <strong>{String(questionIndex + 1).padStart(2, "0")}</strong>
              <span className="count-slash">/</span>{String(questions.length).padStart(2, "0")}
            </span>
            <div className={`timer${secondsLeft <= 5 ? " timer-urgent" : ""}`} aria-label={`${secondsLeft} seconds left`}>
              <span aria-hidden="true">◷</span> 00:{String(secondsLeft).padStart(2, "0")}
            </div>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Quiz progress"
            aria-valuemin="0"
            aria-valuemax={questions.length}
            aria-valuenow={questionIndex + 1}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="question-meta">
            <span className="category-tag">{currentQuestion.category}</span>
            <span className="score-pill"><span aria-hidden="true">✦</span> {score} points</span>
          </div>
          <h1 id="question-title" className="question-title">{currentQuestion.prompt}</h1>
          <div className="options-list">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedOption === index;
              const showCorrect = selectedOption !== null && index === currentQuestion.answer;
              const showIncorrect = isSelected && !isCorrect;
              let optionClass = "option-button";
              if (showCorrect) optionClass += " option-correct";
              else if (showIncorrect) optionClass += " option-incorrect";
              else if (selectedOption !== null) optionClass += " option-muted";

              return (
                <button
                  className={optionClass}
                  key={option}
                  onClick={() => chooseOption(index)}
                  disabled={selectedOption !== null}
                  aria-pressed={isSelected}
                >
                  <span className="option-letter">{optionLetters[index]}</span>
                  <span>{option}</span>
                  {showCorrect && <span className="option-indicator" aria-label="Correct answer">✓</span>}
                  {showIncorrect && <span className="option-indicator" aria-label="Incorrect answer">×</span>}
                </button>
              );
            })}
          </div>
          {selectedOption !== null ? (
            <div className="answer-footer">
              <p className={`answer-feedback${isCorrect ? " feedback-correct" : ""}`} role="status">
                {selectedOption === -1
                  ? "Time's up! The correct answer is highlighted."
                  : isCorrect
                    ? "That's right! Nice one."
                    : "Not quite. The correct answer is highlighted."}
              </p>
              <button className="button button-primary next-button" onClick={goToNextQuestion}>
                {questionIndex === questions.length - 1 ? "See my score" : "Next question"}
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : (
            <p className="answer-hint">Pick the answer that feels right</p>
          )}
        </section>
      )}

      {screen === "result" && (
        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="result-confetti" aria-hidden="true">
            <span>✳</span><span>✦</span><span>✧</span><span>✳</span><span>✦</span>
          </div>
          <div className="eyebrow"><span>✦</span> QUIZ COMPLETE</div>
          <div className="score-ring">
            <div className="score-ring-inner">
              <span className="score-number">{score}</span>
              <span className="score-total">OUT OF {questions.length}</span>
            </div>
          </div>
          <h1 id="result-title">
            {score === questions.length ? "You nailed it!" : score >= questions.length / 2 ? "Look at you go!" : "Good game!"}
          </h1>
          <p className="result-copy">{scoreMessage}</p>
          {isNewBest && (
            <div className="best-score-banner"><span aria-hidden="true">🏆</span> New personal best!</div>
          )}
          <div className="result-stats">
            <div><strong>{score}</strong><span>correct answers</span></div>
            <div className="stats-divider" />
            <div><strong>{questions.length - score}</strong><span>to learn from</span></div>
            <div className="stats-divider" />
            <div><strong>{bestScore}</strong><span>personal best</span></div>
          </div>
          <button className="button button-primary play-again-button" onClick={startQuiz}>
            Play again <span aria-hidden="true">↻</span>
          </button>
          <p className="no-pressure">Your best score is saved on this device.</p>
        </section>
      )}

      <footer className="page-footer">
        <span>MADE FOR THE JOY OF KNOWING</span>
        <span className="footer-heart" aria-hidden="true">♥</span>
        <span>TAKE A BREATH. TAKE A QUIZ.</span>
      </footer>
    </main>
  );
}

export default App;

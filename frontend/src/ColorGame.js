import React, { useEffect, useState } from "react";
import axios from "axios";
import { startTracking, getData } from "./tracker";
import "./ColorGame.css";

function ColorGame({ onNext }) {
  const [matched, setMatched] = useState(new Set());
  const [showMessage, setShowMessage] = useState(false);
  const [taskMessage, setTaskMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "correct" | "wrong" | "already", text: string }

  useEffect(() => {
    startTracking();
  }, []);

  const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'cyan', 'magenta'];
  const boxColors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown'];
  const shuffledBoxes = [...boxColors].sort(() => Math.random() - 0.5);

  const colorEmojis = {
    red: '🔴',
    blue: '🔵',
    green: '🟢',
    yellow: '🟡',
    orange: '🟠',
    purple: '💜',
    pink: '🩷',
    brown: '🤎',
    cyan: '🟦',
    magenta: '🟣'
  };

  const boxBackgrounds = {
    red: "#FFB6C1",
    blue: "#ADD8E6",
    green: "#90EE90",
    yellow: "#FFFFC5",
    orange: "#FFA500",
    purple: "#DDA0DD",
    pink: "#FFC0CB",
    brown: "#D2B48C"
  };

  const showFeedback = (next) => {
    setFeedback(next);
    window.clearTimeout(showFeedback._t);
    showFeedback._t = window.setTimeout(() => setFeedback(null), 900);
  };

  const handleDrop = async (draggedColor, boxColor) => {
    if (draggedColor === boxColor) {
      if (!matched.has(boxColor)) {
        setMatched(prev => new Set(prev).add(boxColor));
        showFeedback({ type: "correct", text: "Correct!" });
      } else {
        showFeedback({ type: "already", text: "Already matched!" });
      }
    } else {
      showFeedback({ type: "wrong", text: "Try again!" });
    }

    const data = getData();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/save`, {
        activity: "color_game",
        ...data,
      });
    } catch (err) {
      console.error("ColorGame save failed:", err);
      showFeedback({ type: "wrong", text: "Could not save progress." });
    }
  };

  const handleCompleteTask = () => {
    if (matched.size === 8) {
      setTaskMessage("Superb Kiddie... You did it! All done 🎉🎊");
      setIsSuccess(true);
    } else {
      setTaskMessage("Oh no Kiddie! You have to try again 😢😔");
      setIsSuccess(false);
    }
    setShowMessage(true);
  };

  const matchedCount = matched.size;

  return (
    <div className="cg-root">
      <div className="cg-shell">
        {feedback && (
          <div
            key={`${feedback.type}-${feedback.text}`}
            className={`cg-feedback ${
              feedback.type === "correct"
                ? "cg-feedbackHappy"
                : feedback.type === "wrong"
                  ? "cg-feedbackSad"
                  : "cg-feedbackNeutral"
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="cg-feedbackEmoji" aria-hidden="true">
              {feedback.type === "correct"
                ? "🎉😄"
                : feedback.type === "wrong"
                  ? "😢"
                  : "✅"}
            </div>
            <div className="cg-feedbackText">{feedback.text}</div>
          </div>
        )}

        <div className="cg-topbar">
          <div>
            <h1 className="cg-title">Match Colors 🌈</h1>
            <p className="cg-subtitle">
              Drag a color emoji and drop it into the matching color box.
            </p>
          </div>

          <div className="cg-chips">
            <div className="cg-chip">
              Matched <strong>{matchedCount}</strong> / {boxColors.length}
            </div>
            <div className="cg-chip">
              Tip <strong>Look at the box name</strong>
            </div>
          </div>
        </div>

        <div className="cg-grid">
          <div className="cg-card">
            <div className="cg-cardHeader">
              <h3>Drag these colors</h3>
              <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 800 }}>
                Pick any emoji
              </span>
            </div>
            <div className="cg-cardBody">
              <div className="cg-palette">
                {colors.map((color) => (
                  <div
                    key={color}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("color", color)}
                    className="cg-swatch"
                    title={color}
                    aria-label={`Drag ${color}`}
                  >
                    {colorEmojis[color]}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cg-card">
            <div className="cg-cardHeader">
              <h3>Drop into the boxes</h3>
              <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 800 }}>
                Match emoji → box
              </span>
            </div>
            <div className="cg-cardBody">
              <div className="cg-boxGrid">
                {shuffledBoxes.map((boxColor) => {
                  const isMatchedBox = matched.has(boxColor);
                  return (
                    <div
                      key={boxColor}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        const draggedColor = e.dataTransfer.getData("color");
                        handleDrop(draggedColor, boxColor);
                      }}
                      className={`cg-box ${isMatchedBox ? "cg-boxMatched" : ""}`}
                      style={{
                        backgroundColor: isMatchedBox ? boxBackgrounds[boxColor] : undefined,
                        filter: isMatchedBox ? "saturate(1.05)" : "grayscale(0.15)",
                      }}
                      aria-label={`${boxColor} box`}
                    >
                      {boxColor.charAt(0).toUpperCase() + boxColor.slice(1)} Box
                      {isMatchedBox && <span className="cg-check">✅</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="cg-actions">
          <button onClick={handleCompleteTask} className="cg-button">
            Complete Task ✔️
          </button>
        </div>

        {showMessage && (
          <div
            className={`cg-message ${isSuccess ? "cg-messageGood" : "cg-messageBad"}`}
            role="status"
            aria-live="polite"
          >
            {taskMessage}
          </div>
        )}

        {showMessage && isSuccess && (
          <div className="cg-actions">
            <button
              onClick={() => onNext && onNext()}
              className="cg-button cg-nextButton"
            >
              Next ➡️
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ColorGame;
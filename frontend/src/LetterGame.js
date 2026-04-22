import React, { useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import { startTracking, getData } from "./tracker";
import "./LetterGame.css";

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function DraggableNumber({ num }) {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "number",
      item: { num },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }),
    []
  );

  return (
    <div
      ref={drag}
      draggable
      className={`lg-tile ${isDragging ? "lg-tileDragging" : ""}`}
    >
      {num}
    </div>
  );
}

function MatchBox({ num, droppedNumber, onDrop }) {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "number",
      drop: (item) => {
        onDrop(num, item.num);
      },
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }),
    [num, onDrop]
  );

  const isCorrect =
    droppedNumber !== null && droppedNumber !== undefined && droppedNumber === num;
  const boxClassName = `lg-box ${isCorrect ? "lg-boxCorrect" : ""} ${
    !isCorrect && isOver ? "lg-boxOver" : ""
  }`;

  return (
    <div
      ref={drop}
      className={boxClassName}
    >
      {droppedNumber !== null && droppedNumber !== undefined ? droppedNumber : num}
    </div>
  );
}

function LetterGame({ onNext }) {
  const [matches, setMatches] = useState({});
  const [status, setStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [dropFx, setDropFx] = useState(null); // { type: "correct" | "wrong", emoji: string, text: string }

  useEffect(() => {
    startTracking();
  }, []);

  const showDropFx = (next) => {
    setDropFx(next);
    window.clearTimeout(showDropFx._t);
    showDropFx._t = window.setTimeout(() => setDropFx(null), 950);
  };

  const handleDrop = (boxNum, draggedNum) => {
    console.log(`Dropped ${draggedNum} into box ${boxNum}`);
    setMatches((prev) => ({
      ...prev,
      [boxNum]: draggedNum,
    }));

    if (draggedNum === boxNum) {
      showDropFx({ type: "correct", emoji: "🎉💃", text: "Perfect!" });
    } else {
      showDropFx({ type: "wrong", emoji: "😢", text: "Oops! Try again" });
    }
  };

  const checkAllMatched = () => {
    return NUMBERS.every((num) => matches[num] === num);
  };

  const matchedCount = NUMBERS.reduce(
    (acc, num) => (matches[num] === num ? acc + 1 : acc),
    0
  );

  const handleNext = async () => {
    const allMatched = checkAllMatched();

    if (!allMatched) {
      setStatus("Oh Kiddie you missed some activities 😢😔");
      return;
    }

    setStatus("Perfect! All numbers matched correctly! Saving progress...");
    setShowSuccess(true);

    const data = getData();

    try {
      await axios.post("http://localhost:5000/save", {
        studentId: "child_01",
        activity: "number_matching_0_to_9",
        matches,
        ...data,
      });
    } catch (err) {
      console.error("Number Matching Game save failed:", err);
      alert("Progress could not be saved to the server. Continuing anyway.");
    }

    setTimeout(() => {
      if (onNext) onNext();
    }, 1500);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="lg-root">
        <div className="lg-shell">
          {dropFx && (
            <div
              key={`${dropFx.type}-${dropFx.text}-${dropFx.emoji}`}
              className={`lg-fx ${dropFx.type === "correct" ? "lg-fxHappy" : "lg-fxSad"}`}
              role="status"
              aria-live="polite"
            >
              <div className="lg-fxEmoji" aria-hidden="true">
                {dropFx.emoji}
              </div>
              <div className="lg-fxText">{dropFx.text}</div>
            </div>
          )}

          <div className="lg-topbar">
            <div>
              <h1 className="lg-title">Match the Numbers 🔢</h1>
              <p className="lg-subtitle">
                Drag a number tile, then drop it into the matching box.
              </p>
            </div>

            <div className="lg-chips">
              <div className="lg-chip">
                Matched <strong>{matchedCount}</strong> / {NUMBERS.length}
              </div>
              <div className="lg-chip">
                Tip <strong>Try in order</strong>
              </div>
            </div>
          </div>

          {showSuccess && (
            <div className="lg-successBanner">
              🎉 Superb Kiddie... go on with next activity 🎉
            </div>
          )}

          <div className="lg-grid">
            <div className="lg-card">
              <div className="lg-cardHeader">
                <h3>Drag these numbers</h3>
                <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 700 }}>
                  Pick any tile
                </span>
              </div>
              <div className="lg-cardBody">
                <div className="lg-numberTray">
                  {NUMBERS.map((num) => (
                    <DraggableNumber key={num} num={num} />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg-card">
              <div className="lg-cardHeader">
                <h3>Drop into the boxes</h3>
                <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 700 }}>
                  Match the same number
                </span>
              </div>
              <div className="lg-cardBody">
                <div className="lg-dropGrid">
                  {NUMBERS.map((num) => (
                    <MatchBox
                      key={num}
                      num={num}
                      droppedNumber={matches[num] !== undefined ? matches[num] : null}
                      onDrop={handleDrop}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {status && (
            <div
              className={`lg-status ${
                status.includes("Perfect") ? "lg-statusGood" : "lg-statusBad"
              }`}
              role="status"
              aria-live="polite"
            >
              {status}
            </div>
          )}

          <div className="lg-actions">
            <button onClick={handleNext} className="lg-button">
              Next →
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default LetterGame;
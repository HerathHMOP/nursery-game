import React, { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableItem from "./DraggableItem";
import DropBox from "./DropBox";
import { startTracking, getData } from "./tracker";
import axios from "axios";
import "./AnimalGame.css";

function AnimalGame({ onNext }) {
  const ANIMALS = [
    { name: "dog", emoji: "🐶", label: "Dog 🐕" },
    { name: "cat", emoji: "🐱", label: "Cat 🐈" },
    { name: "elephant", emoji: "🐘", label: "Elephant 🐘" },
    { name: "parrot", emoji: "🦜", label: "Parrot 🦜" },
    { name: "lion", emoji: "🦁", label: "Lion 🦁" },
    { name: "monkey", emoji: "🐵", label: "Monkey 🐵" },
    { name: "bear", emoji: "🐻", label: "Bear 🐻" },
    { name: "rabbit", emoji: "🐰", label: "Rabbit 🐰" },
    { name: "tiger", emoji: "🐯", label: "Tiger 🐯" },
    { name: "giraffe", emoji: "🦒", label: "Giraffe 🦒" },
  ];

  // Function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledAnimals = shuffleArray(ANIMALS);

  const [matches, setMatches] = useState({});
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

  const handleDrop = (animalName) => {
    setMatches((prev) => ({
      ...prev,
      [animalName]: true,
    }));

    const animal = ANIMALS.find((a) => a.name === animalName);
    showDropFx({
      type: "correct",
      emoji: animal?.emoji ?? "🎉",
      text: "Great job!",
    });
  };

  const handleMiss = (draggedName, expectedName) => {
    const dragged = ANIMALS.find((a) => a.name === draggedName);
    const expected = ANIMALS.find((a) => a.name === expectedName);

    showDropFx({
      type: "wrong",
      emoji: dragged?.emoji ?? "😢",
      text: expected ? `Try the ${expected.label}!` : "Try again!",
    });
  };

  const checkAllMatched = () => {
    return ANIMALS.every((animal) => matches[animal.name]);
  };

  const finishGame = async () => {
    if (!checkAllMatched()) {
      alert("Please match all animals first! 🐾");
      return;
    }

    const data = getData();

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/save`, {
        studentId: "child_01",
        activity: "animal_drag_game",
        ...data,
      });
    } catch (err) {
      console.error("AnimalGame save failed:", err);
      alert("Progress could not be saved to the server. Continuing anyway.");
    }

    if (onNext) onNext();
  };

  const allMatched = checkAllMatched();

  useEffect(() => {
    if (allMatched) setShowSuccess(true);
  }, [allMatched]);

  const matchedCount = ANIMALS.reduce(
    (acc, animal) => (matches[animal.name] ? acc + 1 : acc),
    0
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="ag-root">
        <div className="ag-shell">
          {dropFx && (
            <div
              key={`${dropFx.type}-${dropFx.text}-${dropFx.emoji}`}
              className={`ag-fx ${dropFx.type === "correct" ? "ag-fxHappy" : "ag-fxSad"}`}
              role="status"
              aria-live="polite"
            >
              <div className="ag-fxEmoji" aria-hidden="true">
                {dropFx.emoji}
              </div>
              <div className="ag-fxText">{dropFx.text}</div>
            </div>
          )}

          <div className="ag-topbar">
            <div>
              <h1 className="ag-title">Match Animals 🐾</h1>
              <p className="ag-subtitle">
                Drag an animal emoji, then drop it on the correct animal name.
              </p>
            </div>

            <div className="ag-chips">
              <div className="ag-chip">
                Matched <strong>{matchedCount}</strong> / {ANIMALS.length}
              </div>
              <div className="ag-chip">
                Tip <strong>Try the easy ones first</strong>
              </div>
            </div>
          </div>

          {showSuccess && (
            <div className="ag-successBanner">
              🎉 Perfect Kiddie You have been done perfect job 🎉
            </div>
          )}

          <div className="ag-grid">
            <div className="ag-card">
              <div className="ag-cardHeader">
                <h3>Drag these emojis</h3>
                <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 800 }}>
                  Pick any emoji
                </span>
              </div>
              <div className="ag-cardBody">
                <div className="ag-tray">
                  {shuffledAnimals.map((animal) => (
                    <DraggableItem
                      key={animal.name}
                      name={animal.name}
                      emoji={animal.emoji}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="ag-card">
              <div className="ag-cardHeader">
                <h3>Drop on the correct name</h3>
                <span style={{ fontSize: 13, opacity: 0.75, fontWeight: 800 }}>
                  Match emoji → animal
                </span>
              </div>
              <div className="ag-cardBody">
                <div className="ag-dropGrid">
                  {ANIMALS.map((animal) => (
                    <DropBox
                      key={animal.name}
                      acceptName={animal.name}
                      label={animal.label}
                      isMatched={matches[animal.name]}
                      onDrop={() => handleDrop(animal.name)}
                      onMiss={handleMiss}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="ag-actions">
            <button onClick={finishGame} disabled={!allMatched} className="ag-button">
              {allMatched ? "Next ➡️" : "Match all animals first! 🐾"}
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}

export default AnimalGame;
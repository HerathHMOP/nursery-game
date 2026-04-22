import React, { useState } from "react";
import LetterGame from "./LetterGame";
import AnimalGame from "./AnimalGame";
import ColorGame from "./ColorGame";

function App() {
  const [currentGame, setCurrentGame] = useState("letter");

  // test
  const games = [
    { key: "letter", name: "Letter Game" },
    { key: "animal", name: "Animal Game" },
    { key: "color", name: "Color Game" },
  ];

  return (
    <div>
      <nav style={{
        display: "flex",
        justifyContent: "center",
        padding: "10px",
        backgroundColor: "#f0f0f0",
        borderBottom: "2px solid #ccc",
        marginBottom: "20px"
      }}>
        {games.map((game) => (
          <button
            key={game.key}
            onClick={() => setCurrentGame(game.key)}
            style={{
              margin: "0 10px",
              padding: "10px 20px",
              backgroundColor: currentGame === game.key ? "#4CAF50" : "#ffffff",
              color: currentGame === game.key ? "white" : "black",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
            }}
          >
            {game.name}
          </button>
        ))}
      </nav>

      {currentGame === "letter" && <LetterGame onNext={() => setCurrentGame("animal")} />}
      {currentGame === "animal" && <AnimalGame onNext={() => setCurrentGame("color")} />}
      {currentGame === "color" && <ColorGame onNext={() => setCurrentGame("letter")} />}
    </div>
  );
}

export default App;
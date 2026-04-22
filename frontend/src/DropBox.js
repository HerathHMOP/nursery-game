import React from "react";
import { useDrop } from "react-dnd";
import { recordDrop } from "./tracker";
import "./AnimalGame.css";

function DropBox({ acceptName, label, isMatched, onDrop, onMiss }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "ITEM",
    drop: (item) => {
      if (item.name === acceptName) {
        recordDrop(true);
        if (onDrop) onDrop();
      } else {
        recordDrop(false);
        if (onMiss) onMiss(item?.name, acceptName);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <div
      ref={drop}
      className={`ag-dropBox ${isMatched ? "ag-dropBoxMatched" : ""} ${
        !isMatched && isOver ? "ag-dropBoxOver" : ""
      }`}
    >
      {label}
    </div>
  );
}

export default DropBox;
import React from "react";
import { useDrag } from "react-dnd";
import { recordDrag } from "./tracker";
import "./AnimalGame.css";

function DraggableItem({ name, emoji }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ITEM",
    item: { name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => recordDrag(),
  }));

  return (
    <div
      ref={drag}
      className={`ag-animalTile ${isDragging ? "ag-animalTileDragging" : ""}`}
    >
      {emoji}
    </div>
  );
}

export default DraggableItem;
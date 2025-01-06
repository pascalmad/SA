"use client";

import { useState } from "react";

export default function SudokuField({
  dimension,
  sudoku,
  updateSudoku,
}: {
  dimension: 2 | 3;
  sudoku: (number | null)[][];
  updateSudoku: (x: number, y: number, value: number | null) => void;
}) {
  const [activeCell, setActiveCell] = useState<{ x: number; y: number } | null>(
    null
  );

  const gridDimensions = {
    2: "grid-cols-2 grid-rows-2",
    3: "grid-cols-3 grid-rows-3",
  };

  const NumberField = ({ x, y }: { x: number; y: number }) => {
    return (
      <input
        className="text-center border caret-transparent h-full w-full outline-0 focus:bg-green-200"
        tabIndex={0}
        type="text"
        name={`sudoku[${x}][${y}]`}
        defaultValue={sudoku[x][y] === null ? "null" : sudoku[x][y]}
        onKeyDown={(e) => {
          e.preventDefault();
          setActiveCell({ x, y });
          if (e.key === "Backspace") {
            updateSudoku(x, y, null);
            return;
          }
          const value = [...Array(dimension ** 2).keys()]
            .map((i) => i + 1)
            .includes(parseInt(e.key))
            ? parseInt(e.key)
            : null;
          if (value === null) {
            return;
          }
          updateSudoku(x, y, value);
        }}
        autoFocus={x === activeCell?.x && y === activeCell?.y}
      />
    );
  };

  return (
    <div className={`grid border border-black ${gridDimensions[dimension]}`}>
      {[...Array(dimension ** 2).keys()].map((i) => (
        <div
          key={i}
          className={`border border-black size-48 grid ${
            gridDimensions[dimension as 2 | 3]
          }`}
        >
          {[...Array(dimension ** 2).keys()].map((j) => {
            const x = i + Math.floor(j / dimension) - (i % dimension);
            const y =
              j - (Math.floor(j / dimension) - (i % dimension)) * dimension;
            return <NumberField key={j} x={x} y={y} />;
          })}
        </div>
      ))}
    </div>
  );
}

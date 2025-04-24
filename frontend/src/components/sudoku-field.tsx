"use client";

import { useState } from "react";

export default function SudokuField({
  dimension,
  sudoku,
  originalSudoku,
  updateSudoku,
  disabledFields,
}: {
  dimension: 2 | 3 | 4 | 5;
  sudoku: (number | null)[][];
  originalSudoku: (number | null)[][];
  updateSudoku: (x: number, y: number, value: number | null) => void;
  disabledFields: { x: number; y: number }[];
}) {
  const [activeCell, setActiveCell] = useState<{ x: number; y: number } | null>(
    null
  );
  console.log("original: ", originalSudoku);

  const gridDimensions = {
    2: "grid-cols-2 grid-rows-2",
    3: "grid-cols-3 grid-rows-3",
    4: "grid-cols-4 grid-rows-4",
    5: "grid-cols-5 grid-rows-5",
  };

  const NumberField = ({ x, y }: { x: number; y: number }) => {
    const isDisabled = disabledFields.some(
      (field) => field.x === x && field.y === y
    );
    return (
      <input
        className={`text-center border caret-transparent h-full w-full outline-0 focus:bg-green-200 ${
          isDisabled ? "bg-gray-100 font-bold text-blue-600" : "bg-white"
        }`}
        tabIndex={0}
        type="text"
        autoComplete="off"
        name={`sudoku[${x}][${y}]`}
        disabled={isDisabled}
        defaultValue={sudoku[x][y] === null ? "" : sudoku[x][y]}
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
            gridDimensions[dimension as 2 | 3 | 4 | 5]
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

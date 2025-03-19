"use client";

import { useState } from "react";
import SudokuField from "./sudoku-field";
import { Sudoku } from "@/types/sudoku";
import { cloneDeep } from "lodash";

export default function SudokuGenerate({
  incompleteSudoku,
  completeSudoku,
}: {
  incompleteSudoku: Sudoku;
  completeSudoku: Sudoku;
}) {
  console.log("completeSudoku: ", completeSudoku.sudoku);
  console.log("incompleteSudoku: ", incompleteSudoku.sudoku);
  const [sudoku, setSudoku] = useState(
    Object.assign([], incompleteSudoku.sudoku)
  );
  const updateSudoku = (x: number, y: number, value: number | null) => {
    const newSudoku = cloneDeep(sudoku);
    newSudoku[x][y] = value;
    setSudoku(newSudoku);
  };

  const disabledFields = incompleteSudoku.sudoku
    .flatMap((row, x) =>
      row.map((value, y) => (value !== null ? { x, y } : null))
    )
    .filter((field): field is { x: number; y: number } => field !== null);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-lg">
        <span className="font-bold">Schwierigkeitsgrad: </span>
        <span className="capitalize">
          {incompleteSudoku.difficulty || "normal"}
        </span>
      </div>
      <SudokuField
        dimension={3}
        sudoku={sudoku}
        originalSudoku={incompleteSudoku.sudoku}
        updateSudoku={updateSudoku}
        disabledFields={incompleteSudoku.disabledFields}
      />
    </div>
  );
}

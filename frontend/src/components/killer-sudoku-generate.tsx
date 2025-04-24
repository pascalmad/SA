"use client";

import { useState } from "react";
import KillerSudokuField from "./killer-sudoku-field";
import { Sudoku } from "@/types/sudoku";
import { cloneDeep } from "lodash";

export default function KillerSudokuGenerate({
  incompleteSudoku,
  completeSudoku,
}: {
  incompleteSudoku: Sudoku;
  completeSudoku: Sudoku;
}) {
  console.log("completeSudoku: ", completeSudoku.sudoku);
  console.log("incompleteSudoku: ", incompleteSudoku.sudoku);
  const [sudoku, setSudoku] = useState<(number | null)[][]>(
    cloneDeep(incompleteSudoku.sudoku)
  );

  const updateSudoku = (x: number, y: number, value: number | null) => {
    const newSudoku = cloneDeep(sudoku);
    newSudoku[x][y] = value;
    setSudoku(newSudoku);
  };

  if (!incompleteSudoku.cages) {
    return <div>Fehler: Keine Käfige für das Killer-Sudoku gefunden</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-lg">
        <span className="font-bold">Schwierigkeitsgrad: </span>
        <span className="capitalize">
          {incompleteSudoku.difficulty || "normal"}
        </span>
        <span className="font-bold ml-4">Typ: </span>
        <span>Killer-Sudoku</span>
      </div>
      <KillerSudokuField
        dimension={incompleteSudoku.dimension}
        sudoku={sudoku}
        updateSudoku={updateSudoku}
        disabledFields={incompleteSudoku.disabledFields}
        cages={incompleteSudoku.cages}
      />
    </div>
  );
}

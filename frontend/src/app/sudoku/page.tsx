"use client";

import { generateSudoku } from "@/actions/sudokuActions";
import SudokuGenerate from "@/components/sudoku-generate";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sudoku } from "@/types/sudoku";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

export default function SudokuPage() {
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">(
    "normal"
  );
  const [loading, setLoading] = useState(true);
  const [incompleteSudoku, setIncompleteSudoku] = useState<Sudoku | null>(null);
  const [completeSudoku, setCompleteSudoku] = useState<Sudoku | null>(null);

  async function loadSudoku(difficultyLevel: "easy" | "normal" | "hard") {
    setLoading(true);
    try {
      const response = await generateSudoku(3, difficultyLevel);

      // Erstelle die Liste der deaktivierten Felder
      const disabledFields = response.unsolvedSudoku
        .flatMap((row: (number | null)[], x: number) =>
          row.map((value: number | null, y: number) =>
            value !== null ? { x, y } : null
          )
        )
        .filter(
          (
            field: { x: number; y: number } | null
          ): field is { x: number; y: number } => field !== null
        );

      setIncompleteSudoku({
        dimension: 3,
        sudoku: response.unsolvedSudoku,
        disabledFields: disabledFields,
        difficulty: difficultyLevel,
      });

      setCompleteSudoku({
        dimension: 3,
        sudoku: response.solvedSudoku,
        disabledFields: disabledFields,
        difficulty: difficultyLevel,
      });
    } catch (error) {
      console.error("Fehler beim Laden des Sudokus:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSudoku(difficulty);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <h1 className="text-4xl font-bold">Sudoku</h1>

      <div className="flex flex-col space-y-4 mb-6">
        <h2 className="text-xl font-semibold">Schwierigkeitsgrad</h2>
        <RadioGroup
          value={difficulty}
          onValueChange={(value) =>
            setDifficulty(value as "easy" | "normal" | "hard")
          }
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="easy" id="easy" />
            <Label htmlFor="easy">Leicht</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="normal" />
            <Label htmlFor="normal">Normal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="hard" />
            <Label htmlFor="hard">Schwer</Label>
          </div>
        </RadioGroup>

        <Button onClick={() => loadSudoku(difficulty)} className="mt-2">
          Neues Sudoku generieren
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Sudoku wird geladen...</div>
      ) : (
        incompleteSudoku &&
        completeSudoku && (
          <SudokuGenerate
            incompleteSudoku={incompleteSudoku}
            completeSudoku={completeSudoku}
          />
        )
      )}
    </div>
  );
}

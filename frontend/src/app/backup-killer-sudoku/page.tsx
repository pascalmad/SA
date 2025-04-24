"use client";

import { generateKillerSudoku } from "@/actions/sudokuActions";
import KillerSudokuGenerate from "@/components/killer-sudoku-generate";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sudoku } from "@/types/sudoku";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

export default function KillerSudokuPage() {
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">(
    "normal"
  );
  const [loading, setLoading] = useState(true);
  const [incompleteSudoku, setIncompleteSudoku] = useState<Sudoku | null>(null);
  const [completeSudoku, setCompleteSudoku] = useState<Sudoku | null>(null);

  async function loadSudoku(difficultyLevel: "easy" | "normal" | "hard") {
    setLoading(true);
    try {
      const response = await generateKillerSudoku(3, difficultyLevel);

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
        cages: response.cages,
        isKiller: true,
      });

      setCompleteSudoku({
        dimension: 3,
        sudoku: response.solvedSudoku,
        disabledFields: disabledFields,
        difficulty: difficultyLevel,
        cages: response.cages,
        isKiller: true,
      });
    } catch (error) {
      console.error("Fehler beim Laden des Killer-Sudokus:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSudoku(difficulty);
  }, [difficulty]);

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-8">
      <h1 className="text-4xl font-bold">Killer-Sudoku</h1>

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
            <RadioGroupItem value="easy" id="killer-easy" />
            <Label htmlFor="killer-easy">Leicht</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="normal" id="killer-normal" />
            <Label htmlFor="killer-normal">Normal</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hard" id="killer-hard" />
            <Label htmlFor="killer-hard">Schwer</Label>
          </div>
        </RadioGroup>

        <Button onClick={() => loadSudoku(difficulty)} className="mt-2">
          Neues Killer-Sudoku generieren
        </Button>
      </div>

      {loading ? (
        <div className="text-center">Killer-Sudoku wird geladen...</div>
      ) : (
        incompleteSudoku &&
        completeSudoku && (
          <KillerSudokuGenerate
            incompleteSudoku={incompleteSudoku}
            completeSudoku={completeSudoku}
          />
        )
      )}

      <div className="mt-6">
        <Button
          variant="outline"
          onClick={() => (window.location.href = "/sudoku")}
        >
          Zu klassischem Sudoku wechseln
        </Button>
      </div>
    </div>
  );
}

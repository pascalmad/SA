"use client";

import { generateSudoku } from "@/actions/sudokuActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sudoku } from "@/types/sudoku";
import { useEffect, useState } from "react";
import { Clock, Pencil, Eraser, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { cloneDeep } from "lodash";
import { Skeleton } from "@/components/ui/skeleton";

export default function SudokuPage() {
  const [difficulty, setDifficulty] = useState<"easy" | "normal" | "hard">(
    "normal"
  );
  const [loading, setLoading] = useState(false);
  const [incompleteSudoku, setIncompleteSudoku] = useState<Sudoku | null>(null);
  const [, setCompleteSudoku] = useState<Sudoku | null>(null);

  // Zusätzliche States für die verbesserte UI
  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({});
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);

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

      const incompleteSudokuData = {
        dimension: 3 as const,
        sudoku: response.unsolvedSudoku,
        disabledFields: disabledFields,
        difficulty: difficultyLevel,
      };

      const completeSudokuData = {
        dimension: 3 as const,
        sudoku: response.solvedSudoku,
        disabledFields: disabledFields,
        difficulty: difficultyLevel,
      };

      setIncompleteSudoku(incompleteSudokuData);
      setCompleteSudoku(completeSudokuData);

      // Konvertiere das Backend-Format (2D-Array mit null-Werten) in ein Format für unsere UI
      // Ein 9x9 Array mit Zahlen, wobei 0 leere Zellen repräsentiert
      const formattedBoard = response.unsolvedSudoku.map(
        (row: (number | null)[]) =>
          row.map((cell: number | null) => (cell === null ? 0 : cell))
      );

      setBoard(formattedBoard);

      // Zurücksetzen der Spielzustände
      setNotes({});
      setSelectedCell(null);
      setTimer(0);
      setIsRunning(true);
      setConflicts([]);
    } catch (error) {
      console.error("Fehler beim Laden des Sudokus:", error);
    } finally {
      setLoading(false);
    }
  }

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning) {
      interval = setInterval(() => {
        setTimer((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Initialer Ladeprozess
  useEffect(() => {
    if (typeof window !== "undefined") {
      loadSudoku(difficulty);
    }
  }, [difficulty]);

  // Hilfsfunktion: Ursprüngliche Zahlen (nicht veränderbar)
  const isOriginalCell = (row: number, col: number): boolean => {
    if (!incompleteSudoku) return false;
    const originalValue = incompleteSudoku.sudoku[row][col];
    return originalValue !== null;
  };

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  // Check if a cell has conflicts
  const hasConflict = (row: number, col: number) => {
    if (board[row][col] === 0) return false;
    const cellKey = `${row}-${col}`;
    return conflicts.includes(cellKey);
  };

  // Update conflicts in the board
  const updateConflicts = (newBoard: (number | null)[][]) => {
    const newConflicts: string[] = [];

    // Check for conflicts in rows
    for (let row = 0; row < 9; row++) {
      const rowValues: Record<number, number[]> = {};
      for (let col = 0; col < 9; col++) {
        const cellValue = newBoard[row][col];
        if (cellValue === 0 || cellValue === null) continue;

        if (!rowValues[cellValue]) rowValues[cellValue] = [];
        rowValues[cellValue].push(col);
      }

      // Find duplicates
      Object.values(rowValues).forEach((cols) => {
        if (cols.length > 1) {
          cols.forEach((col) => newConflicts.push(`${row}-${col}`));
        }
      });
    }

    // Check for conflicts in columns
    for (let col = 0; col < 9; col++) {
      const colValues: Record<number, number[]> = {};
      for (let row = 0; row < 9; row++) {
        const cellValue = newBoard[row][col];
        if (cellValue === 0 || cellValue === null) continue;

        if (!colValues[cellValue]) colValues[cellValue] = [];
        colValues[cellValue].push(row);
      }

      // Find duplicates
      Object.values(colValues).forEach((rows) => {
        if (rows.length > 1) {
          rows.forEach((row) => newConflicts.push(`${row}-${col}`));
        }
      });
    }

    // Check for conflicts in 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        const boxValues: Record<number, Array<[number, number]>> = {};

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxRow * 3 + r;
            const col = boxCol * 3 + c;
            const cellValue = newBoard[row][col];
            if (cellValue === 0 || cellValue === null) continue;

            if (!boxValues[cellValue]) boxValues[cellValue] = [];
            boxValues[cellValue].push([row, col]);
          }
        }

        // Find duplicates
        Object.values(boxValues).forEach((positions) => {
          if (positions.length > 1) {
            positions.forEach(([row, col]) =>
              newConflicts.push(`${row}-${col}`)
            );
          }
        });
      }
    }

    setConflicts(newConflicts);
    return newConflicts.length === 0;
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;

    // Check if the cell is part of the original puzzle
    if (isOriginalCell(row, col)) return;

    if (isNoteMode) {
      // Handle notes mode
      const cellKey = `${row}-${col}`;
      const currentNotes = notes[cellKey] || [];

      if (currentNotes.includes(num)) {
        // Remove the note if it already exists
        setNotes({
          ...notes,
          [cellKey]: currentNotes.filter((n) => n !== num),
        });
      } else {
        // Add the note
        setNotes({
          ...notes,
          [cellKey]: [...currentNotes, num].sort(),
        });
      }
    } else {
      // Normal mode - update the board
      const newBoard = cloneDeep(board);

      // Toggle number: if same number already exists, set to 0, otherwise set to clicked number
      if (newBoard[row][col] === num) {
        newBoard[row][col] = 0;

        // Lösche auch Notizen, wenn die Zelle geleert wird
        const cellKey = `${row}-${col}`;
        const newNotes = { ...notes };
        delete newNotes[cellKey];
        setNotes(newNotes);
      } else {
        newBoard[row][col] = num;

        // Lösche alle Notizen für diese Zelle, wenn eine Zahl eingetragen wird
        const cellKey = `${row}-${col}`;
        if (notes[cellKey]) {
          const newNotes = { ...notes };
          delete newNotes[cellKey];
          setNotes(newNotes);
        }
      }

      setBoard(newBoard);
      updateConflicts(newBoard);
    }
  };

  // Effect, um Konflikte zu aktualisieren, wenn sich das Board ändert
  useEffect(() => {
    if (board.length > 0) {
      updateConflicts(board);
    }
  }, [board]);

  // Reset the board
  const resetBoard = () => {
    if (incompleteSudoku) {
      const formattedBoard = incompleteSudoku.sudoku.map((row) =>
        row.map((cell) => (cell === null ? 0 : cell))
      );
      setBoard(formattedBoard);
      setNotes({});
      setTimer(0);
      setIsRunning(true);
    }
  };

  // Erase the selected cell
  const eraseCell = () => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;

    // Check if the cell is part of the original puzzle
    if (isOriginalCell(row, col)) return;

    // Deep copy des Boards, um unerwartete Nebeneffekte zu vermeiden
    const newBoard = cloneDeep(board);

    if (newBoard[row][col] !== 0) {
      newBoard[row][col] = 0;
      setBoard(newBoard);
    }

    // Also clear notes for this cell
    const cellKey = `${row}-${col}`;
    if (notes[cellKey]) {
      const newNotes = { ...notes };
      delete newNotes[cellKey];
      setNotes(newNotes);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Sudoku</h1>
          <p className="text-muted-foreground mb-2">
            Löse das Puzzle, indem du jede Zeile, Spalte und Box mit den Zahlen
            1-9 auffüllst
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-4">
                {/* Game info skeleton */}
                <div className="flex justify-between items-center mb-4 bg-card p-3 rounded-lg shadow">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-muted" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>

                {/* Sudoku grid skeleton */}
                <div className="aspect-square w-full max-w-md mx-auto animate-pulse">
                  <div className="grid grid-cols-9 gap-[1px] border-2 border-primary/30 shadow-lg">
                    {Array.from({ length: 9 }).map((_, rowIndex) =>
                      Array.from({ length: 9 }).map((_, colIndex) => {
                        // Border styling for 3x3 boxes
                        const borderRight =
                          (colIndex + 1) % 3 === 0 && colIndex < 8
                            ? "border-r-[3px] border-r-primary/30"
                            : "border-r border-r-primary/20";
                        const borderBottom =
                          (rowIndex + 1) % 3 === 0 && rowIndex < 8
                            ? "border-b-[3px] border-b-primary/30"
                            : "border-b border-b-primary/20";

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`aspect-square flex items-center justify-center relative cursor-pointer transition-colors bg-muted/20 ${borderRight} ${borderBottom}`}
                          >
                            {/* Ein paar zufällige Zellen mit Skeleton Zahlen füllen */}
                            {Math.random() > 0.7 && (
                              <Skeleton className="h-6 w-6 rounded-md" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardContent className="p-4">
                {/* Buttons skeleton */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 flex-1" />
                  ))}
                </div>

                {/* Mode info skeleton */}
                <Skeleton className="h-20 w-full mb-3" />

                {/* Number buttons skeleton */}
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Sudoku</h1>
        <p className="text-muted-foreground mb-2">
          Löse das Puzzle, indem du jede Zeile, Spalte und Box mit den Zahlen
          1-9 auffüllst
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* Game info */}
              <div className="flex justify-between items-center mb-4 bg-card p-3 rounded-lg shadow">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/20 text-primary font-medium px-3 py-1 rounded-full text-sm border border-primary/30">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {board.flat().filter((cell) => cell === 0).length}{" "}
                    verbleibend
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-mono">{formatTime(timer)}</span>
                </div>
              </div>

              {/* Sudoku grid */}
              <div className="aspect-square w-full max-w-md mx-auto">
                <div className="grid grid-cols-9 border-2 border-primary shadow-lg overflow-hidden">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isOriginal = isOriginalCell(rowIndex, colIndex);
                      const isSelected =
                        selectedCell &&
                        selectedCell[0] === rowIndex &&
                        selectedCell[1] === colIndex;
                      const hasErr = hasConflict(rowIndex, colIndex);
                      const isSameRow =
                        selectedCell && selectedCell[0] === rowIndex;
                      const isSameCol =
                        selectedCell && selectedCell[1] === colIndex;
                      const isSameBox =
                        selectedCell &&
                        Math.floor(selectedCell[0] / 3) ===
                          Math.floor(rowIndex / 3) &&
                        Math.floor(selectedCell[1] / 3) ===
                          Math.floor(colIndex / 3);
                      const isSameNumber =
                        selectedCell &&
                        board[selectedCell[0]][selectedCell[1]] !== 0 &&
                        board[selectedCell[0]][selectedCell[1]] === cell;

                      // Border styling for 3x3 boxes - using inset borders to avoid gaps
                      const borderRight =
                        (colIndex + 1) % 3 === 0 && colIndex < 8
                          ? "border-r-[3px] border-r-primary"
                          : "border-r border-r-primary/30";
                      const borderBottom =
                        (rowIndex + 1) % 3 === 0 && rowIndex < 8
                          ? "border-b-[3px] border-b-primary"
                          : "border-b border-b-primary/30";

                      const cellKey = `${rowIndex}-${colIndex}`;
                      const cellNotes = notes[cellKey] || [];

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={cn(
                            "aspect-square flex items-center justify-center relative cursor-pointer transition-colors",
                            borderRight,
                            borderBottom,
                            isSelected
                              ? "bg-blue-200 dark:bg-blue-600/60"
                              : isSameRow || isSameCol || isSameBox
                              ? "bg-primary/10 dark:bg-primary/20"
                              : isSameNumber && cell !== 0
                              ? "bg-primary/20 dark:bg-primary/30"
                              : isOriginal
                              ? "bg-blue-50 dark:bg-secondary/30"
                              : "bg-background",
                            hasErr &&
                              "bg-destructive/30 dark:bg-destructive/40",
                            isOriginal ? "font-bold" : "font-normal"
                          )}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                        >
                          {cell !== 0 ? (
                            <span
                              className={cn(
                                "text-lg md:text-xl",
                                isSelected
                                  ? "text-blue-900 dark:text-white"
                                  : isOriginal
                                  ? "text-blue-700 font-bold dark:text-white"
                                  : "text-slate-600 dark:text-gray-200",
                                hasErr &&
                                  "text-destructive dark:text-red-400 font-bold"
                              )}
                            >
                              {cell}
                            </span>
                          ) : (
                            cellNotes.length > 0 && (
                              <div className="grid grid-cols-3 gap-[1px] text-[8px] md:text-[10px] w-full h-full p-[2px]">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                  <div
                                    key={num}
                                    className={cn(
                                      "flex items-center justify-center",
                                      isSelected
                                        ? "text-blue-900 dark:text-white"
                                        : "text-foreground/60 dark:text-gray-400"
                                    )}
                                  >
                                    {cellNotes.includes(num) ? num : ""}
                                  </div>
                                ))}
                              </div>
                            )
                          )}
                          {isOriginal && cell !== 0 && (
                            <div className="absolute inset-0 border-2 border-blue-200 dark:border-blue-500/20 rounded-sm pointer-events-none" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                <Button
                  variant={isNoteMode ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsNoteMode(!isNoteMode)}
                  className="flex-1 relative"
                >
                  <Pencil
                    className={cn(
                      "h-4 w-4",
                      isNoteMode && "text-primary-foreground"
                    )}
                  />
                  {isNoteMode && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary-foreground" />
                  )}
                  <span className="sr-only">Notes Mode</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={eraseCell}
                  className="flex-1"
                >
                  <Eraser className="h-4 w-4" />
                  <span className="sr-only">Erase</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={resetBoard}
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Reset</span>
                </Button>
              </div>

              <div className="p-2 mb-3 bg-muted/40 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-sm",
                      isNoteMode ? "bg-primary" : "bg-primary/30"
                    )}
                  ></div>
                  <p className="text-sm font-medium">
                    {isNoteMode
                      ? "Notizen-Modus: Kandidaten hinzufügen"
                      : "Normal-Modus: Zelle ausfüllen"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {isNoteMode
                    ? "Klicke mehrere Zahlen als Kandidaten"
                    : "Klicke eine Zahl, um sie in der ausgewählten Zelle zu platzieren"}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                  // Überprüfen, wie oft die Nummer bereits verwendet wurde
                  const usedCount = board
                    .flat()
                    .filter((cell) => cell === num).length;
                  const isComplete = usedCount >= 9; // Alle möglichen Vorkommen erschöpft

                  return (
                    <Button
                      key={num}
                      variant={isComplete ? "ghost" : "outline"}
                      onClick={() => handleNumberInput(num)}
                      className={cn(
                        "h-12 text-lg transition-all",
                        isComplete && "opacity-50 cursor-not-allowed",
                        isNoteMode &&
                          "border-primary/70 border-dashed bg-primary/5",
                        !isNoteMode && !isComplete && "hover:bg-primary/10"
                      )}
                      disabled={isComplete}
                    >
                      {num}
                      {!isComplete && (
                        <span className="absolute bottom-1 right-1 text-[10px] font-medium text-primary/80">
                          {9 - usedCount}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Schwierigkeitsgrad</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={difficulty === "easy" ? "default" : "outline"}
                  onClick={() => setDifficulty("easy")}
                  className="transition-colors"
                >
                  Leicht
                </Button>
                <Button
                  variant={difficulty === "normal" ? "default" : "outline"}
                  onClick={() => setDifficulty("normal")}
                  className="transition-colors"
                >
                  Normal
                </Button>
                <Button
                  variant={difficulty === "hard" ? "default" : "outline"}
                  onClick={() => setDifficulty("hard")}
                  className="transition-colors"
                >
                  Schwer
                </Button>
              </div>
              <Button onClick={() => loadSudoku(difficulty)} className="w-full">
                Neues Sudoku
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Eraser, RotateCcw, Clock, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Sample Sudoku puzzle (0 represents empty cells)
const samplePuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

export default function SudokuSolver() {
  const [board, setBoard] = useState(samplePuzzle);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [isNoteMode, setIsNoteMode] = useState(false);
  const [notes, setNotes] = useState<Record<string, number[]>>({}); // Format: "row-col": [1, 2, 3]
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [difficulty, setDifficulty] = useState("medium");
  const [conflicts, setConflicts] = useState<string[]>([]); // Format: "row-col"

  // Einfache Toast-Funktion als Ersatz für useToast
  const toast = (props: {
    title: string;
    description: string;
    duration?: number;
    variant?: string;
  }) => {
    // Nur kritische Nachrichten anzeigen (Konflikte und Gewinnmeldung)
    if (props.title === "Warning" || props.title === "Congratulations!") {
      console.log(`Toast: ${props.title} - ${props.description}`);
    }
    // Andere Nachrichten werden ignoriert
  };

  // Timer effect
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

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  // Check if a cell has conflicts
  const hasConflict = (row: number, col: number) => {
    if (board[row][col] === 0) return false;

    const cellKey = `${row}-${col}`;

    // Die Konflikte werden nun in useState gespeichert
    return conflicts.includes(cellKey);
  };

  // Update conflicts in the board
  const updateConflicts = (newBoard: number[][]) => {
    const newConflicts: string[] = [];

    // Check for conflicts in rows
    for (let row = 0; row < 9; row++) {
      const rowValues: Record<number, number[]> = {};
      for (let col = 0; col < 9; col++) {
        const cellValue = newBoard[row][col];
        if (cellValue === 0) continue;

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
        if (cellValue === 0) continue;

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
            if (cellValue === 0) continue;

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

  // Handle number input mit verbesserten Konfliktchecks
  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;

    // Check if the cell is part of the original puzzle
    if (samplePuzzle[row][col] !== 0) return;

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
      const newBoard = [...board.map((r) => [...r])]; // Create a deep copy of the board

      // Toggle number: if same number already exists, set to 0, otherwise set to clicked number
      if (newBoard[row][col] === num) {
        newBoard[row][col] = 0;
        console.log(`Removing number ${num} at [${row},${col}]`);
        toast({
          title: "Number removed",
          description: `Removed ${num} from cell.`,
          duration: 1500,
        });

        // Auch Notizen löschen, wenn die Zelle geleert wird
        const cellKey = `${row}-${col}`;
        const newNotes = { ...notes };
        delete newNotes[cellKey];
        setNotes(newNotes);
      } else {
        newBoard[row][col] = num;
        console.log(`Adding number ${num} at [${row},${col}]`);

        // Lösche alle Notizen für diese Zelle, wenn eine Zahl eingetragen wird
        const cellKey = `${row}-${col}`;
        if (notes[cellKey]) {
          const newNotes = { ...notes };
          delete newNotes[cellKey];
          setNotes(newNotes);
        }

        // Überprüfe auf Konflikte nach dem Hinzufügen
        const noConflicts = updateConflicts(newBoard);

        if (noConflicts) {
          // Prüfe, ob Sudoku vollständig und korrekt gelöst wurde
          const emptyCells = newBoard
            .flat()
            .filter((cell) => cell === 0).length;
          if (emptyCells === 0) {
            toast({
              title: "Congratulations!",
              description: "You've solved the Sudoku puzzle!",
              duration: 3000,
            });
            setIsRunning(false); // Stoppe den Timer bei erfolgreichem Lösen
          }
        } else {
          // Bei Konflikten einen Warnungstoast anzeigen
          toast({
            title: "Warning",
            description: "This move creates conflicts with other numbers.",
            variant: "destructive",
            duration: 2000,
          });
        }
      }

      setBoard(newBoard);
      console.log("Current board state:", newBoard);
    }
  };

  // Effect, um Konflikte zu aktualisieren, wenn sich das Board ändert
  useEffect(() => {
    updateConflicts(board);
  }, [board]);

  // Reset the board
  const resetBoard = () => {
    setBoard(samplePuzzle);
    setNotes({});
    setTimer(0);
    setIsRunning(true);
  };

  // Erase the selected cell
  const eraseCell = () => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;

    // Check if the cell is part of the original puzzle
    if (samplePuzzle[row][col] !== 0) return;

    // Deep copy des Boards, um unerwartete Nebeneffekte zu vermeiden
    const newBoard = [...board.map((r) => [...r])];

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

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Sudoku Solver</h1>
        <p className="text-muted-foreground mb-2">
          Solve the puzzle by filling in the grid
        </p>

        <div className="flex justify-center items-center gap-2 mb-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Info className="h-4 w-4" />
                How to Play
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              <h3 className="font-medium mb-2">How to Play Sudoku</h3>
              <ul className="space-y-1 list-disc pl-4">
                <li>Fill each cell with numbers 1-9</li>
                <li>
                  Each row, column and 3×3 box must contain all numbers 1-9
                  without repetition
                </li>
                <li>Pre-filled numbers (bold) cannot be changed</li>
                <li>Use notes mode to add candidate numbers</li>
                <li>Conflicting numbers will be highlighted in red</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
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
                    {board.flat().filter((cell) => cell === 0).length} remaining
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="font-mono">{formatTime(timer)}</span>
                </div>
              </div>

              {/* Sudoku grid */}
              <div className="aspect-square w-full max-w-md mx-auto">
                <div className="grid grid-cols-9 gap-[1px] border-2 border-primary shadow-lg">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isOriginal = samplePuzzle[rowIndex][colIndex] !== 0;
                      const isSelected =
                        selectedCell &&
                        selectedCell[0] === rowIndex &&
                        selectedCell[1] === colIndex;
                      const hasError = hasConflict(rowIndex, colIndex);
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

                      // Border styling for 3x3 boxes - verstärkte Borders für bessere Sichtbarkeit
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
                              ? "bg-primary text-foreground dark:bg-primary/80 dark:text-white"
                              : isSameRow || isSameCol || isSameBox
                              ? "bg-primary/10 dark:bg-primary/20"
                              : isSameNumber && cell !== 0
                              ? "bg-primary/20 dark:bg-primary/30"
                              : isOriginal
                              ? "bg-blue-50 dark:bg-secondary/30"
                              : "bg-background",
                            hasError &&
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
                                  ? "text-white dark:text-white"
                                  : isOriginal
                                  ? "text-blue-700 font-bold dark:text-white"
                                  : "text-slate-600 dark:text-gray-200",
                                hasError &&
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
                                    className="flex items-center justify-center text-foreground/60 dark:text-gray-400"
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
                      ? "Notes Mode: Add candidate numbers"
                      : "Normal Mode: Fill cells with numbers"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  {isNoteMode
                    ? "Click multiple numbers as candidates"
                    : "Click a number to place it in the selected cell"}
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
              <h3 className="font-medium mb-3">Choose Difficulty</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <Button
                  variant={difficulty === "easy" ? "default" : "outline"}
                  onClick={() => setDifficulty("easy")}
                  className="transition-colors"
                >
                  Easy
                </Button>
                <Button
                  variant={difficulty === "medium" ? "default" : "outline"}
                  onClick={() => setDifficulty("medium")}
                  className="transition-colors"
                >
                  Medium
                </Button>
                <Button
                  variant={difficulty === "hard" ? "default" : "outline"}
                  onClick={() => setDifficulty("hard")}
                  className="transition-colors"
                >
                  Hard
                </Button>
              </div>
              <Button onClick={resetBoard} className="w-full">
                Start New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

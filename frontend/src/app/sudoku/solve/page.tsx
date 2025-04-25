"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useMemo } from "react";
import { solveSudoku } from "@/actions/sudokuActions";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw } from "lucide-react";

export default function SudokuSolvePage() {
  // Dimensions for different sudoku sizes
  type SudokuDimension = 2 | 3 | 4 | 5;

  const dimensionToGridSize = useMemo(
    () => ({
      2: 4, // 4x4
      3: 9, // 9x9
      4: 16, // 16x16
      5: 25, // 25x25
    }),
    []
  );

  const [dimension, setDimension] = useState<SudokuDimension>(3);
  const [inputBoard, setInputBoard] = useState<(number | null)[][]>([]);
  const [solvedBoard, setSolvedBoard] = useState<(number | null)[][]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // Initialize empty board when dimension changes
  useEffect(() => {
    const gridSize = dimensionToGridSize[dimension];
    const newBoard = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));
    setInputBoard(newBoard);
    setSolvedBoard([]);
    setError(null);
  }, [dimension, dimensionToGridSize]);

  // Handle cell selection
  const handleCellClick = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (num: number) => {
    if (!selectedCell) return;

    const [row, col] = selectedCell;
    const newBoard = [...inputBoard];

    // Toggle number: if same number already exists, set to null, otherwise set to clicked number
    if (newBoard[row][col] === num) {
      newBoard[row][col] = null;
    } else {
      newBoard[row][col] = num;
    }

    setInputBoard(newBoard);
  };

  // Clear the board
  const clearBoard = () => {
    const gridSize = dimensionToGridSize[dimension];
    const newBoard = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));
    setInputBoard(newBoard);
    setSolvedBoard([]);
    setError(null);
  };

  // Solve the sudoku
  const handleSolve = async () => {
    setLoading(true);
    setError(null);

    try {
      await solveSudokuWithRetry();
    } catch (err) {
      console.error("Error solving sudoku:", err);
      setError("Error solving the sudoku. Please try a different puzzle.");
    } finally {
      setLoading(false);
    }
  };

  // Check if the sudoku contains zeros (incomplete solution)
  const containsZeros = (board: (number | null)[][]) => {
    return board.some((row) => row.some((cell) => cell === 0 || cell === null));
  };

  // Solve with retry mechanism
  const solveSudokuWithRetry = async (retryCount = 0, maxRetries = 2) => {
    // Prepare the request
    const request = {
      dimension: dimension,
      sudoku: inputBoard,
      disabledFields: inputBoard
        .flatMap((row, x) =>
          row.map((value, y) => (value !== null ? { x, y } : null))
        )
        .filter((field): field is { x: number; y: number } => field !== null),
    };

    // Send to backend
    const result = await solveSudoku(request);

    if (result && Array.isArray(result)) {
      // Convert nulls to zeros for checking
      const processedResult = result.map((row) =>
        row.map((cell: number | null) => (cell === null ? 0 : cell))
      );

      // Check if solution is complete
      if (containsZeros(processedResult)) {
        if (retryCount < maxRetries) {
          setError(
            `The solution is incomplete. Retrying... (Attempt ${
              retryCount + 1
            }/${maxRetries})`
          );
          // Wait a moment before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
          return solveSudokuWithRetry(retryCount + 1, maxRetries);
        } else {
          setError(
            "Could not find a complete solution after multiple attempts. Please check your input for validity."
          );
          setSolvedBoard(result);
        }
      } else {
        // Solution is complete
        if (retryCount > 0) {
          setError(null); // Clear the retry message
        }
        setSolvedBoard(result);
      }
    } else {
      setError("Unable to solve the sudoku puzzle. Please check your input.");
    }
  };

  // Generate number pad based on dimension
  const generateNumberPad = () => {
    const gridSize = dimensionToGridSize[dimension];
    const numbers = Array.from({ length: gridSize }, (_, i) => i + 1);

    // For large dimensions, create a more compact layout
    let columns;
    let buttonClassName;

    if (dimension <= 3) {
      columns = 3;
      buttonClassName = "transition-all";
    } else if (dimension === 4) {
      columns = 4;
      buttonClassName = "transition-all h-10 text-sm";
    } else {
      columns = 5;
      buttonClassName = "transition-all h-8 p-0 text-xs";
    }

    return (
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {numbers.map((num) => (
          <Button
            key={num}
            variant="outline"
            onClick={() => handleNumberInput(num)}
            className={cn(buttonClassName)}
          >
            {num}
          </Button>
        ))}
      </div>
    );
  };

  // Render the sudoku cell
  const renderSudokuCell = (
    board: (number | null)[][],
    row: number,
    col: number,
    isSolved = false
  ) => {
    const isSelected =
      selectedCell &&
      selectedCell[0] === row &&
      selectedCell[1] === col &&
      !isSolved;
    const isOriginal = isSolved && inputBoard[row][col] !== null;
    const cellValue = board[row][col];

    // Determine border styles for boxes
    const boxDimension = Math.sqrt(dimensionToGridSize[dimension]);
    const isBoxRightEdge =
      (col + 1) % boxDimension === 0 &&
      col < dimensionToGridSize[dimension] - 1;
    const isBoxBottomEdge =
      (row + 1) % boxDimension === 0 &&
      row < dimensionToGridSize[dimension] - 1;

    const borderRight = isBoxRightEdge
      ? "border-r-[3px] border-r-primary"
      : "border-r border-r-primary/30";
    const borderBottom = isBoxBottomEdge
      ? "border-b-[3px] border-b-primary"
      : "border-b border-b-primary/30";

    // Size classes based on dimension
    const getFontSizeClass = () => {
      if (dimension <= 3) return "text-base md:text-lg";
      if (dimension === 4) return "text-xs md:text-sm";
      return "text-[10px] md:text-xs";
    };

    return (
      <div
        key={`${row}-${col}`}
        className={cn(
          "aspect-square flex items-center justify-center relative cursor-pointer transition-colors",
          borderRight,
          borderBottom,
          isSelected
            ? "bg-blue-200 dark:bg-blue-600/60"
            : isOriginal
            ? "bg-blue-50 dark:bg-secondary/30"
            : "bg-background"
        )}
        onClick={() => !isSolved && handleCellClick(row, col)}
      >
        {cellValue !== null && (
          <span
            className={cn(
              isSelected
                ? "text-blue-900 dark:text-white"
                : isSolved && isOriginal
                ? "text-blue-700 font-bold dark:text-white"
                : isSolved
                ? "text-green-600 dark:text-green-400"
                : "text-slate-600 dark:text-gray-200",
              getFontSizeClass()
            )}
          >
            {cellValue}
          </span>
        )}
      </div>
    );
  };

  // Render the skeleton when loading
  const renderSkeleton = () => {
    const gridSize = dimensionToGridSize[dimension];

    return (
      <div className="aspect-square w-full max-w-md mx-auto animate-pulse">
        <div
          className="grid gap-[1px] border-2 border-primary/30 shadow-lg"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: gridSize }).map((_, rowIndex) =>
            Array.from({ length: gridSize }).map((_, colIndex) => {
              // Border styling for boxes
              const boxDimension = Math.sqrt(gridSize);
              const borderRight =
                (colIndex + 1) % boxDimension === 0 && colIndex < gridSize - 1
                  ? "border-r-[3px] border-r-primary/30"
                  : "border-r border-r-primary/20";
              const borderBottom =
                (rowIndex + 1) % boxDimension === 0 && rowIndex < gridSize - 1
                  ? "border-b-[3px] border-b-primary/30"
                  : "border-b border-b-primary/20";

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`aspect-square flex items-center justify-center relative cursor-pointer transition-colors bg-muted/20 ${borderRight} ${borderBottom}`}
                >
                  {Math.random() > 0.7 && (
                    <Skeleton
                      className={dimension <= 3 ? "h-6 w-6" : "h-4 w-4"}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Sudoku Solver</h1>
        <p className="text-muted-foreground mb-4">
          Enter your Sudoku puzzle and our solver will find the solution
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="input" className="mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="input">Input Puzzle</TabsTrigger>
                  <TabsTrigger
                    value="solution"
                    disabled={solvedBoard.length === 0}
                  >
                    Solution
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="input" className="mt-4">
                  {loading ? (
                    renderSkeleton()
                  ) : (
                    <div className="aspect-square w-full max-w-md mx-auto">
                      <div
                        className="grid border-2 border-primary shadow-lg overflow-hidden"
                        style={{
                          gridTemplateColumns: `repeat(${dimensionToGridSize[dimension]}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${dimensionToGridSize[dimension]}, minmax(0, 1fr))`,
                        }}
                      >
                        {inputBoard.map((row, rowIndex) =>
                          row.map((_, colIndex) =>
                            renderSudokuCell(inputBoard, rowIndex, colIndex)
                          )
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="solution" className="mt-4">
                  {solvedBoard.length > 0 && (
                    <div className="aspect-square w-full max-w-md mx-auto">
                      <div
                        className="grid border-2 border-primary shadow-lg overflow-hidden"
                        style={{
                          gridTemplateColumns: `repeat(${dimensionToGridSize[dimension]}, minmax(0, 1fr))`,
                          gridTemplateRows: `repeat(${dimensionToGridSize[dimension]}, minmax(0, 1fr))`,
                        }}
                      >
                        {solvedBoard.map((row, rowIndex) =>
                          row.map((_, colIndex) =>
                            renderSudokuCell(
                              solvedBoard,
                              rowIndex,
                              colIndex,
                              true
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {error && (
                <div className="p-3 mt-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Input Numbers</h3>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearBoard}
                  title="Clear Board"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sr-only">Clear</span>
                </Button>
              </div>

              {/* Dynamic number pad based on dimension */}
              {generateNumberPad()}

              <Button
                className="w-full mt-4"
                onClick={handleSolve}
                disabled={
                  loading ||
                  inputBoard.flat().filter((cell) => cell !== null).length === 0
                }
              >
                {loading ? "Solving..." : "Solve Puzzle"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Puzzle Size</h3>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <Button
                  variant={dimension === 2 ? "default" : "outline"}
                  onClick={() => setDimension(2)}
                  className="transition-colors"
                >
                  4×4
                </Button>
                <Button
                  variant={dimension === 3 ? "default" : "outline"}
                  onClick={() => setDimension(3)}
                  className="transition-colors"
                >
                  9×9
                </Button>
                <Button
                  variant={dimension === 4 ? "default" : "outline"}
                  onClick={() => setDimension(4)}
                  className="transition-colors"
                >
                  16×16
                </Button>
                <Button
                  variant={dimension === 5 ? "default" : "outline"}
                  onClick={() => setDimension(5)}
                  className="transition-colors"
                >
                  25×25
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted/40 rounded-md">
                <p>
                  Click on a cell to select it, then use the number pad to enter
                  values. Click the same number again to remove it.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

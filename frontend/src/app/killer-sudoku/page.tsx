"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eraser, RotateCcw, Zap, Plus, Trash, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { solveKillerSudoku } from "@/actions/sudokuActions";
import { Sudoku } from "@/types/sudoku";

// Types for our Killer Sudoku
type Cell = [number, number]; // [row, col]
type Cage = {
  id: number;
  sum: number;
  cells: Cell[];
};

export default function KillerSudoku() {
  // State for the Sudoku board
  const [board, setBoard] = useState<number[][]>(
    Array(9)
      .fill(0)
      .map(() => Array(9).fill(0))
  );

  // State for cages
  const [cages, setCages] = useState<Cage[]>([]);
  const [nextCageId, setNextCageId] = useState(1);

  // State for cage creation
  const [isCreatingCage, setIsCreatingCage] = useState(false);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [cageSum, setCageSum] = useState<number | "">("");

  // State for editing
  const [editingCage, setEditingCage] = useState<Cage | null>(null);

  // State for solving
  const [isSolving, setIsSolving] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // Generate a color for each cage
  const cageColors = [
    "bg-red-100 dark:bg-red-900/20",
    "bg-blue-100 dark:bg-blue-900/20",
    "bg-green-100 dark:bg-green-900/20",
    "bg-yellow-100 dark:bg-yellow-900/20",
    "bg-purple-100 dark:bg-purple-900/20",
    "bg-pink-100 dark:bg-pink-900/20",
    "bg-indigo-100 dark:bg-indigo-900/20",
    "bg-orange-100 dark:bg-orange-900/20",
    "bg-teal-100 dark:bg-teal-900/20",
    "bg-cyan-100 dark:bg-cyan-900/20",
  ];

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (!isCreatingCage) return;

    const cell: Cell = [row, col];
    const cellIndex = selectedCells.findIndex(
      ([r, c]) => r === row && c === col
    );

    // Check if cell is already in another cage
    const isInOtherCage = cages.some((cage) =>
      cage.cells.some(([r, c]) => r === row && c === col)
    );

    if (isInOtherCage) {
      toast({
        title: "Cell already in a cage",
        description: "This cell is already part of another cage.",
        variant: "destructive",
      });
      return;
    }

    // Toggle cell selection
    if (cellIndex === -1) {
      // Add cell if not already selected

      // Check if cell is adjacent to any selected cell
      const isAdjacent =
        selectedCells.length === 0 ||
        selectedCells.some(
          ([r, c]) =>
            (Math.abs(r - row) === 1 && c === col) ||
            (r === row && Math.abs(c - col) === 1)
        );

      if (!isAdjacent && selectedCells.length > 0) {
        toast({
          title: "Non-adjacent cell",
          description: "Selected cells must be adjacent to form a cage.",
          variant: "destructive",
        });
        return;
      }

      setSelectedCells([...selectedCells, cell]);
    } else {
      // Remove cell if already selected
      const newSelectedCells = [...selectedCells];
      newSelectedCells.splice(cellIndex, 1);

      // Check if removing this cell would break the cage into disconnected parts
      if (newSelectedCells.length > 1) {
        // Simple check: if we remove a cell, all remaining cells should still be connected
        // This is a simplified check and might not catch all cases
        const isConnected = (cells: Cell[]) => {
          if (cells.length <= 1) return true;

          const visited = new Set<string>();
          const queue: Cell[] = [cells[0]];

          while (queue.length > 0) {
            const [r, c] = queue.shift()!;
            const key = `${r},${c}`;

            if (visited.has(key)) continue;
            visited.add(key);

            // Add adjacent cells to queue
            cells.forEach(([nr, nc]) => {
              if (
                !visited.has(`${nr},${nc}`) &&
                ((Math.abs(nr - r) === 1 && nc === c) ||
                  (nr === r && Math.abs(nc - c) === 1))
              ) {
                queue.push([nr, nc]);
              }
            });
          }

          return visited.size === cells.length;
        };

        if (!isConnected(newSelectedCells)) {
          toast({
            title: "Disconnected cage",
            description: "Removing this cell would create a disconnected cage.",
            variant: "destructive",
          });
          return;
        }
      }

      setSelectedCells(newSelectedCells);
    }
  };

  // Create a new cage
  const createCage = () => {
    if (selectedCells.length === 0) {
      toast({
        title: "No cells selected",
        description: "Please select at least one cell for the cage.",
        variant: "destructive",
      });
      return;
    }

    if (cageSum === "" || cageSum <= 0) {
      toast({
        title: "Invalid sum",
        description: "Please enter a positive number for the cage sum.",
        variant: "destructive",
      });
      return;
    }

    const newCage: Cage = {
      id: nextCageId,
      sum: Number(cageSum),
      cells: [...selectedCells],
    };

    setCages([...cages, newCage]);
    setNextCageId(nextCageId + 1);

    // Reset cage creation state
    setSelectedCells([]);
    setCageSum("");
    setIsCreatingCage(false);
  };

  // Update an existing cage
  const updateCage = () => {
    if (!editingCage) return;

    if (cageSum === "" || cageSum <= 0) {
      toast({
        title: "Invalid sum",
        description: "Please enter a positive number for the cage sum.",
        variant: "destructive",
      });
      return;
    }

    const updatedCages = cages.map((cage) =>
      cage.id === editingCage.id ? { ...cage, sum: Number(cageSum) } : cage
    );

    setCages(updatedCages);
    setEditingCage(null);
    setCageSum("");
  };

  // Delete a cage
  const deleteCage = (cageId: number) => {
    setCages(cages.filter((cage) => cage.id !== cageId));
  };

  // Get the cage for a cell
  const getCageForCell = (row: number, col: number) => {
    return cages.find((cage) =>
      cage.cells.some(([r, c]) => r === row && c === col)
    );
  };

  // Get the color for a cage
  const getCageColor = (cageId: number) => {
    return cageColors[(cageId - 1) % cageColors.length];
  };

  // Check if a cell is the top-left cell of its cage (to display the sum)
  const isTopLeftOfCage = (row: number, col: number) => {
    const cage = getCageForCell(row, col);
    if (!cage) return false;

    const [topRow, leftCol] = cage.cells.reduce(
      ([minRow, minCol], [r, c]) => {
        return [Math.min(minRow, r), Math.min(minCol, c)];
      },
      [9, 9]
    );

    return row === topRow && col === leftCol;
  };

  // Reset the board and cages
  const resetBoard = () => {
    setBoard(
      Array(9)
        .fill(0)
        .map(() => Array(9).fill(0))
    );
    setCages([]);
    setNextCageId(1);
    setSelectedCells([]);
    setCageSum("");
    setIsCreatingCage(false);
    setEditingCage(null);
    setIsSolved(false);
  };

  // Solve the Killer Sudoku
  const solvePuzzle = async () => {
    if (cages.length === 0) {
      toast({
        title: "No cages defined",
        description: "Please create at least one cage before solving.",
        variant: "destructive",
      });
      return;
    }

    setIsSolving(true);

    try {
      // Convert our UI cages format to the Sudoku type expected by the API
      const sudokuCages = cages.map((cage) => ({
        cells: cage.cells,
        sum: cage.sum,
      }));

      // Create the sudoku object
      const sudokuToSolve: Sudoku = {
        dimension: 3, // 9x9 Sudoku
        sudoku: board.map((row) =>
          row.map((cell) => (cell === 0 ? null : cell))
        ),
        disabledFields: [], // Not needed for solving
        cages: sudokuCages,
        isKiller: true,
      };

      // Call the solver API
      const solution = await solveKillerSudoku(sudokuToSolve);

      // Update the board with the solution
      setBoard(solution);
      setIsSolved(true);

      toast({
        title: "Puzzle solved!",
        description: "The Killer Sudoku has been solved successfully.",
      });
    } catch (error) {
      console.error("Failed to solve puzzle:", error);
      toast({
        title: "Solving failed",
        description:
          "There was an error solving the puzzle. It might not have a valid solution.",
        variant: "destructive",
      });
    } finally {
      setIsSolving(false);
    }
  };

  // Cancel cage creation
  const cancelCageCreation = () => {
    setIsCreatingCage(false);
    setSelectedCells([]);
    setCageSum("");
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Toaster />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Killer Sudoku Solver</h1>
        <p className="text-muted-foreground">
          Create a Killer Sudoku puzzle and let the system solve it
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* Killer Sudoku grid */}
              <div className="aspect-square w-full max-w-md mx-auto">
                <div className="grid grid-cols-9 border-2 border-primary shadow-lg overflow-hidden">
                  {Array(9)
                    .fill(0)
                    .map((_, rowIndex) =>
                      Array(9)
                        .fill(0)
                        .map((_, colIndex) => {
                          // Border styling for 3x3 boxes - using inset borders to avoid gaps
                          const borderRight =
                            (colIndex + 1) % 3 === 0 && colIndex < 8
                              ? "border-r-[3px] border-r-primary"
                              : "border-r border-r-primary/30";
                          const borderBottom =
                            (rowIndex + 1) % 3 === 0 && rowIndex < 8
                              ? "border-b-[3px] border-b-primary"
                              : "border-b border-b-primary/30";

                          // Get cage information
                          const cage = getCageForCell(rowIndex, colIndex);
                          const cageColor = cage ? getCageColor(cage.id) : "";
                          const showCageSum = isTopLeftOfCage(
                            rowIndex,
                            colIndex
                          );

                          // Check if cell is selected for new cage
                          const isSelected = selectedCells.some(
                            ([r, c]) => r === rowIndex && c === colIndex
                          );

                          return (
                            <div
                              key={`${rowIndex}-${colIndex}`}
                              className={cn(
                                "aspect-square flex items-center justify-center relative cursor-pointer transition-colors",
                                borderRight,
                                borderBottom,
                                cageColor,
                                isSelected &&
                                  "bg-primary/30 ring-2 ring-primary ring-inset",
                                isCreatingCage && "hover:bg-primary/10"
                              )}
                              onClick={() =>
                                handleCellClick(rowIndex, colIndex)
                              }
                            >
                              {showCageSum && cage && (
                                <div className="absolute top-0 left-0 text-[10px] font-bold p-[2px] bg-primary/10 rounded-br-md px-1 shadow-sm">
                                  {cage.sum}
                                </div>
                              )}

                              {board[rowIndex][colIndex] !== 0 && (
                                <span className="text-lg md:text-xl font-medium">
                                  {board[rowIndex][colIndex]}
                                </span>
                              )}

                              {/* Cage border indicators - highlight the boundaries between cages */}
                              {cage &&
                                [
                                  [-1, 0],
                                  [1, 0],
                                  [0, -1],
                                  [0, 1],
                                ].map(([dr, dc], idx) => {
                                  const neighborRow = rowIndex + dr;
                                  const neighborCol = colIndex + dc;

                                  // Skip if outside the grid
                                  if (
                                    neighborRow < 0 ||
                                    neighborRow >= 9 ||
                                    neighborCol < 0 ||
                                    neighborCol >= 9
                                  ) {
                                    return null;
                                  }

                                  // Get neighbor's cage
                                  const neighborCage = getCageForCell(
                                    neighborRow,
                                    neighborCol
                                  );

                                  // If neighbor is in a different cage (or has no cage), show a border
                                  if (
                                    !neighborCage ||
                                    neighborCage.id !== cage.id
                                  ) {
                                    let borderClass = "";
                                    if (dr === -1)
                                      borderClass =
                                        "border-t-2 border-dashed border-t-primary/70"; // Top
                                    if (dr === 1)
                                      borderClass =
                                        "border-b-2 border-dashed border-b-primary/70"; // Bottom
                                    if (dc === -1)
                                      borderClass =
                                        "border-l-2 border-dashed border-l-primary/70"; // Left
                                    if (dc === 1)
                                      borderClass =
                                        "border-r-2 border-dashed border-r-primary/70"; // Right

                                    const positionClass = {
                                      "0": "absolute top-0 left-0 right-0", // Top
                                      "1": "absolute bottom-0 left-0 right-0", // Bottom
                                      "2": "absolute top-0 bottom-0 left-0", // Left
                                      "3": "absolute top-0 bottom-0 right-0", // Right
                                    }[idx];

                                    return (
                                      <div
                                        key={`border-${idx}`}
                                        className={cn(
                                          positionClass,
                                          borderClass,
                                          "pointer-events-none z-10"
                                        )}
                                        style={{
                                          height: idx < 2 ? "2px" : "auto",
                                          width: idx >= 2 ? "2px" : "auto",
                                        }}
                                      />
                                    );
                                  }
                                  return null;
                                })}
                            </div>
                          );
                        })
                    )}
                </div>
              </div>

              {/* Cage creation controls */}
              {isCreatingCage && (
                <div className="mt-4 p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Creating Cage</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on adjacent cells to create a cage. Selected cells:{" "}
                    {selectedCells.length}
                  </p>

                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor="cage-sum">Cage Sum</Label>
                      <Input
                        id="cage-sum"
                        type="number"
                        min="1"
                        max="45"
                        value={cageSum}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setCageSum(
                            e.target.value === ""
                              ? ""
                              : Number.parseInt(e.target.value)
                          )
                        }
                        placeholder="Enter sum"
                      />
                    </div>
                    <Button
                      onClick={createCage}
                      disabled={selectedCells.length === 0 || cageSum === ""}
                    >
                      Create Cage
                    </Button>
                    <Button variant="outline" onClick={cancelCageCreation}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Puzzle Controls</h3>

              <div className="space-y-2">
                {!isCreatingCage ? (
                  <Button
                    className="w-full flex items-center gap-2"
                    onClick={() => setIsCreatingCage(true)}
                    disabled={isSolved}
                  >
                    <Plus className="h-4 w-4" />
                    Create Cage
                  </Button>
                ) : (
                  <Button
                    className="w-full flex items-center gap-2"
                    variant="outline"
                    onClick={cancelCageCreation}
                  >
                    <Eraser className="h-4 w-4" />
                    Cancel Cage Creation
                  </Button>
                )}

                <Button
                  className="w-full flex items-center gap-2"
                  onClick={resetBoard}
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Puzzle
                </Button>

                <Button
                  className="w-full flex items-center gap-2"
                  onClick={solvePuzzle}
                  disabled={isCreatingCage || isSolving || cages.length === 0}
                >
                  <Zap className="h-4 w-4" />
                  {isSolving ? "Solving..." : "Solve Puzzle"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Tabs defaultValue="cages">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cages">Cages</TabsTrigger>
                  <TabsTrigger value="help">Help</TabsTrigger>
                </TabsList>

                <TabsContent value="cages" className="space-y-4 pt-4">
                  {cages.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      No cages created yet.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                      {cages.map((cage) => (
                        <div
                          key={cage.id}
                          className={cn(
                            "p-3 rounded-md flex items-center justify-between",
                            getCageColor(cage.id),
                            "shadow-sm border border-primary/20"
                          )}
                        >
                          <div>
                            <span className="font-medium">Cage {cage.id}</span>
                            <div className="text-sm">
                              Sum: <span className="font-bold">{cage.sum}</span>{" "}
                              | Cells: {cage.cells.length}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Positions:{" "}
                              {cage.cells
                                .map(([r, c]) => `(${r + 1},${c + 1})`)
                                .join(", ")}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingCage(cage);
                                    setCageSum(cage.sum);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Cage {cage.id}</DialogTitle>
                                  <DialogDescription>
                                    Update the sum for this cage.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                  <Label htmlFor="edit-cage-sum">
                                    Cage Sum
                                  </Label>
                                  <Input
                                    id="edit-cage-sum"
                                    type="number"
                                    min="1"
                                    max="45"
                                    value={cageSum}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                      setCageSum(
                                        e.target.value === ""
                                          ? ""
                                          : Number.parseInt(e.target.value)
                                      )
                                    }
                                  />
                                </div>
                                <DialogFooter>
                                  <Button onClick={updateCage}>
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteCage(cage.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="help" className="space-y-4 pt-4">
                  <div className="text-sm space-y-2">
                    <h4 className="font-medium">
                      How to Create a Killer Sudoku:
                    </h4>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>
                        Click &quot;Create Cage&quot; to start defining a cage
                      </li>
                      <li>
                        Click on adjacent cells to select them for the cage
                      </li>
                      <li>Enter the sum for the selected cells</li>
                      <li>Click &quot;Create Cage&quot; to finalize</li>
                      <li>Repeat for all cages in your puzzle</li>
                      <li>
                        Click &quot;Solve Puzzle&quot; to find the solution
                      </li>
                    </ol>

                    <h4 className="font-medium mt-4">
                      Rules of Killer Sudoku:
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        Standard Sudoku rules apply (1-9 in each row, column,
                        and 3x3 box)
                      </li>
                      <li>Cells are grouped into cages with a specified sum</li>
                      <li>Numbers cannot repeat within a cage</li>
                      <li>
                        The sum of all numbers in a cage must equal the
                        cage&apos;s sum
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

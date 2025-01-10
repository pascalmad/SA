import { Sudoku } from "@/types/sudoku";

export async function solveSudoku(sudoku: Sudoku) {
  const response = await fetch("http://localhost:8080/solve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dimension: sudoku.dimension,
      sudoku: sudoku.sudoku,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to solve sudoku");
  }

  return response.json();
}

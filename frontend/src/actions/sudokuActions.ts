import { Sudoku } from "@/types/sudoku";

export async function solveSudoku(sudoku: Sudoku) {
  const response = await fetch("http://localhost:8080/solveamk", {
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

export async function generateSudoku(dimension: number) {
  const response = await fetch(`http://localhost:8080/create/${dimension}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to generate sudoku");
  }

  return response.json();
}

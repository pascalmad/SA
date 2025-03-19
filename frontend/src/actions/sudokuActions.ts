import { Sudoku } from "@/types/sudoku";

export async function solveSudoku(sudoku: Sudoku) {
  const response = await fetch("http://localhost:8080/sudoku/solve", {
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

export async function generateSudoku(
  dimension: number,
  difficulty: string = "normal"
) {
  const response = await fetch(
    `http://localhost:8080/sudoku/${dimension}?difficulty=${difficulty}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate sudoku");
  }
  const data = await response.json();
  return {
    unsolvedSudoku: data["unsolved_sudoku"],
    solvedSudoku: data["complete_sudoku"],
  };
}

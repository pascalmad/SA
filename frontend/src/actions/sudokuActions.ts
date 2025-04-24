"use server";

import { Sudoku } from "@/types/sudoku";

// Use service name instead of localhost
const API_BASE_URL = process.env.SUDOKU_API_URL || "http://sudoku-service:8080";

export async function solveSudoku(sudoku: Sudoku) {
  // For dimensions 4 and 5, we need to validate here because the backend might not support them yet
  if (sudoku.dimension > 3) {
    // Check if there's any input to solve
    const hasInput = sudoku.sudoku.some((row) =>
      row.some((cell) => cell !== null)
    );
    if (!hasInput) {
      throw new Error("Please enter some numbers to solve");
    }
  }

  const response = await fetch(`${API_BASE_URL}/sudoku/solve`, {
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
    `${API_BASE_URL}/sudoku/${dimension}?difficulty=${difficulty}`,
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

export async function generateKillerSudoku(
  dimension: number,
  difficulty: string = "normal"
) {
  const response = await fetch(
    `${API_BASE_URL}/killer-sudoku/${dimension}?difficulty=${difficulty}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to generate killer sudoku");
  }
  const data = await response.json();
  return {
    unsolvedSudoku: data["unsolved_sudoku"],
    solvedSudoku: data["complete_sudoku"],
    cages: data["cages"],
  };
}

export async function solveKillerSudoku(sudoku: Sudoku) {
  // Create a 2D array for cages where each cell contains its cage index
  const dimension = sudoku.dimension;
  const cagesArray = Array(dimension ** 2)
    .fill(0)
    .map(() => Array(dimension ** 2).fill(-99));
  const cageSums: number[] = [];

  // Fill the cages array with cage indices
  sudoku.cages?.forEach((cage, index) => {
    cage.cells.forEach(([row, col]) => {
      cagesArray[row][col] = index;
    });
    cageSums[index] = cage.sum;
  });

  const response = await fetch(`${API_BASE_URL}/killer-sudoku/solve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dimension: sudoku.dimension,
      sudoku: sudoku.sudoku,
      cages: cagesArray,
      cageSums: cageSums,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to solve killer sudoku");
  }

  return response.json();
}

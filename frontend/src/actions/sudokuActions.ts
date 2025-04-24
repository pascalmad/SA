"use server";

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

export async function generateKillerSudoku(
  dimension: number,
  difficulty: string = "normal"
) {
  const response = await fetch(
    `http://localhost:8080/killer-sudoku/${dimension}?difficulty=${difficulty}`,
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

  console.log(cagesArray);
  console.log(cageSums);

  const response = await fetch("http://localhost:8080/killer-sudoku/solve", {
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

export type Sudoku = {
  dimension: 2 | 3;
  sudoku: (number | null)[][];
  disabledFields: { x: number; y: number }[];
  difficulty?: "easy" | "normal" | "hard";
};

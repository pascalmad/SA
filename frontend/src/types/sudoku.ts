export type SudokuCage = {
  cells: [number, number][];
  sum: number;
};

export type Sudoku = {
  dimension: 2 | 3;
  sudoku: (number | null)[][];
  disabledFields: { x: number; y: number }[];
  difficulty?: "easy" | "normal" | "hard";
  cages?: SudokuCage[];
  isKiller?: boolean;
};

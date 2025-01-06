import SudokuForm from "@/components/sudoku-form";

export default function SudokuSolvePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Solve a Sudoku</h1>
      <SudokuForm />
    </div>
  );
}

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from aminisikim import amk_create
from sudoku import SudokuGenerator, SudokuSolver
from create import create_sudoku
from solve import solve_sudoku


app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UnsolvedSudoku(BaseModel):
    dimension: int
    sudoku: list[list[int | None]]

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/sudoku/{dimension}")
def get_sudoku(dimension: int, difficulty: str = "normal"):
    """
    Erzeugt ein Sudoku-Rätsel mit der angegebenen Dimension und Schwierigkeitsgrad.
    
    Parameter:
    - dimension: Die Dimension des Sudokus (2 für 4x4, 3 für 9x9)
    - difficulty: Der Schwierigkeitsgrad des Sudokus ('easy', 'normal', 'hard')
    
    Rückgabe:
    - Das unvollständige Sudoku-Rätsel und die vollständige Lösung
    """
    # Überprüfung des Schwierigkeitsgrads
    if difficulty not in ["easy", "normal", "hard"]:
        difficulty = "normal"
        
    sudoku_generator = SudokuGenerator(dimension)
    unsolved_sudoku, complete_sudoku = sudoku_generator.get_incomplete_and_complete_sudoku(difficulty)
    return JSONResponse(content={"unsolved_sudoku": unsolved_sudoku, "complete_sudoku": complete_sudoku})

@app.post("/sudoku/solve")
def post_sudoku_solution(sudoku: UnsolvedSudoku):
    sudoku_solver = SudokuSolver(sudoku.dimension, sudoku.sudoku)
    solution = sudoku_solver.solve_sudoku()
    return JSONResponse(content=solution)
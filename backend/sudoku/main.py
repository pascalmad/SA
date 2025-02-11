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
def get_sudoku(dimension: int):
    sudoku_generator = SudokuGenerator(dimension)
    unsolved_sudoku, complete_sudoku = sudoku_generator.get_incomplete_and_complete_sudoku()
    return JSONResponse(content={"unsolved_sudoku": unsolved_sudoku, "complete_sudoku": complete_sudoku})

@app.post("/sudoku/solve")
def post_sudoku_solution(sudoku: UnsolvedSudoku):
    sudoku_solver = SudokuSolver(sudoku.dimension, sudoku.sudoku)
    solution = sudoku_solver.solve()
    return JSONResponse(content=solution)
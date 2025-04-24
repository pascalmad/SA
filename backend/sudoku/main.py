from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np

from aminisikim import amk_create
from sudoku import KillerSudokuGenerator, KillerSudokuSolver, SudokuGenerator, SudokuSolver
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

class UnsolvedKillerSudoku(BaseModel):
    dimension: int
    sudoku: list[list[int | None]]
    cages: list[list[int]]  # 2D array with cage indices for each cell
    cageSums: list[int]     # List with the sum for each cage

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
    print(solution)
    return JSONResponse(content=solution)

@app.get("/killer-sudoku/{dimension}")
def get_killer_sudoku(dimension: int, difficulty: str = "normal"):
    """
    Erzeugt ein Killer-Sudoku-Rätsel mit der angegebenen Dimension und Schwierigkeitsgrad.
    
    Parameter:
    - dimension: Die Dimension des Sudokus (2 für 4x4, 3 für 9x9)
    - difficulty: Der Schwierigkeitsgrad des Sudokus ('easy', 'normal', 'hard')
    
    Rückgabe:
    - Das Killer-Sudoku-Rätsel mit Käfigen und Summen
    """
    # Überprüfung des Schwierigkeitsgrads
    if difficulty not in ["easy", "normal", "hard"]:
        difficulty = "normal"
        
    killer_sudoku_generator = KillerSudokuGenerator(dimension)
    unsolved_sudoku, complete_sudoku, cages = killer_sudoku_generator.get_killer_sudoku(difficulty)
    
    # Käfige für die JSON-Serialisierung vorbereiten
    serializable_cages = []
    for cage_cells, cage_sum in cages:
        serializable_cages.append({
            "cells": cage_cells,
            "sum": cage_sum
        })
    
    return JSONResponse(content={
        "unsolved_sudoku": unsolved_sudoku, 
        "complete_sudoku": complete_sudoku,
        "cages": serializable_cages
    })

@app.post("/killer-sudoku/solve")
def post_killer_sudoku_solution(sudoku: UnsolvedKillerSudoku):
    """
    Löst ein Killer-Sudoku mit den angegebenen Käfigen und Summen.
    
    Parameter:
    - dimension: Die Dimension des Sudokus (2 für 4x4, 3 für 9x9)
    - sudoku: Das teilweise gefüllte Sudoku
    - cages: 2D-Array mit Käfig-Indizes für jede Zelle
    - cageSums: Liste mit den Summen für jeden Käfig
    
    Rückgabe:
    - Die Lösung des Killer-Sudokus
    """
    killer_sudoku_solver = KillerSudokuSolver(
        sudoku.dimension, 
        sudoku.sudoku, 
        np.array(sudoku.cages), 
        sudoku.cageSums
    )
    solution = killer_sudoku_solver.solve_sudoku()
    return JSONResponse(content=solution)

if __name__ == "__main__":
    # Starte Uvicorn auf Port 8081
    uvicorn.run(app, host="0.0.0.0", port=8080)
    
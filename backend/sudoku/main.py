from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

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

@app.post("/solve")
def get_sudoku_solution(sudoku: UnsolvedSudoku):
    solution = solve_sudoku(sudoku.dimension, sudoku.sudoku)
    return JSONResponse(content=solution)
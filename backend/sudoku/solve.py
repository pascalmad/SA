import numpy as np
import pyoptinterface as poi
from pyoptinterface import highs
from common import get_model, get_solution_from_model


def solve_sudoku(dimension: int, sudoku: list[list[int | None]]):
    model, x = get_model(dimension)
    s = dimension
    for i in range(s**2):
        for j in range(s**2):
            if sudoku[i][j] is not None:
                model.add_linear_constraint(x[i, j, sudoku[i][j]-1], poi.Eq, 1.0)
                
    model.optimize()
    print("Termination status:", model.get_model_attribute(poi.ModelAttribute.TerminationStatus))
    
    return get_solution_from_model(model, x, s)
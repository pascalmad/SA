import numpy as np
import pyoptinterface as poi
from pyoptinterface import highs

model = highs.Model()
def solve_sudoku(dimension: int, sudoku: list[list[int | None]]):
    s = dimension
    x = np.empty((s**2, s**2, s**2), dtype=object)
    
    for i in range(s**2):
        for j in range(s**2):
            for k in range(s**2):
                x[i, j, k] = model.add_variable(domain=poi.VariableDomain.Binary)
                
    for i in range(s**2):
        for k in range(s**2):
            model.add_linear_constraint(poi.quicksum(x[i, :, k]), poi.Eq, 1.0)
            model.add_linear_constraint(poi.quicksum(x[:, i, k]), poi.Eq, 1.0)
    for i in range(s**2):
        for j in range(s**2):
            model.add_linear_constraint(poi.quicksum(x[i, j, :]), poi.Eq, 1.0)
    for g in range(s):
        for h in range(s):
            for k in range(s**2):
                a = x[g*s:g*s+s, h*s:h*s+s, k]
                model.add_linear_constraint(poi.quicksum(a.flatten()), poi.Eq, 1.0)
    
    for i in range(s**2):
        for j in range(s**2):
            if sudoku[i][j] is not None:
                model.add_linear_constraint(x[i, j, sudoku[i][j]-1], poi.Eq, 1.0)
                
    model.optimize()
    print("Termination status:", model.get_model_attribute(poi.ModelAttribute.TerminationStatus))
    
    get_v = np.vectorize(lambda x: model.get_value(x))
    solution = get_v(x)
    
    solved_sudoku = [[0 for _ in range(s**2)] for _ in range(s**2)]
    #for i in range(s**2):
    #    for j in range(s**2):
    #        for k in range(s**2):
    #            if solution[i, j, k].astype(int) == 1:
    #                print(f"{k+1}", end=" ")
    #    print("\n")
    
    for i in range(s**2):
        for j in range(s**2):
            for k in range(s**2):
                if solution[i, j, k] == 1:
                    solved_sudoku[i][j] = k+1

    return solved_sudoku
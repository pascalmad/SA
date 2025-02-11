import numpy as np
import pyoptinterface as poi
from pyoptinterface import highs

def get_model(s: int):
    model = highs.Model()
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
    return model, x

def get_solution_from_model(model, xnew, s):
    get_v = np.vectorize(lambda x: model.get_value(x))
    solution = get_v(xnew)
    
    sudoku = [[0 for _ in range(s**2)] for _ in range(s**2)]
    
    for i in range(s**2):
        for j in range(s**2):
            for k in range(s**2):
                if solution[i, j, k] == 1:
                    sudoku[i][j] = k+1

    return sudoku
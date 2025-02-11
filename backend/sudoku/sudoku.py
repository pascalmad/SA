import numpy as np
import pyoptinterface as poi
import random as rnd
from pyoptinterface import highs

class Sudoku:
    def __init__(self, s: int):
        self.dimension = s
        
        model, x = self.create_model()
        self.model = model
        self.x = x
        
    def create_model(self):
        s = self.dimension
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
                    model.add_linear_constraint(poi.quicksum(x[g*s:g*s+s, h*s:h*s+s, k].flatten()), poi.Eq, 1.0)
                    
        return model, x
        
    def solve(self):
        self.model.optimize()
        print("Termination status:", self.model.get_model_attribute(poi.ModelAttribute.TerminationStatus))
        
    def get_solution(self):
        get_v = np.vectorize(lambda x: self.model.get_value(x))
        solution = get_v(self.x)
        s = self.dimension
        
        sudoku = [[0 for _ in range(s**2)] for _ in range(s**2)]
        for i in range(s**2):
            for j in range(s**2):
                for k in range(s**2):
                    if solution[i, j, k] == 1:
                        sudoku[i][j] = k+1

        return sudoku
    
        
class SudokuSolver(Sudoku):
    def __init__(self, s: int, sudoku: list):
        super().__init__(s)
        self.con = np.empty((s**2, s**2), dtype=object)
        for i in range(s**2):
            for j in range(s**2):
                if sudoku[i][j] is not None:
                    self.con[i][j] = self.model.add_linear_constraint(self.x[i, j, sudoku[i][j]-1], poi.Eq, 1.0)
                    
    def solve_sudoku(self):
        self.solve()
        return self.get_solution()
                    
                    
class SudokuGenerator(SudokuSolver):
    def __init__(self, s: int):
        complete_sudoku = Sudoku(s)
        
        objective = 0
        for i in range(s**2):
            for j in range(s**2):
                rnd_value = rnd.randint(1,1000)  # Generate random value between 1 and 1000
                objective += poi.quicksum(complete_sudoku.x[i, j, :]) * rnd_value  # Add the product to the objective#

        complete_sudoku.model.set_objective(objective, poi.ObjectiveSense.Minimize)
        complete_sudoku.solve()
        complete_sudoku_solution = complete_sudoku.get_solution()
        
        
        self.solution = complete_sudoku_solution
        
        super().__init__(s, complete_sudoku_solution)
        solver_objective = poi.quicksum([self.x[i][j][k] for i in range(s**2)
                                                         for j in range(s**2)
                                                         for k in range(s**2)
                                                         if k+1 == complete_sudoku_solution[i][j]
                                ])

        self.model.set_objective(solver_objective, poi.ObjectiveSense.Minimize)
       
        
    def remove_cell(self):
        self.solve()
        if self.model.get_model_attribute(poi.ModelAttribute.ObjectiveValue) < self.dimension**4:
            return
        
        while True:
            row, col = rnd.randint(0, self.dimension**2-1), rnd.randint(0, self.dimension**2-1)
            if self.solution[row][col] is not None:
                break
        
        self.solution[row][col] = None
        self.model.delete_constraint(self.con[row][col])
        
        self.remove_cell()
        
    def get_incomplete_and_complete_sudoku(self):
        self.remove_cell()
        return self.solution, self.get_solution()
        
        
        
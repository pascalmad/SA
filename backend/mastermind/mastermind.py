from enum import Enum
import pyoptinterface as poi
from pyoptinterface import highs
import numpy as np
from typing import List, Dict
import random # Für den ersten Zug

NUM_PINS = 4
NUM_COLORS = 6

class Mastermind:
    def __init__(self, C, G, B):
        round = len(C)
        
        self.model = highs.Model()
        self.x = np.empty((NUM_PINS, NUM_COLORS), dtype=object)
        print(C, G, B, round)

        # Variablen: x[p, c] = 1, wenn an Position p die Farbe c ist, sonst 0
        for p in range(NUM_PINS):
            for c in range(NUM_COLORS):
                self.x[p, c] = self.model.add_variable(domain=poi.VariableDomain.Binary)

        # Constraint: Pro Position genau eine Farbe
        for p in range(NUM_PINS):
            self.model.add_linear_constraint(poi.quicksum(self.x[p, :]), poi.Eq, 1.0)

        # Constraints basierend auf bisherigen Runden (Feedback)
        if round > 0:
            for t in range(round):
                # Constraint für rote/schwarze Pins (G[t])
                red_pins_sum = poi.quicksum([
                    self.x[p, c] for p in range(NUM_PINS) 
                                 for c in range(NUM_COLORS) 
                                 if C[t, p, c] == 1
                    ])
                self.model.add_linear_constraint(red_pins_sum, poi.Eq, G[t])
                print("ok")

                # Constraint für weiße Pins (B[t])
                white_pins_sum = poi.quicksum([
                    self.x[p, c] for p in range(NUM_PINS) 
                                 for c in range(NUM_COLORS) 
                                 if C[t, p, c] != 1
                                 if any([C[t, q, c] == 1 for q in range(NUM_PINS)])             
                    ])
                self.model.add_linear_constraint(white_pins_sum, poi.Geq, B[t])


    def get_solution(self):
        try:
            get_v = np.vectorize(lambda var: self.model.get_value(var))
            solution_matrix = get_v(self.x)
        except Exception as e:
             print(f"Error getting solution values: {e}")
             return None
         
        solution = []
        for p in range(NUM_PINS):
            for c in range(NUM_COLORS):
                if solution_matrix[p, c] == 1:
                    solution.append(c)
        return solution


    def solve(self):
        try:
            self.model.optimize()
            status = self.model.get_model_attribute(poi.ModelAttribute.TerminationStatus)
            print("Termination status:", status)

            # Prüfe, ob eine optimale oder machbare Lösung gefunden wurde
            if status == poi.TerminationStatusCode.OPTIMAL:
                return self.get_solution()
            else:
                print(f"Solver terminated with status: {status}. No solution found.")
                return None # Keine gültige Lösung gefunden oder anderer Fehler
        except Exception as e:
            print(f"Exception during optimization or solution retrieval: {e}")
            return None

def generate_first_move() -> List[int]:
    return [c for c in random.sample(range(NUM_PINS), 2) for _ in range(2)]

def reconstruct_C_matrix(moves: List[Dict]) -> np.ndarray:
    return np.array([[[1 if c == color else 0 for c in range(NUM_COLORS)]for color in move.colors]for move in moves])
    
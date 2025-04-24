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
   
        for j in range(s**2):
            for k in range(s**2):
                model.add_linear_constraint(poi.quicksum(x[:, j, k]), poi.Eq, 1.0)
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
       
    def remove_cell(self, difficulty="normal", max_attempts=None):
        """
        Entfernt Zellen aus dem Sudoku basierend auf dem gewählten Schwierigkeitsgrad.
        
        Parameter:
        - difficulty: 'easy', 'normal' oder 'hard'
        - max_attempts: Maximale Anzahl von Versuchen, Zellen zu entfernen
        """
        # Prüfen, ob das Sudoku nach dem letzten Entfernen einer Zelle noch eine eindeutige Lösung hat
        self.solve()
        if self.model.get_model_attribute(poi.ModelAttribute.ObjectiveValue) < self.dimension**4:
            return
        
        # Schwierigkeitsgrade bestimmen den Prozentsatz der Zellen, die gelöscht werden sollen
        difficulty_levels = {
            "easy": 0.5,     # 50% der Zellen werden entfernt (mehr Hinweise)
            "normal": 0.65,   # 65% der Zellen werden entfernt
            "hard": 0.8      # 80% der Zellen werden entfernt (weniger Hinweise)
        }
        
        # Aktuelle Anzahl der entfernten Zellen zählen
        total_cells = self.dimension**4
        filled_cells = sum(1 for i in range(self.dimension**2) for j in range(self.dimension**2) if self.solution[i][j] is not None)
        removed_cells = total_cells - filled_cells
        
        # Maximale Anzahl von Zellen, die basierend auf dem Schwierigkeitsgrad entfernt werden sollten
        max_cells_to_remove = int(total_cells * difficulty_levels.get(difficulty, 0.5))
        
        # Wenn wir bereits das Maximum für den Schwierigkeitsgrad erreicht haben, beenden wir
        if removed_cells >= max_cells_to_remove:
            return
            
        # Versuche, eine neue Zelle zu finden, die entfernt werden kann
        attempts = 0
        max_try = max_attempts or total_cells  # Falls kein max_attempts angegeben ist, alle Zellen probieren
        
        while attempts < max_try:
            row, col = rnd.randint(0, self.dimension**2-1), rnd.randint(0, self.dimension**2-1)
            if self.solution[row][col] is not None:
                # Zelle temporär entfernen
                temp_value = self.solution[row][col]
                self.solution[row][col] = None
                self.model.delete_constraint(self.con[row][col])
                
                # Prüfen, ob noch eine eindeutige Lösung existiert
                self.solve()
                if self.model.get_model_attribute(poi.ModelAttribute.ObjectiveValue) < self.dimension**4:
                    # Wenn keine eindeutige Lösung existiert, Zelle wiederherstellen
                    self.solution[row][col] = temp_value
                    self.con[row][col] = self.model.add_linear_constraint(self.x[row, col, temp_value-1], poi.Eq, 1.0)
                else:
                    # Wenn eine eindeutige Lösung existiert, weiter Zellen entfernen
                    self.remove_cell(difficulty, max_attempts)
                    return
                    
            attempts += 1
            
        # Wenn keine weitere Zelle entfernt werden kann, beenden wir
        return
        
    def get_incomplete_and_complete_sudoku(self, difficulty="normal"):
        """
        Erzeugt ein Sudoku mit dem angegebenen Schwierigkeitsgrad.
        
        Parameter:
        - difficulty: 'easy', 'normal' oder 'hard'
        
        Rückgabe:
        - Das unvollständige Sudoku und die vollständige Lösung
        """
        self.remove_cell(difficulty)
        return self.solution, self.get_solution()
        
class KillerSudokuSolver(SudokuSolver):
    def __init__(self, s: int, sudoku: list, cages: list, S: list):
        super().__init__(s, sudoku)
        for cage in range(len(S)):
            self.model.add_linear_constraint(poi.quicksum([self.x[i,j,k]*(k+1) for i in range(s**2) for j in range(s**2) for k in range(s**2) if cages[i, j] == cage]), poi.Eq, S[cage])
            for k in range(s**2):
                self.model.add_linear_constraint(poi.quicksum([self.x[i,j,k] for i in range(s**2) for j in range(s**2) if cages[i, j] == cage]), poi.Leq, 1.0)
        
        
        
        
class KillerSudokuGenerator(SudokuGenerator):
    def __init__(self, s: int):
        super().__init__(s)
        self.cages = []  # Liste der Käfige [(Zellen), Summe]
        
    def generate_cages(self, min_cage_size=1, max_cage_size=4):
        """
        Generiert Käfige für ein Killer-Sudoku.
        
        Parameter:
        - min_cage_size: Minimale Anzahl von Zellen in einem Käfig
        - max_cage_size: Maximale Anzahl von Zellen in einem Käfig
        
        Rückgabe:
        - Eine Liste von Käfigen, wobei jeder Käfig als Tupel (Liste von Zellen, Summe) dargestellt wird
        """
        s = self.dimension
        # Liste aller Zellen im Sudoku
        all_cells = [(i, j) for i in range(s**2) for j in range(s**2)]
        # Zufällig mischen, um verschiedene Käfige zu erhalten
        rnd.shuffle(all_cells)
        
        cages = []
        remaining_cells = set(all_cells)
        
        while remaining_cells:
            # Zufällige Startzelle auswählen
            start_cell = rnd.choice(list(remaining_cells))
            remaining_cells.remove(start_cell)
            
            # Cage erstellen mit der Startzelle
            current_cage = [start_cell]
            cage_size = rnd.randint(min_cage_size, min(max_cage_size, len(remaining_cells) + 1))
            
            # Weitere Zellen hinzufügen, die mit den bereits hinzugefügten Zellen verbunden sind
            while len(current_cage) < cage_size and remaining_cells:
                # Nachbarzellen aller Zellen im aktuellen Käfig finden
                neighbors = set()
                for cell in current_cage:
                    i, j = cell
                    # 4 Nachbarn: oben, unten, links, rechts
                    possible_neighbors = [(i-1, j), (i+1, j), (i, j-1), (i, j+1)]
                    for neighbor in possible_neighbors:
                        if (0 <= neighbor[0] < s**2 and 
                            0 <= neighbor[1] < s**2 and 
                            neighbor in remaining_cells):
                            neighbors.add(neighbor)
                
                if not neighbors:
                    break  # Keine weiteren Nachbarn verfügbar
                
                # Zufälligen Nachbar hinzufügen
                next_cell = rnd.choice(list(neighbors))
                current_cage.append(next_cell)
                remaining_cells.remove(next_cell)
            
            # Summe des Käfigs berechnen basierend auf der Lösung
            cage_sum = sum(self.get_solution()[i][j] for i, j in current_cage)
            
            # Käfig zur Liste hinzufügen
            cages.append((current_cage, cage_sum))
        
        self.cages = cages
        return cages
    
    def get_killer_sudoku(self, difficulty="normal"):
        """
        Erzeugt ein Killer-Sudoku mit dem angegebenen Schwierigkeitsgrad.
        
        Parameter:
        - difficulty: 'easy', 'normal' oder 'hard'
        
        Rückgabe:
        - Das unvollständige Sudoku, die vollständige Lösung und die Käfige mit Summen
        """
        self.remove_cell(difficulty)
        self.generate_cages()
        return self.solution, self.get_solution(), self.cages
        
        
        
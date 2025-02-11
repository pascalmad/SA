import numpy as np
from common import get_model, get_solution_from_model
import pyoptinterface as poi
import random as rnd


def create_sudoku(dimension: int):
    model, x = get_model(dimension)
    s = dimension

    random_seed = rnd.randint(0, 100000)
    #model.set_parameter("Seed", random_seed)
    #model.set_model_attribute(poi.ModelAttribute., random_seed)
    
    objective = 0
    for i in range(s**2):
        for j in range(s**2):
            rnd_value = rnd.randint(1,1000)  # Generate random value between 1 and 1000
            for k in range(s**2):
                if x[i, j, k] == 1:
                    objective += (k + 1) * rnd_value
                    
    objective2 = poi.quicksum(x[i, j, k] for i in range(s**2) for j in range(s**2) for k in range(s**2)) * rnd.randint(1, 1000)
                    
    objective3 = 0
    for i in range(s**2):
        for j in range(s**2):
            rnd_value = rnd.randint(1,1000)  # Generate random value between 1 and 1000
            print(rnd_value)
            objective += poi.quicksum(x[i, j, :]) * rnd_value  # Add the product to the objective#

    random_weights = np.random.randint(1, 100, size=(9, 9))
    objective6 = poi.quicksum(random_weights[i][j] * x[i][j] for i in range(9) for j in range(9))
    model.set_objective(objective6, sense=poi.ObjectiveSense.Minimize)
    
    model.optimize()
    print("Termination status:", model.get_model_attribute(poi.ModelAttribute.TerminationStatus))

    return get_solution_from_model(model, x, s)
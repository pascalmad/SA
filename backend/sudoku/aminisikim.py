import numpy as np
import random as rnd
import pyoptinterface as poi
from pyoptinterface import highs

from common import get_model, get_solution_from_model

async def amk_create(dimension: int):
    model = highs.Model()
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
                
    objective = 0
    for i in range(s**2):
        for j in range(s**2):
            rnd_value = rnd.randint(1,1000)  # Generate random value between 1 and 1000
            objective += poi.quicksum(x[i, j, :]) * rnd_value  # Add the product to the objective#

    model.set_objective(objective, poi.ObjectiveSense.Minimize)
    
    model.optimize()

    print("Termination status:", model.get_model_attribute(poi.ModelAttribute.TerminationStatus))
    
    get_v = np.vectorize(lambda x: model.get_value(x))
    x_value = get_v(x)
    for i in range(s**2):
        for j in range(s**2):
            for k in range(s**2):
                if x_value[i, j, k].astype(int) == 1:
                    print(f"{k+1}", end=" ")
        print("\n")
        
    return get_solution_from_model(model, x, s)
        
def kakakaka():
    model = 0
    s=2
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
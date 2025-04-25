from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import uvicorn

from mastermind import Mastermind, generate_first_move, reconstruct_C_matrix


app = FastAPI()

# Erlaube Anfragen von Frontend (Port 3000 oder wo auch immer es läuft)
origins = [
    "http://localhost:3000",
    "http://localhost:3001", # Falls du beide Ports verwendest
    # Füge hier ggf. weitere Origins hinzu (z.B. deine Produktions-URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Erlaube alle Methoden (POST, GET, etc.)
    allow_headers=["*"], # Erlaube alle Header
)

# --- Pydantic Models für Request Bodies --- #
class FeedbackModel(BaseModel):
    redPins: int
    whitePins: int

class MoveModel(BaseModel):
    colors: List[int] # Frontend sendet jetzt Farbindizes (0-5) statt Farbnamen
    feedback: Optional[FeedbackModel] = None

class FeedbackNextMoveRequest(BaseModel):
    moves: List[MoveModel] # Bisherige Züge mit Farbindizes


# --- API Endpunkte --- #

@app.get("/")
def read_root():
    return {"message": "Mastermind Backend running"}

@app.post("/mastermind/first_move")
def get_first_move():
    """Generiert und gibt den ersten Zug zurück."""
    try:
        first_move_indices = generate_first_move()
        # first_move ist eine Liste von Farb-Indizes [0, 0, 1, 1]
        print(f"Generated first move: {first_move_indices}")
        return {"solution": first_move_indices}
    except Exception as e:
        print(f"Error generating first move: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate first move")

@app.post("/mastermind/submit_feedback_next_move")
def submit_feedback_and_get_next(request: FeedbackNextMoveRequest):
    """Nimmt Feedback entgegen, berechnet und gibt den nächsten Zug zurück."""

    print(f"Received Moves: {request.moves}")
    
    C = reconstruct_C_matrix(request.moves)
    G = [move.feedback.redPins for move in request.moves]
    B = [move.feedback.whitePins for move in request.moves]
    mastermind_solver = Mastermind(C, G, B)
    solution_move = mastermind_solver.solve()
    return {"solution": solution_move}
    
    # Rekonstruiere die C-Matrix aus den bisherigen Zügen
    # Die Anzahl der Runden für die C-Matrix ist `request.round + 1`
    num_previous_rounds = request.round + 1
    try:
        C = reconstruct_C_matrix(request.moves)
        if C.shape[0] != num_previous_rounds:
             print(f"Warning: Reconstructed C matrix has {C.shape[0]} rounds, expected {num_previous_rounds}")
             # Handle potential mismatch if necessary, maybe slice C or raise error
             if C.shape[0] < num_previous_rounds:
                 raise ValueError("Reconstructed C matrix has fewer rounds than expected.")
             C = C[:num_previous_rounds, :, :] # Use only the relevant rounds

        print("Reconstructed C matrix shape:", C.shape)
    except Exception as e:
        print(f"Error reconstructing C matrix: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to reconstruct C matrix: {e}")


    # Berechne den nächsten Zug mit dem Solver
    # Die Runde für den Solver ist die Anzahl der *bisherigen* Feedbacks = num_previous_rounds
    solver_round = num_previous_rounds
    try:
        # Verwende die korrekten G und B Arrays aus dem Request
        mastermind_solver = Mastermind(C, request.G, request.B, solver_round)
        next_move_indices = mastermind_solver.solve()
        print(f"Calculated next move: {next_move_indices}")
        return {"solution": next_move_indices}
    except Exception as e:
        print(f"Error solving Mastermind: {e}")
        # Hier könnte spezifischeres Fehlerhandling erfolgen, z.B. wenn keine Lösung gefunden wird
        raise HTTPException(status_code=500, detail=f"Failed to calculate next move: {e}")

# --- Server starten (wenn die Datei direkt ausgeführt wird) --- #
if __name__ == "__main__":
    # Starte Uvicorn auf Port 8081
    uvicorn.run(app, host="0.0.0.0", port=8081)
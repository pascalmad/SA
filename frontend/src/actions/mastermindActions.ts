"use server";

import { Move } from "@/types/mastermind";

// Backend URL (auf Port 8081 ändern)
const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8081";

// Mapping von Frontend-Farbnamen zu Backend-Farbindizes
// Muss mit dem Backend konsistent sein!
/*
const colorToIndex: { [key: string]: number } = {
  red: 0, // Annahme: Rot ist Index 0 im Backend
  blue: 1,
  green: 2,
  yellow: 3,
  purple: 4,
  orange: 5,
};
*/

/**
 * Server Action zum Anfordern des **ersten** Zugs vom Backend.
 * @returns Eine Promise, die den ersten Zug (Move) oder einen Fehlerzustand auflöst.
 */
export async function fetchFirstMoveAction(): Promise<{
  move: Move | null;
  error?: string;
}> {
  console.log(`Server Action: fetchFirstMoveAction called`);

  try {
    // Fordere den ersten Zug an
    const response = await fetch(`${API_BASE_URL}/mastermind/first_move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    console.log(`Server Action: Backend response status: ${response.status}`);

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("Server Action: Backend error response body:", errorData);
      } catch (e) {
        console.error(e);
        // Wenn der Body kein JSON ist oder leer ist
        errorData = { detail: await response.text() };
        console.error(
          "Server Action: Backend error response text:",
          errorData.detail
        );
      }
      return {
        move: null,
        error: errorData.detail || `HTTP error! status: ${response.status}`,
      };
    }

    const data = await response.json();
    console.log("Server Action: Backend response data:", data);

    // Erwartet: Backend gibt den Zug als Array von Farb-Indizes zurück, z.B. { "solution": [0, 1, 4, 5] }
    if (!data.solution || !Array.isArray(data.solution)) {
      console.error(
        "Server Action: Invalid response format from backend:",
        data
      );
      return {
        move: null,
        error: "Invalid response format from backend for next move.",
      };
    }

    // Da wir jetzt direkt mit Farbindizes arbeiten, müssen wir nicht mehr umwandeln
    const colorIndices = data.solution;
    console.log("Server Action: Received first move indices:", colorIndices);

    return { move: { colors: colorIndices }, error: undefined };
  } catch (error) {
    console.error("Server Action: Error in fetchFirstMoveAction:", error);
    return {
      move: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

/**
 * Server Action zum Senden des Feedbacks und Anfordern des **nächsten** Zugs.
 * @param currentRound Die Runde (0-basiert), FÜR DIE GERADE FEEDBACK GEGEBEN WURDE.
 * @param arrayG Array mit der Anzahl der roten/schwarzen Pins BIS EINSCHLIESSLICH `currentRound`.
 * @param arrayB Array mit der Anzahl der weißen Pins BIS EINSCHLIESSLICH `currentRound`.
 * @param moves Array mit den bisherigen Zügen
 * @returns Eine Promise, die den NÄCHSTEN Zug (Move) oder einen Fehlerzustand auflöst.
 */
export async function submitFeedbackAndGetNextMoveAction(
  moves: Move[]
): Promise<{ move: Move | null; error?: string }> {
  console.log(
    `Server Action: submitFeedbackAndGetNextMoveAction called for round ${moves.length}`
  );
  console.log("Sending moves:", moves);

  try {
    const response = await fetch(
      `${API_BASE_URL}/mastermind/submit_feedback_next_move`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          moves: moves, // Die Farben sind jetzt bereits als Indices (numbers)
        }),
        cache: "no-store",
      }
    );

    console.log(
      `Server Action: Feedback/NextMove response status: ${response.status}`
    );

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error(
          "Server Action: Feedback/NextMove backend error response body:",
          errorData
        );
      } catch (e) {
        console.error(e);
        errorData = { detail: await response.text() };
        console.error(
          "Server Action: Feedback/NextMove backend error response text:",
          errorData.detail
        );
      }
      return {
        move: null,
        error: errorData.detail || `HTTP error! status: ${response.status}`,
      };
    }

    // Erwarte den nächsten Zug in der Antwort
    const data = await response.json();
    console.log("Server Action: Backend response data (next move):", data);

    // Prüfe, ob die Antwort den erwarteten nächsten Zug enthält
    if (!data.solution || !Array.isArray(data.solution)) {
      console.error(
        "Server Action: Invalid response format from backend (expected next move):",
        data
      );
      return {
        move: null,
        error: "Invalid response format from backend for next move.",
      };
    }

    // Da wir jetzt direkt mit Farbindizes arbeiten, müssen wir nicht mehr umwandeln
    const colorIndices = data.solution;
    console.log("Server Action: Received next move indices:", colorIndices);

    return { move: { colors: colorIndices }, error: undefined };
  } catch (error) {
    console.error(
      "Server Action: Error submitting feedback/getting next move:",
      error
    );
    return {
      move: null,
      error:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Leerer Export, um den "kein Modul"-Fehler zu beheben
export {};

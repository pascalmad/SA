// Adapter-API für die Serverless-Funktionen
// Diese Funktionen rufen die tatsächlichen Server-Actions auf

import { fetchFirstMoveAction } from "../actions/mastermindActions";

// Mapping der Farben (für die UI-Darstellung)
export const colorIndexToName: { [key: number]: string } = {
  0: "red",
  1: "blue",
  2: "green",
  3: "yellow",
  4: "purple",
  5: "orange",
};

export const colorNameToIndex: { [key: string]: number } = {
  red: 0,
  blue: 1,
  green: 2,
  yellow: 3,
  purple: 4,
  orange: 5,
};

/**
 * Ruft den ersten Zug vom Backend ab.
 * Verwendet die Server Action fetchFirstMoveAction.
 *
 * @returns Eine Promise mit dem ersten Zug als Array von Farbindizes
 * @throws Fehler, wenn der API-Aufruf fehlschlägt
 */
export async function fetchFirstMove(): Promise<{ colors: number[] }> {
  console.log("Frontend API: Requesting first move...");

  const result = await fetchFirstMoveAction();

  if (result.error || !result.move) {
    console.error("Frontend API: Error fetching first move:", result.error);
    throw new Error(result.error || "Failed to fetch first move");
  }

  console.log("Frontend API: Received first move:", result.move);
  return { colors: result.move.colors };
}

/**
 * Sendet Feedback für den aktuellen Zug und ruft den nächsten Zug ab.
 *
 * @param currentRound Die aktuelle Runde (0-basiert)
 * @param arrayG Array mit der Anzahl der roten/schwarzen Pins bis zur aktuellen Runde
 * @param arrayB Array mit der Anzahl der weißen Pins bis zur aktuellen Runde
 * @param moves Array mit allen bisherigen Zügen und deren Feedback
 * @returns Eine Promise mit dem nächsten Zug als Array von Farbindizes
 * @throws Fehler, wenn der API-Aufruf fehlschlägt
 */

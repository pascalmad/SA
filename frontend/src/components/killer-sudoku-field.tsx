"use client";

import { useState, useEffect } from "react";
import { SudokuCage } from "@/types/sudoku";

export default function KillerSudokuField({
  dimension,
  sudoku,
  updateSudoku,
  disabledFields,
  cages,
}: {
  dimension: 2 | 3 | 4 | 5;
  sudoku: (number | null)[][];
  updateSudoku: (x: number, y: number, value: number | null) => void;
  disabledFields: { x: number; y: number }[];
  cages: SudokuCage[];
}) {
  const [activeCell, setActiveCell] = useState<{ x: number; y: number } | null>(
    null
  );

  const gridDimensions = {
    2: "grid-cols-2 grid-rows-2",
    3: "grid-cols-3 grid-rows-3",
    4: "grid-cols-4 grid-rows-4",
    5: "grid-cols-5 grid-rows-5",
  };

  // Graph-Färbungsalgorithmus für die Käfige
  const [cageColorMap, setCageColorMap] = useState<Map<number, string>>(
    new Map()
  );

  useEffect(() => {
    // Feste Farben für die Käfige (ausreichend für typische Killer-Sudokus)
    const cageColors = [
      "bg-red-100",
      "bg-blue-100",
      "bg-green-100",
      "bg-yellow-100",
      "bg-purple-100",
      "bg-pink-100",
      "bg-indigo-100",
      "bg-gray-100",
      "bg-orange-100",
      "bg-teal-100",
      "bg-cyan-100",
      "bg-lime-100",
      "bg-amber-100",
      "bg-emerald-100",
      "bg-sky-100",
      "bg-violet-100",
      "bg-fuchsia-100",
      "bg-rose-100",
      "bg-slate-100",
      "bg-neutral-100",
    ];

    // Finde benachbarte Käfige
    const buildAdjacencyList = () => {
      // Adjazenzliste für den Graphen der Käfige
      const adjacencyList: Map<number, Set<number>> = new Map();

      // Initialisiere Adjazenzliste
      for (let i = 0; i < cages.length; i++) {
        adjacencyList.set(i, new Set<number>());
      }

      // Finde für jeden Käfig alle benachbarten Käfige
      for (let i = 0; i < cages.length; i++) {
        const cageA = cages[i];
        for (let j = i + 1; j < cages.length; j++) {
          const cageB = cages[j];

          // Prüfe, ob die Käfige benachbart sind (ob sie benachbarte Zellen haben)
          let areNeighbors = false;
          for (const cellA of cageA.cells) {
            for (const cellB of cageB.cells) {
              if (
                (Math.abs(cellA[0] - cellB[0]) === 1 &&
                  cellA[1] === cellB[1]) ||
                (Math.abs(cellA[1] - cellB[1]) === 1 && cellA[0] === cellB[0])
              ) {
                areNeighbors = true;
                break;
              }
            }
            if (areNeighbors) break;
          }

          // Wenn sie benachbart sind, trage sie in die Adjazenzliste ein
          if (areNeighbors) {
            adjacencyList.get(i)?.add(j);
            adjacencyList.get(j)?.add(i);
          }
        }
      }

      return adjacencyList;
    };

    // Greedy-Färbungsalgorithmus
    const colorGraph = (adjacencyList: Map<number, Set<number>>) => {
      const colors: Map<number, number> = new Map();

      // Sortiere Käfige nach Anzahl der Nachbarn (absteigend) - Heuristik
      const sortedCages = [...Array(cages.length).keys()].sort((a, b) => {
        return (
          (adjacencyList.get(b)?.size || 0) - (adjacencyList.get(a)?.size || 0)
        );
      });

      for (const cageIndex of sortedCages) {
        // Finde alle Farben, die von Nachbarn verwendet werden
        const usedColors = new Set<number>();
        adjacencyList.get(cageIndex)?.forEach((neighbor) => {
          if (colors.has(neighbor)) {
            usedColors.add(colors.get(neighbor)!);
          }
        });

        // Finde die kleinste verfügbare Farbe
        let color = 0;
        while (usedColors.has(color)) {
          color++;
        }

        // Weise die Farbe zu
        colors.set(cageIndex, color);
      }

      // Konvertiere Farbnummern zu tatsächlichen CSS-Klassen
      const colorMap = new Map<number, string>();
      colors.forEach((colorIndex, cageIndex) => {
        colorMap.set(cageIndex, cageColors[colorIndex % cageColors.length]);
      });

      return colorMap;
    };

    const adjacencyList = buildAdjacencyList();
    const colorMap = colorGraph(adjacencyList);
    setCageColorMap(colorMap);
  }, [cages]);

  // Funktion zum Bestimmen der Käfig-ID für eine bestimmte Zelle
  const getCageForCell = (x: number, y: number) => {
    for (let i = 0; i < cages.length; i++) {
      const cage = cages[i];
      if (cage.cells.some((cell) => cell[0] === x && cell[1] === y)) {
        return {
          cageIndex: i,
          sum: cage.sum,
          isFirstCell: cage.cells[0][0] === x && cage.cells[0][1] === y, // Erstes Element im Käfig
        };
      }
    }
    return null;
  };

  // Funktion zum Bestimmen der Käfig-Grenzen
  const getCageBorders = (x: number, y: number) => {
    const cageInfo = getCageForCell(x, y);
    if (!cageInfo) return "";

    const { cageIndex } = cageInfo;
    const cage = cages[cageIndex];

    const borderClasses = [];

    // Prüfen, ob die Nachbarzellen zum selben Käfig gehören
    const topCell = cage.cells.some(
      (cell) => cell[0] === x - 1 && cell[1] === y
    );
    const bottomCell = cage.cells.some(
      (cell) => cell[0] === x + 1 && cell[1] === y
    );
    const leftCell = cage.cells.some(
      (cell) => cell[0] === x && cell[1] === y - 1
    );
    const rightCell = cage.cells.some(
      (cell) => cell[0] === x && cell[1] === y + 1
    );

    // Fette Grenze hinzufügen, wenn Nachbarzelle nicht im selben Käfig ist
    if (!topCell) borderClasses.push("border-t-2");
    if (!bottomCell) borderClasses.push("border-b-2");
    if (!leftCell) borderClasses.push("border-l-2");
    if (!rightCell) borderClasses.push("border-r-2");

    return borderClasses.join(" ");
  };

  const NumberField = ({ x, y }: { x: number; y: number }) => {
    const isDisabled = disabledFields.some(
      (field) => field.x === x && field.y === y
    );

    const cageInfo = getCageForCell(x, y);
    const cageBorders = getCageBorders(x, y);
    // Verwende die optimierte Farbzuordnung statt einer einfachen Modulo-Operation
    const cageColor =
      cageInfo && cageColorMap.has(cageInfo.cageIndex)
        ? cageColorMap.get(cageInfo.cageIndex)
        : "bg-white";

    return (
      <div className={`relative ${cageColor} ${cageBorders}`}>
        {cageInfo?.isFirstCell && (
          <div className="absolute top-0 left-0 text-xs font-bold text-gray-500 z-10 p-1">
            {cageInfo.sum}
          </div>
        )}
        <input
          className={`text-center border caret-transparent h-full w-full outline-0 focus:bg-green-200 bg-transparent ${
            isDisabled ? "font-bold text-blue-600" : ""
          }`}
          tabIndex={0}
          type="text"
          autoComplete="off"
          name={`sudoku[${x}][${y}]`}
          disabled={isDisabled}
          defaultValue={sudoku[x][y] === null ? "" : sudoku[x][y]}
          onKeyDown={(e) => {
            e.preventDefault();
            setActiveCell({ x, y });
            if (e.key === "Backspace") {
              updateSudoku(x, y, null);
              return;
            }
            const value = [...Array(dimension ** 2).keys()]
              .map((i) => i + 1)
              .includes(parseInt(e.key))
              ? parseInt(e.key)
              : null;
            if (value === null) {
              return;
            }
            updateSudoku(x, y, value);
          }}
          autoFocus={x === activeCell?.x && y === activeCell?.y}
        />
      </div>
    );
  };

  return (
    <div className={`grid border border-black ${gridDimensions[dimension]}`}>
      {[...Array(dimension ** 2).keys()].map((i) => (
        <div
          key={i}
          className={`border border-black size-48 grid ${
            gridDimensions[dimension as 2 | 3 | 4 | 5]
          }`}
        >
          {[...Array(dimension ** 2).keys()].map((j) => {
            const x = i + Math.floor(j / dimension) - (i % dimension);
            const y =
              j - (Math.floor(j / dimension) - (i % dimension)) * dimension;
            return <NumberField key={j} x={x} y={y} />;
          })}
        </div>
      ))}
    </div>
  );
}

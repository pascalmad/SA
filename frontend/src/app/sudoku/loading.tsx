import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";

export default function Loading() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Sudoku</h1>
        <p className="text-muted-foreground mb-2">
          Löse das Puzzle, indem du jede Zeile, Spalte und Box mit den Zahlen
          1-9 auffüllst
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* Game info skeleton */}
              <div className="flex justify-between items-center mb-4 bg-card p-3 rounded-lg shadow">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-1 rounded-full">
                  <Clock className="h-4 w-4 text-muted" />
                  <Skeleton className="h-4 w-10" />
                </div>
              </div>

              {/* Sudoku grid skeleton */}
              <div className="aspect-square w-full max-w-md mx-auto animate-pulse">
                <div className="grid grid-cols-9 gap-[1px] border-2 border-primary/30 shadow-lg">
                  {Array.from({ length: 9 }).map((_, rowIndex) =>
                    Array.from({ length: 9 }).map((_, colIndex) => {
                      // Border styling for 3x3 boxes
                      const borderRight =
                        (colIndex + 1) % 3 === 0 && colIndex < 8
                          ? "border-r-[3px] border-r-primary/30"
                          : "border-r border-r-primary/20";
                      const borderBottom =
                        (rowIndex + 1) % 3 === 0 && rowIndex < 8
                          ? "border-b-[3px] border-b-primary/30"
                          : "border-b border-b-primary/20";

                      return (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`aspect-square flex items-center justify-center relative cursor-pointer transition-colors bg-muted/20 ${borderRight} ${borderBottom}`}
                        >
                          {/* Ein paar zufällige Zellen mit Skeleton Zahlen füllen */}
                          {Math.random() > 0.7 && (
                            <Skeleton className="h-6 w-6 rounded-md" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-4">
            <CardContent className="p-4">
              {/* Buttons skeleton */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 flex-1" />
                ))}
              </div>

              {/* Mode info skeleton */}
              <Skeleton className="h-20 w-full mb-3" />

              {/* Number buttons skeleton */}
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 9 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-40 mb-3" />
              <div className="grid grid-cols-3 gap-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

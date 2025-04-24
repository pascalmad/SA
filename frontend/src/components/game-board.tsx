import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import MoveRow from "./move-row";
import { GameState } from "@/types/mastermind";

interface GameBoardProps {
  gameState: GameState;
  arrayG: number[];
  arrayB: number[];
}

export default function GameBoard({
  gameState,
  arrayG,
  arrayB,
}: GameBoardProps) {
  const { moves, currentRound, isWaitingForFeedback } = gameState;

  return (
    <Card className="h-full border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Game Board</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[50vh] lg:h-[60vh] rounded-md">
          <div className="flex flex-col-reverse gap-2 p-2">
            {moves.map((move, index) => (
              <MoveRow
                key={index}
                move={move}
                roundNumber={index + 1}
                isActive={index === currentRound && isWaitingForFeedback}
                redPins={arrayG[index] || 0}
                whitePins={arrayB[index] || 0}
                codeLength={gameState.codeLength}
              />
            ))}

            {moves.length === 0 && (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Waiting for the first move...
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

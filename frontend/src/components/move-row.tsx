import { cn } from "@/lib/utils"

import ColorPeg from "./color-peg"
import FeedbackPegs from "./feedback-pegs"
import { Move } from "@/types/mastermind"

interface MoveRowProps {
  move: Move
  roundNumber: number
  isActive: boolean
  redPins: number
  whitePins: number
  codeLength: number
}

export default function MoveRow({ move, roundNumber, isActive, redPins, whitePins, codeLength }: MoveRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-md transition-colors",
        isActive ? "bg-muted border-2 border-primary" : "bg-card",
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium w-6">{roundNumber}.</span>
        <div className="flex gap-2">
          {move.colors.map((color, index) => (
            <ColorPeg key={index} color={color} size="md" />
          ))}
        </div>
      </div>

      <FeedbackPegs redPins={redPins} whitePins={whitePins} codeLength={codeLength} isReadOnly={true} />
    </div>
  )
}


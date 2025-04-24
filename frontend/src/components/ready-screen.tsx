"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ColorPeg from "./color-peg";

interface ReadyScreenProps {
  availableColors: string[];
  onReady: () => void;
}

export default function ReadyScreen({
  availableColors,
  onReady,
}: ReadyScreenProps) {
  return (
    <Card className="border-2 w-full">
      <CardHeader>
        <CardTitle className="text-xl text-center">
          Mastermind - Codemaster
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-2">
          <p className="font-medium">Are you ready to play?</p>
          <p className="text-sm text-muted-foreground">
            Think of a secret code using the colors below. The AI will try to
            guess your code.
          </p>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-sm font-medium mb-3">Available Colors:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {availableColors.map((color) => (
              <div key={color} className="flex flex-col items-center gap-1">
                <ColorPeg color={color} size="lg" />
                <span className="text-xs capitalize">{color}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">How to Play:</h3>
          <ul className="text-sm space-y-2">
            <li>
              1. Think of a secret code using 4 of the colors shown above.
            </li>
            <li>2. The AI will make a guess.</li>
            <li>
              3. You provide feedback using red and white pins:
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-xs">
                  Red/Black pin: correct color in correct position
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-3 h-3 rounded-full bg-white border border-gray-300"></div>
                <span className="text-xs">
                  White pin: correct color in wrong position
                </span>
              </div>
            </li>
            <li>
              4. The game continues until the code is guessed or 10 attempts are
              used.
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onReady}>
          I&apos;m Ready to Start
        </Button>
      </CardFooter>
    </Card>
  );
}

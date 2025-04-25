"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Minus, Plus, Loader2 } from "lucide-react";
import { FeedbackPins } from "@/types/mastermind";

interface FeedbackControlsProps {
  codeLength: number;
  onSubmit: (feedback: FeedbackPins) => void;
  isDisabled: boolean;
  isProcessing: boolean;
}

export default function FeedbackControls({
  codeLength,
  onSubmit,
  isDisabled,
  isProcessing,
}: FeedbackControlsProps) {
  const [redPins, setRedPins] = useState(0);
  const [whitePins, setWhitePins] = useState(0);

  // Reset pins when the component becomes enabled (new round)
  useEffect(() => {
    if (!isDisabled && !isProcessing) {
      setRedPins(0);
      setWhitePins(0);
    }
  }, [isDisabled, isProcessing]);

  const handleRedPinsChange = (increment: boolean) => {
    if (increment && redPins + whitePins < codeLength) {
      setRedPins(redPins + 1);
    } else if (!increment && redPins > 0) {
      setRedPins(redPins - 1);
    }
  };

  const handleWhitePinsChange = (increment: boolean) => {
    if (increment && redPins + whitePins < codeLength) {
      setWhitePins(whitePins + 1);
    } else if (!increment && whitePins > 0) {
      setWhitePins(whitePins - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      redPins,
      whitePins,
    });
  };

  const getStatusMessage = () => {
    if (isProcessing) {
      return "Processing...";
    }
    if (isDisabled) {
      return "Waiting for next move...";
    }
    return "Provide feedback for this guess";
  };

  return (
    <Card className={`w-full h-full ${isDisabled ? "opacity-80" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Feedback Controls</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground h-5">
            {getStatusMessage()}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-32">
              <div className="w-4 h-4 rounded-full bg-red-600"></div>
              <span>Red/Black:</span>
              <span className="font-medium ml-1 w-4 text-center">
                {redPins}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRedPinsChange(false)}
                disabled={redPins === 0 || isDisabled}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRedPinsChange(true)}
                disabled={redPins + whitePins >= codeLength || isDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 w-32">
              <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
              <span>White:</span>
              <span className="font-medium ml-1 w-4 text-center">
                {whitePins}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleWhitePinsChange(false)}
                disabled={whitePins === 0 || isDisabled}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleWhitePinsChange(true)}
                disabled={redPins + whitePins >= codeLength || isDisabled}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 h-5">
            <div>
              <span className="text-sm text-muted-foreground">
                Total: {redPins + whitePins}/{codeLength}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleSubmit} disabled={isDisabled}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Submit Feedback"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

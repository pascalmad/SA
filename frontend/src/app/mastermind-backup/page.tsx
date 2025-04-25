"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RotateCcw, HelpCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  fetchFirstMoveAction,
  submitFeedbackAndGetNextMoveAction,
} from "@/actions/mastermindActions";
import { FeedbackPins, GameState } from "@/types/mastermind";
import FeedbackControls from "@/components/feedback-controls";

// Available colors for the game
const COLORS = ["red", "blue", "green", "yellow", "purple", "orange"];
const MAX_ATTEMPTS = 10;
const CODE_LENGTH = 4;

export default function Mastermind() {
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>({
    moves: [],
    currentRound: 0,
    isGameOver: false,
    isWaitingForFeedback: false,
    codeLength: CODE_LENGTH,
    availableColors: COLORS,
    maxRounds: MAX_ATTEMPTS,
    isReady: false,
    isProcessing: false,
  });
  const [arrayG, setArrayG] = useState<number[]>([]); // red/black pins
  const [arrayB, setArrayB] = useState<number[]>([]); // white pins
  const [secretCode, setSecretCode] = useState<string[]>(
    Array(CODE_LENGTH).fill("")
  );

  // Get color style for pegs
  const getColorStyle = (color: string) => {
    switch (color) {
      case "red":
        return "bg-red-500";
      case "blue":
        return "bg-blue-500";
      case "green":
        return "bg-green-500";
      case "yellow":
        return "bg-yellow-500";
      case "purple":
        return "bg-purple-500";
      case "orange":
        return "bg-orange-500";
      default:
        return "bg-gray-300 dark:bg-gray-700";
    }
  };

  // Handle color selection for secret code setup
  const handleColorSelect = (index: number, color: string) => {
    if (gameState.isReady) return;

    const newCode = [...secretCode];
    newCode[index] = color;
    setSecretCode(newCode);
  };

  // Clear a specific position in the code
  const clearPosition = (index: number) => {
    if (gameState.isReady) return;

    const newCode = [...secretCode];
    newCode[index] = "";
    setSecretCode(newCode);
  };

  // Start the game with the selected secret code
  const startGame = async () => {
    if (secretCode.some((color) => !color)) return;

    try {
      setGameState((prev) => ({ ...prev, isProcessing: true }));

      // Get first move from backend
      const { move: firstMove, error } = await fetchFirstMoveAction();
      if (!firstMove) throw new Error(error);

      setGameState((prev) => ({
        ...prev,
        moves: [firstMove],
        isReady: true,
        isWaitingForFeedback: true,
        isProcessing: false,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to start game",
        variant: "destructive",
      });
      setGameState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedback: FeedbackPins) => {
    try {
      setGameState((prev) => ({ ...prev, isProcessing: true }));

      // Update feedback arrays
      setArrayG([...arrayG, feedback.redPins]);
      setArrayB([...arrayB, feedback.whitePins]);

      // Update the current move with feedback
      const updatedMoves = [...gameState.moves];
      if (updatedMoves[gameState.currentRound]) {
        updatedMoves[gameState.currentRound] = {
          ...updatedMoves[gameState.currentRound],
          feedback: {
            redPins: feedback.redPins,
            whitePins: feedback.whitePins,
          },
        };
      }

      // Check if game is over
      if (feedback.redPins === CODE_LENGTH) {
        setGameState((prev) => ({
          ...prev,
          moves: updatedMoves,
          isGameOver: true,
          isWaitingForFeedback: false,
          isProcessing: false,
        }));
        toast({
          title: "Code Cracked!",
          description: "The codebreaker has successfully guessed your code!",
        });
        return;
      }

      if (gameState.currentRound >= MAX_ATTEMPTS - 1) {
        setGameState((prev) => ({
          ...prev,
          moves: updatedMoves,
          isGameOver: true,
          isWaitingForFeedback: false,
          isProcessing: false,
        }));
        toast({
          title: "Game Over",
          description:
            "The codebreaker couldn't guess your code in the allowed number of attempts.",
        });
        return;
      }

      // Get next move from backend
      const { move: nextMove, error } =
        await submitFeedbackAndGetNextMoveAction(updatedMoves);
      if (!nextMove) throw new Error(error);

      setGameState((prev) => ({
        ...prev,
        moves: [...updatedMoves, nextMove],
        currentRound: prev.currentRound + 1,
        isWaitingForFeedback: true,
        isProcessing: false,
      }));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process feedback",
        variant: "destructive",
      });
      setGameState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  // Reset the game
  const resetGame = () => {
    setSecretCode(Array(CODE_LENGTH).fill(""));
    setGameState({
      moves: [],
      currentRound: 0,
      isGameOver: false,
      isWaitingForFeedback: false,
      codeLength: CODE_LENGTH,
      availableColors: COLORS,
      maxRounds: MAX_ATTEMPTS,
      isReady: false,
      isProcessing: false,
    });
    setArrayG([]);
    setArrayB([]);
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-center"
      >
        <h1 className="text-3xl font-bold mb-2">Mastermind</h1>
        <p className="text-muted-foreground">
          You are the Codemaster - set a code and give feedback on guesses
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-4">
              {/* Secret code setup */}
              {!gameState.isReady && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-8"
                >
                  <h2 className="text-xl font-bold mb-4 text-center">
                    Set Your Secret Code
                  </h2>
                  <div className="flex justify-center gap-4 mb-6">
                    {Array(CODE_LENGTH)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center gap-2 h-20 w-12"
                        >
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer",
                              secretCode[index] &&
                                getColorStyle(secretCode[index])
                            )}
                            onClick={() => {
                              if (!secretCode[index]) {
                                handleColorSelect(index, COLORS[0]);
                              }
                            }}
                          >
                            {!secretCode[index] && (
                              <span className="text-gray-400">?</span>
                            )}
                          </div>
                          {secretCode[index] ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => clearPosition(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          ) : (
                            <div className="h-6 w-6"></div>
                          )}
                        </div>
                      ))}
                  </div>

                  <div className="grid grid-cols-6 gap-3 max-w-xs mx-auto mb-6">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-full aspect-square rounded-full",
                          getColorStyle(color)
                        )}
                        onClick={() => {
                          const emptyIndex = secretCode.findIndex((c) => !c);
                          if (emptyIndex !== -1) {
                            handleColorSelect(emptyIndex, color);
                          }
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setSecretCode(Array(CODE_LENGTH).fill(""))}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={startGame}
                      disabled={
                        secretCode.some((color) => !color) ||
                        gameState.isProcessing
                      }
                    >
                      Start Game
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Game board */}
              {gameState.isReady && (
                <div className="space-y-4">
                  {/* Secret code (hidden during play) */}
                  <div className="flex justify-center mb-8">
                    <div className="border-2 border-primary p-2 rounded-md">
                      <div className="text-center text-sm mb-2 font-medium">
                        Your Secret Code
                      </div>
                      <div className="flex gap-2">
                        {secretCode.map((color, index) => (
                          <div
                            key={index}
                            className={cn(
                              "w-8 h-8 rounded-full",
                              getColorStyle(color)
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Current guess and feedback */}
                  {gameState.isWaitingForFeedback && !gameState.isGameOver && (
                    <div className="p-4 mb-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Current guess */}
                        <div className="flex-1 border-2 border-primary/50 rounded-md p-4">
                          <h3 className="text-sm font-medium mb-2">
                            Current Guess
                          </h3>
                          <div className="flex justify-center gap-2">
                            {gameState.moves[
                              gameState.currentRound
                            ]?.colors.map((color, index) => (
                              <div
                                key={index}
                                className={cn(
                                  "w-10 h-10 rounded-full",
                                  getColorStyle(COLORS[color])
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Feedback controls */}
                        <div className="flex-1 w-full">
                          <FeedbackControls
                            codeLength={CODE_LENGTH}
                            onSubmit={handleFeedbackSubmit}
                            isDisabled={gameState.isProcessing}
                            isProcessing={gameState.isProcessing}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Previous guesses */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium mb-2">
                      Previous Guesses
                    </h3>
                    {gameState.moves.slice(0, -1).map((move, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 border rounded-md bg-muted/30"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium w-6">
                            {index + 1}.
                          </span>
                          <div className="flex gap-2">
                            {move.colors.map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className={cn(
                                  "w-8 h-8 rounded-full",
                                  getColorStyle(COLORS[color])
                                )}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-16 justify-end">
                          {Array(arrayG[index])
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={`red-${i}`}
                                className="w-4 h-4 rounded-full bg-red-600"
                              />
                            ))}
                          {Array(arrayB[index])
                            .fill(0)
                            .map((_, i) => (
                              <div
                                key={`white-${i}`}
                                className="w-4 h-4 rounded-full bg-white border border-gray-300"
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                    {gameState.moves.length <= 1 && (
                      <div className="p-8 flex items-center justify-center border rounded-md bg-muted/20">
                        <p className="text-muted-foreground text-sm">
                          No previous guesses yet
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Game over message */}
                  {gameState.isGameOver && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "p-4 rounded-md text-center font-bold text-white",
                        arrayG[arrayG.length - 1] === CODE_LENGTH
                          ? "bg-green-500"
                          : "bg-red-500"
                      )}
                    >
                      {arrayG[arrayG.length - 1] === CODE_LENGTH
                        ? "You lost! The computer cracked your code!"
                        : "You won! The computer couldn't guess your code!"}
                      <Button
                        variant="outline"
                        className="mt-2 bg-white text-black hover:bg-gray-100"
                        onClick={resetGame}
                      >
                        Play Again
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Game Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={resetGame}
                >
                  <RotateCcw className="h-4 w-4" />
                  New Game
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      How to Play
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>How to Play Mastermind</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 text-sm">
                      <p>
                        In this version of Mastermind, you are the Codemaster.
                        You set a secret code and the computer tries to guess
                        it.
                      </p>
                      <ol className="list-decimal pl-5 space-y-2">
                        <li>
                          First, set your secret code using the colored pegs.
                        </li>
                        <li>The computer will make a guess.</li>
                        <li>
                          For each peg in the guess, provide feedback:
                          <ul className="list-disc pl-5 mt-1">
                            <li>
                              <span className="text-red-600 font-bold">
                                Red/Black
                              </span>{" "}
                              - Correct color and position
                            </li>
                            <li>
                              <span className="text-gray-600 font-bold">
                                White
                              </span>{" "}
                              - Correct color but wrong position
                            </li>
                          </ul>
                        </li>
                        <li>
                          The computer will use your feedback to make better
                          guesses.
                        </li>
                        <li>
                          You win if the computer can&apos;t guess your code in{" "}
                          {MAX_ATTEMPTS} attempts.
                        </li>
                      </ol>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Game Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Attempts:</span>
                  <span className="font-bold">
                    {gameState.currentRound + 1}/{MAX_ATTEMPTS}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">
                    {!gameState.isReady && "Setting Code"}
                    {gameState.isReady &&
                      !gameState.isGameOver &&
                      "In Progress"}
                    {gameState.isGameOver &&
                      arrayG[arrayG.length - 1] === CODE_LENGTH &&
                      "Computer Won"}
                    {gameState.isGameOver &&
                      arrayG[arrayG.length - 1] !== CODE_LENGTH &&
                      "You Won"}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <h4 className="font-medium mb-2">Feedback Legend:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-600"></div>
                      <span>Correct color and position</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
                      <span>Correct color, wrong position</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export interface FeedbackPins {
  redPins: number;
  whitePins: number;
}

export interface Move {
  colors: number[];
  feedback?: FeedbackPins;
}

export interface GameState {
  moves: Move[];
  currentRound: number;
  isGameOver: boolean;
  isWaitingForFeedback: boolean;
  isReady: boolean;
  isProcessing: boolean;
  codeLength: number;
  availableColors: string[];
  maxRounds: number;
}

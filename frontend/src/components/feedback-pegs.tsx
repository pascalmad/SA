interface FeedbackPegsProps {
  redPins: number;
  whitePins: number;
  codeLength: number;
  isReadOnly?: boolean;
}

export default function FeedbackPegs({
  redPins,
  whitePins,
  codeLength,
}: FeedbackPegsProps) {
  // Calculate empty pins
  const emptyPins = codeLength - redPins - whitePins;

  return (
    <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
      {Array.from({ length: redPins }).map((_, i) => (
        <div key={`red-${i}`} className="w-3 h-3 rounded-full bg-red-600" />
      ))}

      {Array.from({ length: whitePins }).map((_, i) => (
        <div
          key={`white-${i}`}
          className="w-3 h-3 rounded-full bg-white border border-gray-300"
        />
      ))}

      {Array.from({ length: emptyPins }).map((_, i) => (
        <div
          key={`empty-${i}`}
          className="w-3 h-3 rounded-full bg-gray-300 opacity-30"
        />
      ))}
    </div>
  );
}

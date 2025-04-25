"use client";

import { cn } from "@/lib/utils";
import { colorIndexToName } from "@/lib/api";

interface ColorPegProps {
  color: string | number;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  isSelected?: boolean;
}

export default function ColorPeg({
  color,
  size = "md",
  onClick,
  isSelected = false,
}: ColorPegProps) {
  // Konvertiere Farbindex zu Farbnamen, wenn nötig
  const colorName =
    typeof color === "number" ? colorIndexToName[color] || "grey" : color;

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const colorClasses: Record<string, string> = {
    red: "bg-red-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-400",
    purple: "bg-purple-500",
    orange: "bg-orange-500",
    white: "bg-white",
    black: "bg-black",
    grey: "bg-gray-300", // Fallback-Farbe
  };

  return (
    <div
      className={cn(
        "rounded-full shadow-inner transition-all",
        sizeClasses[size],
        colorClasses[colorName] || "bg-gray-300",
        onClick && "cursor-pointer hover:opacity-90 active:scale-95",
        isSelected && "ring-2 ring-offset-2 ring-primary"
      )}
      onClick={onClick}
      role={onClick ? "button" : "presentation"}
      aria-label={onClick ? `Select ${colorName} peg` : `${colorName} peg`}
    />
  );
}

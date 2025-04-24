"use client";

import Link from "next/link";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const gameOptions = [
    {
      title: "Sudoku Solver",
      description:
        "Solve pre-defined Sudoku puzzles with varying difficulty levels",
      href: "/sudoku/solve",
      icon: "🧩",
      color:
        "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
    },
    {
      title: "Sudoku Creator",
      description: "Create your own Sudoku puzzles from scratch",
      href: "/sudoku",
      icon: "✏️",
      color:
        "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
    },
    {
      title: "Mastermind",
      description: "Play as the Codemaster in this classic code-breaking game",
      href: "/mastermind",
      icon: "🎯",
      color:
        "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
    },
    {
      title: "Killer Sudoku",
      description: "Play and auto-solve challenging Killer Sudoku puzzles",
      href: "/killer-sudoku",
      icon: "⚔️",
      color:
        "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Logic Games Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Challenge your mind with our collection of logic puzzles and games
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {gameOptions.map((option, index) => (
          <motion.div key={index} variants={item}>
            <Link href={option.href} className="block h-full">
              <Card
                className={`h-full hover:shadow-lg transition-shadow ${option.color} border-2 hover:border-primary/50`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">{option.title}</CardTitle>
                    <span className="text-4xl">{option.icon}</span>
                  </div>
                  <CardDescription className="text-base">
                    {option.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button variant="ghost" className="ml-auto group">
                    Play Now
                    <MoveRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

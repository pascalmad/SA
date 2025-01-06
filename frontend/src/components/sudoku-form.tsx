"use client";

import { useState } from "react";
import SudokuField from "./sudoku-field";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { Button } from "./ui/button";

const formSchema = z.object({
  dimension: z.literal(2).or(z.literal(3)),
  sudoku: z.array(z.array(z.number().nullable())),
});

export default function SudokuForm() {
  /* const sudoku2 = [
    [1, 2, 3, 4],
    [3, 4, 1, 4],
    [2, 1, 4, 4],
    [4, 3, 2, 4],
  ]; */
  const sudoku3 = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 3, 1, 5, 6, 4, 8, 9, 7],
    [5, 6, 4, 8, 9, 7, 2, 3, 1],
    [8, 9, 7, 2, 3, 1, 5, 6, 4],
    [3, 1, 2, 6, 4, 5, 9, 7, 8],
    [6, 4, 5, 9, 7, 8, 3, 1, 2],
    [9, 7, 8, 3, 1, 2, 6, 4, 5],
  ];
  const [sudoku, setSudoku] = useState<(number | null)[][]>(sudoku3);
  const updateSudoku = (x: number, y: number, value: number | null) => {
    if (sudoku === null) {
      return;
    }
    const newSudoku = [...sudoku];
    newSudoku[x][y] = value;
    setSudoku(newSudoku);
    form.setValue("sudoku", newSudoku);
  };
  const dimension = 3;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimension,
      sudoku,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sudoku"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <SudokuField
                  dimension={form.getValues("dimension")}
                  sudoku={field.value}
                  updateSudoku={updateSudoku}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

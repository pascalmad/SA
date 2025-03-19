"use client";

import SudokuField from "./sudoku-field";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Button } from "./ui/button";
import { solveSudoku } from "@/actions/sudokuActions";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Sudoku } from "@/types/sudoku";

const formSchema = z.object({
  dimension: z.literal(2).or(z.literal(3)),
  sudoku: z.array(z.array(z.number().nullable())),
  disabledFields: z.array(z.object({ x: z.number(), y: z.number() })),
});

export default function SudokuForm() {
  const emptySudoku = (dimension: number) =>
    Array.from(
      Array(dimension ** 2).fill(Array.from(Array(dimension ** 2).fill(null)))
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dimension: 3,
      sudoku: emptySudoku(3),
    },
  });

  const updateSudoku = (x: number, y: number, value: number | null) => {
    const newSudoku = form.getValues("sudoku");
    newSudoku[x][y] = value;
    form.setValue("sudoku", newSudoku);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const response = await solveSudoku(values);
    console.log("response: ", response);
    form.setValue("sudoku", response);
    //const sudoku = await generateSudoku(3);
    //console.log("sudoku: ", sudoku);
  }

  const disabledFields = form
    .getValues("sudoku")
    .flatMap((row, x) =>
      row.map((value, y) => (value !== null ? { x, y } : null))
    )
    .filter((field): field is { x: number; y: number } => field !== null);

  const sudoku: Sudoku = {
    dimension: form.getValues("dimension"),
    sudoku: form.getValues("sudoku"),
    disabledFields: disabledFields,
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="dimension"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    form.setValue("dimension", parseInt(value) as 2 | 3);
                    form.setValue("sudoku", emptySudoku(parseInt(value)));
                  }}
                  defaultValue={field.value.toString()}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="2" />
                    </FormControl>
                    <FormLabel className="font-normal">2</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="3" />
                    </FormControl>
                    <FormLabel className="font-normal">3</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sudoku"
          render={() => (
            <FormItem>
              <FormControl>
                <SudokuField
                  dimension={sudoku.dimension}
                  sudoku={sudoku.sudoku}
                  originalSudoku={emptySudoku(sudoku.dimension)}
                  updateSudoku={updateSudoku}
                  disabledFields={sudoku.disabledFields}
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

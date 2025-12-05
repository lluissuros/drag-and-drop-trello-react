import { z } from "zod";
import { Board } from "./types/Board";
import { COLUMN_ORDER } from "./types/Column";

const taskSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const columnSchema = z.object({
  id: z.enum(COLUMN_ORDER),
  title: z.string(),
  tasks: z.array(taskSchema),
});

const boardSchema = z
  .object({
    columns: z.array(columnSchema),
  })
  .superRefine((value, ctx) => {
    if (value.columns.length !== COLUMN_ORDER.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Board must contain all columns",
      });
      return;
    }

    value.columns.forEach((column, index) => {
      if (column.id !== COLUMN_ORDER[index]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Column order mismatch at position ${index}`,
        });
      }
    });
  });

export type BoardValidationResult =
  | { ok: true; board: Board }
  | { ok: false; reason: string };

export const validateBoard = (input: unknown): BoardValidationResult => {
  const result = boardSchema.safeParse(input);

  if (!result.success) {
    const reason = result.error.issues[0]?.message ?? "Invalid board data";
    return { ok: false, reason };
  }

  // Extra safety: ensure task ids are unique within the board
  const ids = new Set<string>();
  for (const column of result.data.columns) {
    for (const task of column.tasks) {
      if (ids.has(task.id)) {
        return { ok: false, reason: "Duplicate task id found" };
      }
      ids.add(task.id);
    }
  }

  return { ok: true, board: result.data };
};

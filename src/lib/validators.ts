import { z } from "zod";
import { Board } from "./types/Board";
import { COLUMN_ORDER } from "./types/Column";

const cardSchema = z.object({
  id: z.string(),
  text: z.string(),
});

const columnSchema = z.object({
  id: z.enum(COLUMN_ORDER),
  title: z.string(),
  cards: z.array(cardSchema),
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

  // Extra safety: ensure card ids are unique within the board
  const ids = new Set<string>();
  for (const column of result.data.columns) {
    for (const card of column.cards) {
      if (ids.has(card.id)) {
        return { ok: false, reason: "Duplicate card id found" };
      }
      ids.add(card.id);
    }
  }

  return { ok: true, board: result.data };
};

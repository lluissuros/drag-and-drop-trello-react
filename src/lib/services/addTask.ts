import { Board } from "../types/Board";
import { ColumnId } from "../types/Column";

export type addTaskResult =
  | { ok: true; board: Board }
  | { ok: false; reason: string };

export const addTask = (
  board: Board,
  columnId: ColumnId,
  text: string
): addTaskResult => {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, reason: "Card text cannot be empty" };
  }

  const columnIndex = board.columns.findIndex(
    (column) => column.id === columnId
  );
  if (columnIndex === -1) {
    return { ok: false, reason: "Column not found" };
  }

  const newCardId = crypto.randomUUID();
  const newBoard: Board = {
    columns: board.columns.map((column, index) =>
      index === columnIndex
        ? {
            ...column,
            cards: [...column.cards, { id: newCardId, text: trimmed }],
          }
        : column
    ),
  };

  return { ok: true, board: newBoard };
};

import { Board } from "../types/Board";
import { COLUMN_LABELS, COLUMN_ORDER } from "../types/Column";

export const createBoard = (): Board => ({
  columns: COLUMN_ORDER.map((id) => ({
    id,
    title: COLUMN_LABELS[id],
    cards: [],
  })),
});

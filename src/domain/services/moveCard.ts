import { Board } from "../types/Board";
import { COLUMN_ORDER, ColumnId } from "../types/Column";

export type MoveCardResult =
  | { ok: true; board: Board }
  | { ok: false; reason: string };

export const moveCard = (
  board: Board,
  cardId: string,
  targetColumnId: ColumnId
): MoveCardResult => {
  const sourceColumnIndex = board.columns.findIndex((column) =>
    column.cards.some((card) => card.id === cardId)
  );
  if (sourceColumnIndex === -1) {
    return { ok: false, reason: "Card not found" };
  }

  const targetIndex = COLUMN_ORDER.indexOf(targetColumnId);
  if (targetIndex === -1) {
    return { ok: false, reason: "Invalid target column" };
  }

  const sourceColumn = board.columns[sourceColumnIndex];
  const card = sourceColumn.cards.find((item) => item.id === cardId);
  if (!card) {
    return { ok: false, reason: "Card not found" };
  }

  if (sourceColumn.id === "DONE" && targetColumnId !== "DONE") {
    return { ok: false, reason: "Cards in DONE cannot be moved" };
  }

  if (sourceColumn.id === targetColumnId) {
    return { ok: true, board };
  }

  const isAdjacent = Math.abs(sourceColumnIndex - targetIndex) === 1;
  if (!isAdjacent) {
    return { ok: false, reason: "Cards can only move to adjacent columns" };
  }

  const targetColumn = board.columns[targetIndex];
  const isMovingIntoDoing = targetColumn.id === "DOING";
  if (
    isMovingIntoDoing &&
    !targetColumn.cards.some((c) => c.id === cardId) &&
    targetColumn.cards.length >= 2
  ) {
    return { ok: false, reason: "DOING column can only contain 2 cards" };
  }

  const updatedColumns = board.columns.map((column, index) => {
    if (index === sourceColumnIndex) {
      return {
        ...column,
        cards: column.cards.filter((item) => item.id !== cardId),
      };
    }

    if (index === targetIndex) {
      return { ...column, cards: [...column.cards, card] };
    }

    return column;
  });

  return { ok: true, board: { columns: updatedColumns } };
};

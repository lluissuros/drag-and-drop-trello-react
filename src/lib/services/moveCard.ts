import { Board } from "../types/Board";
import { COLUMN_ORDER, ColumnId } from "../types/Column";

export const ErrorReasons = {
  CardNotFound: "Card not found",
  InvalidTargetColumn: "Invalid target column",
  CardsInDoneCannotBeMoved: "Cards in DONE cannot be moved",
  CardsCanOnlyMoveToAdjacentColumns: "Cards can only move to adjacent columns",
  DoingColumnCanOnlyContain2Cards: "DOING column can only contain 2 cards",
} as const;

export type ErrorReason = (typeof ErrorReasons)[keyof typeof ErrorReasons];

export type MoveCardResult =
  | { ok: true; board: Board }
  | { ok: false; reason: ErrorReason };

/**
 * Moves a card from one column to another.
 * @param board - The board to move the card on.
 * @param cardId - The id of the card to move.
 * @param targetColumnId - The id of the column to move the card to.
 * @returns A result object with the updated board if the move was successful, or an error reason if it was not.
 */
export const moveCard = (
  board: Board,
  cardId: string,
  targetColumnId: ColumnId
): MoveCardResult => {
  const sourceColumnIndex = board.columns.findIndex((column) =>
    column.cards.some((card) => card.id === cardId)
  );
  if (sourceColumnIndex === -1) {
    return { ok: false, reason: ErrorReasons.CardNotFound };
  }

  const targetIndex = COLUMN_ORDER.indexOf(targetColumnId);
  if (targetIndex === -1) {
    return { ok: false, reason: ErrorReasons.InvalidTargetColumn };
  }

  const sourceColumn = board.columns[sourceColumnIndex];
  const card = sourceColumn.cards.find((item) => item.id === cardId);
  if (!card) {
    return { ok: false, reason: ErrorReasons.CardNotFound };
  }

  if (sourceColumn.id === "DONE" && targetColumnId !== "DONE") {
    return { ok: false, reason: ErrorReasons.CardsInDoneCannotBeMoved };
  }

  if (sourceColumn.id === targetColumnId) {
    return { ok: true, board };
  }

  const isAdjacent = Math.abs(sourceColumnIndex - targetIndex) === 1;
  if (!isAdjacent) {
    return {
      ok: false,
      reason: ErrorReasons.CardsCanOnlyMoveToAdjacentColumns,
    };
  }

  const targetColumn = board.columns[targetIndex];
  const isMovingIntoDoing = targetColumn.id === "DOING";
  if (
    isMovingIntoDoing &&
    !targetColumn.cards.some((c) => c.id === cardId) &&
    targetColumn.cards.length >= 2
  ) {
    return { ok: false, reason: ErrorReasons.DoingColumnCanOnlyContain2Cards };
  }

  const updatedColumns = board.columns.map((column, index) => {
    //move the card from the source column to the target column
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

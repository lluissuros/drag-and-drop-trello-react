import { describe, expect, it } from "vitest";
import { moveCard, ErrorReasons } from "../../domain/services/moveCard";
import {
  COLUMN_LABELS,
  COLUMN_ORDER,
  ColumnId,
} from "../../domain/types/Column";
import { Card } from "../../domain/types/Card";

const createBoard = () => ({
  columns: COLUMN_ORDER.map((id) => ({
    id,
    title: COLUMN_LABELS[id],
    cards: [] as Card[],
  })),
});

const createBoardWithCard = (columnId: ColumnId, cardId = "card-1") => {
  const board = createBoard();
  const column = board.columns.find((col) => col.id === columnId);
  if (!column) throw new Error("Column not found in test setup");
  column.cards.push({ id: cardId, text: `Card in ${columnId}` });
  return board;
};

describe("moveCard domain rules", () => {
  it("moves a card to an adjacent forward column", () => {
    const board = createBoardWithCard("BACKLOG");
    const result = moveCard(board, "card-1", "TODO");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.board.columns.find((col) => col.id === "TODO")?.cards
    ).toHaveLength(1);
    expect(
      result.board.columns.find((col) => col.id === "BACKLOG")?.cards
    ).toHaveLength(0);
  });

  it("blocks jumps over columns", () => {
    const board = createBoardWithCard("BACKLOG");
    const result = moveCard(board, "card-1", "DOING");

    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.CardsCanOnlyMoveToAdjacentColumns,
    });
  });

  it("limits DOING to two cards", () => {
    const board = createBoard();
    const doing = board.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column");
    doing.cards.push({ id: "c1", text: "First" }, { id: "c2", text: "Second" });
    const todo = board.columns.find((col) => col.id === "TODO");
    if (!todo) throw new Error("Missing TODO column");
    todo.cards.push({ id: "c3", text: "Third" });

    const result = moveCard(board, "c3", "DOING");
    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.DoingColumnCanOnlyContain2Cards,
    });
  });

  it("allows moving from TODO to DOING and DOING to DONE", () => {
    const board = createBoardWithCard("TODO");
    const intoDoing = moveCard(board, "card-1", "DOING");

    expect(intoDoing.ok).toBe(true);
    if (!intoDoing.ok) return;

    const intoDone = moveCard(intoDoing.board, "card-1", "DONE");
    expect(intoDone.ok).toBe(true);
    if (!intoDone.ok) return;
    expect(
      intoDone.board.columns.find((col) => col.id === "DONE")?.cards[0].id
    ).toBe("card-1");
  });

  it("blocks moving out of DONE", () => {
    const board = createBoardWithCard("DONE");
    const result = moveCard(board, "card-1", "DOING");
    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.CardsInDoneCannotBeMoved,
    });
  });

  it("does nothing when target column matches source", () => {
    const board = createBoardWithCard("TODO");
    const result = moveCard(board, "card-1", "TODO");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.board).toBe(board);
  });

  it("validates target column ids", () => {
    const board = createBoardWithCard("BACKLOG");
    const result = moveCard(board, "card-1", "UNKNOWN" as ColumnId);
    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.InvalidTargetColumn,
    });
  });
});

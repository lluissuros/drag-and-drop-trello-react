import { describe, expect, it } from "vitest";
import { addTask } from "../../lib/services/addTask";
import { COLUMN_LABELS, COLUMN_ORDER, ColumnId } from "../../lib/types/Column";
import { Card } from "../../lib/types/Card";

const createBoard = () => ({
  columns: COLUMN_ORDER.map((id) => ({
    id,
    title: COLUMN_LABELS[id],
    cards: [] as Card[],
  })),
});

describe("addTask", () => {
  it("successfully adds a card to a column", () => {
    const board = createBoard();
    const result = addTask(board, "TODO", "New card text");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const todoColumn = result.board.columns.find((col) => col.id === "TODO");
    expect(todoColumn).toBeDefined();
    expect(todoColumn?.cards).toHaveLength(1);
    expect(todoColumn?.cards[0].text).toBe("New card text");
    expect(todoColumn?.cards[0].id).toBeDefined();
    expect(typeof todoColumn?.cards[0].id).toBe("string");
  });

  it("adds card with a unique UUID", () => {
    const board = createBoard();
    const result1 = addTask(board, "TODO", "First card");
    const result2 = addTask(board, "TODO", "Second card");

    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    if (!result1.ok || !result2.ok) return;

    const card1Id = result1.board.columns.find((col) => col.id === "TODO")
      ?.cards[0].id;
    const card2Id = result2.board.columns.find((col) => col.id === "TODO")
      ?.cards[0].id;

    expect(card1Id).toBeDefined();
    expect(card2Id).toBeDefined();
    expect(card1Id).not.toBe(card2Id);
  });

  it("adds multiple cards to the same column", () => {
    const board = createBoard();
    const result1 = addTask(board, "BACKLOG", "First card");
    expect(result1.ok).toBe(true);
    if (!result1.ok) return;

    const result2 = addTask(result1.board, "BACKLOG", "Second card");
    expect(result2.ok).toBe(true);
    if (!result2.ok) return;

    const backlogColumn = result2.board.columns.find(
      (col) => col.id === "BACKLOG"
    );
    expect(backlogColumn?.cards).toHaveLength(2);
    expect(backlogColumn?.cards[0].text).toBe("First card");
    expect(backlogColumn?.cards[1].text).toBe("Second card");
  });

  it("can add cards to different columns", () => {
    const board = createBoard();
    const result1 = addTask(board, "BACKLOG", "Backlog card");
    expect(result1.ok).toBe(true);
    if (!result1.ok) return;

    const result2 = addTask(result1.board, "DONE", "Done card");
    expect(result2.ok).toBe(true);
    if (!result2.ok) return;

    const backlogColumn = result2.board.columns.find(
      (col) => col.id === "BACKLOG"
    );
    const doneColumn = result2.board.columns.find((col) => col.id === "DONE");

    expect(backlogColumn?.cards).toHaveLength(1);
    expect(backlogColumn?.cards[0].text).toBe("Backlog card");
    expect(doneColumn?.cards).toHaveLength(1);
    expect(doneColumn?.cards[0].text).toBe("Done card");
  });

  it("preserves existing cards in the column", () => {
    const board = createBoard();
    const backlogColumn = board.columns.find((col) => col.id === "BACKLOG");
    if (!backlogColumn) throw new Error("Missing BACKLOG column");
    backlogColumn.cards.push({ id: "existing-1", text: "Existing card" });

    const result = addTask(board, "BACKLOG", "New card");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const updatedColumn = result.board.columns.find(
      (col) => col.id === "BACKLOG"
    );
    expect(updatedColumn?.cards).toHaveLength(2);
    expect(updatedColumn?.cards[0].text).toBe("Existing card");
    expect(updatedColumn?.cards[1].text).toBe("New card");
  });

  it("does not modify other columns", () => {
    const board = createBoard();
    const todoColumn = board.columns.find((col) => col.id === "TODO");
    if (!todoColumn) throw new Error("Missing TODO column");
    todoColumn.cards.push({ id: "todo-1", text: "Todo card" });

    const result = addTask(board, "BACKLOG", "Backlog card");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const updatedTodoColumn = result.board.columns.find(
      (col) => col.id === "TODO"
    );
    expect(updatedTodoColumn?.cards).toHaveLength(1);
    expect(updatedTodoColumn?.cards[0].text).toBe("Todo card");
  });

  it("trims leading and trailing whitespace from card text", () => {
    const board = createBoard();
    const result = addTask(board, "DOING", "  Trimmed text  ");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const doingColumn = result.board.columns.find((col) => col.id === "DOING");
    expect(doingColumn?.cards[0].text).toBe("Trimmed text");
  });

  it("returns error when card text is empty", () => {
    const board = createBoard();
    const result = addTask(board, "TODO", "");

    expect(result).toEqual({
      ok: false,
      reason: "Card text cannot be empty",
    });
  });

  it("returns error when card text is only whitespace", () => {
    const board = createBoard();
    const result = addTask(board, "TODO", "   ");

    expect(result).toEqual({
      ok: false,
      reason: "Card text cannot be empty",
    });
  });

  it("returns error when column is not found", () => {
    const board = createBoard();
    const result = addTask(board, "UNKNOWN" as ColumnId, "Some text");

    expect(result).toEqual({
      ok: false,
      reason: "Column not found",
    });
  });

  it("returns a new board object (immutability)", () => {
    const board = createBoard();
    const result = addTask(board, "TODO", "New card");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.board).not.toBe(board);
    expect(result.board.columns).not.toBe(board.columns);
  });

  it("preserves column structure and other properties", () => {
    const board = createBoard();
    const result = addTask(board, "TODO", "New card");

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    result.board.columns.forEach((column, index) => {
      expect(column.id).toBe(COLUMN_ORDER[index]);
      expect(column.title).toBe(COLUMN_LABELS[column.id]);
      expect(Array.isArray(column.cards)).toBe(true);
    });
  });
});

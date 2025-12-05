import { describe, expect, it } from "vitest";
import { validateBoard } from "../../lib/validators";
import {
  Column,
  COLUMN_LABELS,
  COLUMN_ORDER,
  ColumnId,
} from "../../lib/types/Column";
import { Task } from "../../lib/types/Task";

const createBoard = () => ({
  columns: COLUMN_ORDER.map((id) => ({
    id,
    title: COLUMN_LABELS[id],
    tasks: [] as Task[],
  })),
});

describe("validateBoard", () => {
  it("validates a correct board", () => {
    const board = createBoard();
    const result = validateBoard(board);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.board).toEqual(board);
  });

  it("validates a board with tasks", () => {
    const board = createBoard();
    board.columns[0].tasks.push({ id: "card-1", text: "Test card" });
    board.columns[1].tasks.push({ id: "card-2", text: "Another card" });

    const result = validateBoard(board);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.board.columns[0].tasks).toHaveLength(1);
    expect(result.board.columns[1].tasks).toHaveLength(1);
  });

  it("rejects board with missing columns", () => {
    const board = createBoard();
    board.columns.pop();

    const result = validateBoard(board);

    expect(result).toEqual({
      ok: false,
      reason: "Board must contain all columns",
    });
  });

  it("rejects board with extra columns", () => {
    const board = createBoard();
    board.columns.push({
      id: "BACKLOG",
      title: "Duplicate",
      tasks: [],
    });

    const result = validateBoard(board);

    expect(result).toEqual({
      ok: false,
      reason: "Board must contain all columns",
    });
  });

  it("rejects board with wrong column order", () => {
    const board = createBoard();
    // Swap first two columns
    [board.columns[0], board.columns[1]] = [board.columns[1], board.columns[0]];

    const result = validateBoard(board);

    expect(result).toEqual({
      ok: false,
      reason: "Column order mismatch at position 0",
    });
  });

  it("rejects board with invalid column id", () => {
    const board = createBoard();
    board.columns[0].id = "INVALID" as ColumnId;

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects board with duplicate card ids", () => {
    const board = createBoard();
    board.columns[0].tasks.push({ id: "duplicate-id", text: "Card 1" });
    board.columns[1].tasks.push({ id: "duplicate-id", text: "Card 2" });

    const result = validateBoard(board);

    expect(result).toEqual({
      ok: false,
      reason: "Duplicate task id found",
    });
  });

  it("rejects board with duplicate card ids in same column", () => {
    const board = createBoard();
    board.columns[0].tasks.push(
      { id: "duplicate-id", text: "Card 1" },
      { id: "duplicate-id", text: "Card 2" }
    );

    const result = validateBoard(board);

    expect(result).toEqual({
      ok: false,
      reason: "Duplicate task id found",
    });
  });

  it("rejects board with invalid card structure - missing id", () => {
    const board = createBoard();
    board.columns[0].tasks.push({ text: "Card without id" } as Task);

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects board with invalid card structure - missing text", () => {
    const board = createBoard();
    board.columns[0].tasks.push({ id: "card-1" } as Task);

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects board with invalid column structure - missing id", () => {
    const board = createBoard();
    delete (board.columns[0] as Partial<Column>).id;

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects board with invalid column structure - missing title", () => {
    const board = createBoard();
    delete (board.columns[0] as Partial<Column>).title;

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects board with invalid column structure - missing tasks", () => {
    const board = createBoard();
    delete (board.columns[0] as Partial<Column>).tasks;

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects non-object input", () => {
    const result = validateBoard("not an object");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects null input", () => {
    const result = validateBoard(null);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects undefined input", () => {
    const result = validateBoard(undefined);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects input without columns property", () => {
    const result = validateBoard({});

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects input where columns is not an array", () => {
    const result = validateBoard({ columns: "not an array" });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects input with empty columns array", () => {
    const result = validateBoard({ columns: [] });

    expect(result).toEqual({
      ok: false,
      reason: "Board must contain all columns",
    });
  });

  it("rejects card with wrong type for id", () => {
    const board = createBoard();
    board.columns[0].tasks.push({
      id: 123,
      text: "Card",
    } as unknown as Task);

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects card with wrong type for text", () => {
    const board = createBoard();
    board.columns[0].tasks.push({ id: "card-1", text: 123 } as unknown as Task);

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects column with wrong type for title", () => {
    const board = createBoard();
    board.columns[0].title = 123 as unknown as string;

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });

  it("rejects column with tasks not being an array", () => {
    const board = createBoard();
    board.columns[0].tasks = "not an array" as unknown as Task[];

    const result = validateBoard(board);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBeTruthy();
  });
});

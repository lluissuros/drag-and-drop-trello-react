import { describe, expect, it } from "vitest";
import { moveTask, ErrorReasons } from "../../lib/services/moveTask";
import { COLUMN_LABELS, COLUMN_ORDER, ColumnId } from "../../lib/types/Column";
import { Task } from "@/lib/types/Task";

const createBoard = () => ({
  columns: COLUMN_ORDER.map((id) => ({
    id,
    title: COLUMN_LABELS[id],
    tasks: [] as Task[],
  })),
});

const createBoardWithCard = (columnId: ColumnId, cardId = "card-1") => {
  const board = createBoard();
  const column = board.columns.find((col) => col.id === columnId);
  if (!column) throw new Error("Column not found in test setup");
  column.tasks.push({ id: cardId, text: `Card in ${columnId}` });
  return board;
};

describe("moveTask domain rules", () => {
  it("moves a card to an adjacent forward column", () => {
    const board = createBoardWithCard("BACKLOG");
    const result = moveTask(board, "card-1", "TODO");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(
      result.board.columns.find((col) => col.id === "TODO")?.tasks
    ).toHaveLength(1);
    expect(
      result.board.columns.find((col) => col.id === "BACKLOG")?.tasks
    ).toHaveLength(0);
  });

  it("blocks jumps over columns", () => {
    const board = createBoardWithCard("BACKLOG");
    const result = moveTask(board, "card-1", "DOING");

    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.TasksCanOnlyMoveToAdjacentColumns,
    });
  });

  it("limits DOING to two tasks", () => {
    const board = createBoard();
    const doing = board.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column");
    doing.tasks.push({ id: "c1", text: "First" }, { id: "c2", text: "Second" });
    const todo = board.columns.find((col) => col.id === "TODO");
    if (!todo) throw new Error("Missing TODO column");
    todo.tasks.push({ id: "c3", text: "Third" });

    const result = moveTask(board, "c3", "DOING");
    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.DoingColumnCanOnlyContain2tasks,
    });
  });

  it("allows moving from TODO to DOING and DOING to DONE", () => {
    const board = createBoardWithCard("TODO");
    const intoDoing = moveTask(board, "card-1", "DOING");

    expect(intoDoing.ok).toBe(true);
    if (!intoDoing.ok) return;

    const intoDone = moveTask(intoDoing.board, "card-1", "DONE");
    expect(intoDone.ok).toBe(true);
    if (!intoDone.ok) return;
    expect(
      intoDone.board.columns.find((col) => col.id === "DONE")?.tasks[0].id
    ).toBe("card-1");
  });

  it("blocks moving out of DONE", () => {
    const board = createBoardWithCard("DONE");
    const result = moveTask(board, "card-1", "DOING");
    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.TasksInDoneCannotBeMoved,
    });
  });

  it("does nothing when target column matches source", () => {
    const board = createBoardWithCard("TODO");
    const result = moveTask(board, "card-1", "TODO");

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.board).toBe(board);
  });

  it("validates target column ids", () => {
    const board = createBoardWithCard("BACKLOG");
    const result = moveTask(board, "card-1", "UNKNOWN" as ColumnId);
    expect(result).toEqual({
      ok: false,
      reason: ErrorReasons.InvalidTargetColumn,
    });
  });
});

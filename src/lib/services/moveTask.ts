import { Board } from "../types/Board";
import { COLUMN_ORDER, ColumnId } from "../types/Column";

export const ErrorReasons = {
  TaskNotFound: "task not found",
  InvalidTargetColumn: "Invalid target column",
  TasksInDoneCannotBeMoved: "tasks in DONE cannot be moved",
  TasksCanOnlyMoveToAdjacentColumns: "tasks can only move to adjacent columns",
  DoingColumnCanOnlyContain2tasks: "DOING column can only contain 2 tasks",
} as const;

export type ErrorReason = (typeof ErrorReasons)[keyof typeof ErrorReasons];

export type moveTaskResult =
  | { ok: true; board: Board }
  | { ok: false; reason: ErrorReason };

/**
 * Moves a task from one column to another.
 * @param board - The board to move the task on.
 * @param taskId - The id of the task to move.
 * @param targetColumnId - The id of the column to move the task to.
 * @returns A result object with the updated board if the move was successful, or an error reason if it was not.
 */
export const moveTask = (
  board: Board,
  taskId: string,
  targetColumnId: ColumnId
): moveTaskResult => {
  const sourceColumnIndex = board.columns.findIndex((column) =>
    column.tasks.some((task) => task.id === taskId)
  );
  if (sourceColumnIndex === -1) {
    return { ok: false, reason: ErrorReasons.TaskNotFound };
  }

  const targetIndex = COLUMN_ORDER.indexOf(targetColumnId);
  if (targetIndex === -1) {
    return { ok: false, reason: ErrorReasons.InvalidTargetColumn };
  }

  const sourceColumn = board.columns[sourceColumnIndex];
  const task = sourceColumn.tasks.find((item) => item.id === taskId);
  if (!task) {
    return { ok: false, reason: ErrorReasons.TaskNotFound };
  }

  if (sourceColumn.id === "DONE" && targetColumnId !== "DONE") {
    return { ok: false, reason: ErrorReasons.TasksInDoneCannotBeMoved };
  }

  if (sourceColumn.id === targetColumnId) {
    return { ok: true, board };
  }

  const isAdjacent = Math.abs(sourceColumnIndex - targetIndex) === 1;
  if (!isAdjacent) {
    return {
      ok: false,
      reason: ErrorReasons.TasksCanOnlyMoveToAdjacentColumns,
    };
  }

  const targetColumn = board.columns[targetIndex];
  const isMovingIntoDoing = targetColumn.id === "DOING";
  if (
    isMovingIntoDoing &&
    !targetColumn.tasks.some((c) => c.id === taskId) &&
    targetColumn.tasks.length >= 2
  ) {
    return { ok: false, reason: ErrorReasons.DoingColumnCanOnlyContain2tasks };
  }

  const updatedColumns = board.columns.map((column, index) => {
    //move the task from the source column to the target column
    if (index === sourceColumnIndex) {
      return {
        ...column,
        tasks: column.tasks.filter((item) => item.id !== taskId),
      };
    }

    if (index === targetIndex) {
      return { ...column, tasks: [...column.tasks, task] };
    }

    return column;
  });

  return { ok: true, board: { columns: updatedColumns } };
};

import { Task } from "./Task";

export type ColumnId = "BACKLOG" | "TODO" | "DOING" | "DONE";

export const COLUMN_ORDER: ColumnId[] = ["BACKLOG", "TODO", "DOING", "DONE"];

export const COLUMN_LABELS: Record<ColumnId, string> = {
  BACKLOG: "BACKLOG",
  TODO: "TODO",
  DOING: "DOING",
  DONE: "DONE",
};

export interface Column {
  id: ColumnId;
  title: string;
  tasks: Task[];
}

import {
  type ReactNode,
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";
import type { Board } from "../lib/types/Board";
import type { ColumnId } from "../lib/types/Column";
import {
  addTask as addTaskDomain,
  type addTaskResult,
} from "../lib/services/addTask";
import { createBoard } from "../lib/services/createBoard";
import {
  moveTask as moveTaskDomain,
  type moveTaskResult,
} from "../lib/services/moveTask";
import { BoardRepository } from "../infra/storage/BoardRepository";

interface BoardContextValue {
  board: Board;
  moveTask: (taskId: string, targetColumnId: ColumnId) => moveTaskResult;
  addTask: (columnId: ColumnId, text: string) => addTaskResult;
}

// undefined forces consumers to use the provider.`
// eslint-disable-next-line react-refresh/only-export-components
export const BoardContext = createContext<BoardContextValue | undefined>(
  undefined
);

/**
 * Provides the board context to the app.
 * Initializes the board from the repository or creates a new one if none is found.
 * creates the functions to move and add tasks.
 * Persists the board to the repository.
 *
 * @param children - The children to render.
 * @returns The board context value.
 */
export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>(
    () => BoardRepository.load() ?? createBoard()
  );

  const moveTask = useCallback(
    (taskId: string, targetColumnId: ColumnId) => {
      const result = moveTaskDomain(board, taskId, targetColumnId);
      if (result.ok) {
        setBoard(result.board);
        BoardRepository.save(result.board);
      }
      return result;
    },
    [board]
  );

  const addTask = useCallback(
    (columnId: ColumnId, text: string) => {
      const result = addTaskDomain(board, columnId, text);
      if (result.ok) {
        setBoard(result.board);
        BoardRepository.save(result.board);
      }
      return result;
    },
    [board]
  );

  const value = useMemo(
    () => ({
      board,
      moveTask,
      addTask,
    }),
    [board, moveTask, addTask]
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};

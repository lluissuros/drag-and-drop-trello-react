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
  addCard as addCardDomain,
  type AddCardResult,
} from "../lib/services/addCard";
import { createBoard } from "../lib/services/createBoard";
import {
  moveCard as moveCardDomain,
  type MoveCardResult,
} from "../lib/services/moveCard";
import { BoardRepository } from "../infra/storage/BoardRepository";

interface BoardContextValue {
  board: Board;
  moveCard: (cardId: string, targetColumnId: ColumnId) => MoveCardResult;
  addCard: (columnId: ColumnId, text: string) => AddCardResult;
}

// undefined forces consumers to use the provider.`
// eslint-disable-next-line react-refresh/only-export-components
export const BoardContext = createContext<BoardContextValue | undefined>(
  undefined
);

/**
 * Provides the board context to the app.
 * Initializes the board from the repository or creates a new one if none is found.
 * creates the functions to move and add cards.
 * Persists the board to the repository.
 *
 * @param children - The children to render.
 * @returns The board context value.
 */
export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [board, setBoard] = useState<Board>(
    () => BoardRepository.load() ?? createBoard()
  );

  const moveCard = useCallback(
    (cardId: string, targetColumnId: ColumnId) => {
      const result = moveCardDomain(board, cardId, targetColumnId);
      if (result.ok) {
        setBoard(result.board);
        BoardRepository.save(result.board);
      }
      return result;
    },
    [board]
  );

  const addCard = useCallback(
    (columnId: ColumnId, text: string) => {
      const result = addCardDomain(board, columnId, text);
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
      moveCard,
      addCard,
    }),
    [board, moveCard, addCard]
  );

  return (
    <BoardContext.Provider value={value}>{children}</BoardContext.Provider>
  );
};

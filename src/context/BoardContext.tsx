import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Board } from "../domain/types/Board";
import { ColumnId } from "../domain/types/Column";
import {
  addCard as addCardDomain,
  AddCardResult,
} from "../domain/services/addCard";
import { createBoard } from "../domain/services/createBoard";
import {
  moveCard as moveCardDomain,
  MoveCardResult,
} from "../domain/services/moveCard";
import { BoardRepository } from "../infra/storage/BoardRepository";

interface BoardContextValue {
  board: Board;
  moveCard: (cardId: string, targetColumnId: ColumnId) => MoveCardResult;
  addCard: (columnId: ColumnId, text: string) => AddCardResult;
}

const BoardContext = createContext<BoardContextValue | undefined>(undefined);

export const BoardProvider = ({
  children,
  initialBoard,
}: {
  children: ReactNode;
  initialBoard?: Board;
}) => {
  const [board, setBoard] = useState<Board>(
    () => initialBoard ?? BoardRepository.load() ?? createBoard()
  );

  useEffect(() => {
    if (initialBoard) return;
    const stored = BoardRepository.load();
    if (stored) {
      setBoard(stored);
    }
  }, [initialBoard]);

  const persist = useCallback((nextBoard: Board) => {
    setBoard(nextBoard);
    BoardRepository.save(nextBoard);
  }, []);

  const moveCard = useCallback(
    (cardId: string, targetColumnId: ColumnId) => {
      const result = moveCardDomain(board, cardId, targetColumnId);
      if (result.ok) {
        persist(result.board);
      }
      return result;
    },
    [board, persist]
  );

  const addCard = useCallback(
    (columnId: ColumnId, text: string) => {
      const result = addCardDomain(board, columnId, text);
      if (result.ok) {
        persist(result.board);
      }
      return result;
    },
    [board, persist]
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

export const useBoardContext = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error("useBoardContext must be used within BoardProvider");
  }
  return ctx;
};

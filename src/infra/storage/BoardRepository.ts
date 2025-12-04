import { Board } from "../../lib/types/Board";
import { validateBoard } from "../../lib/validators";

const STORAGE_KEY = "tasks-board";

interface BoardRepository {
  load(): Board | null;
  save(board: Board): void;
}

export const BoardRepository: BoardRepository = {
  load(): Board | null {
    if (typeof localStorage === "undefined") return null;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      const validation = validateBoard(parsed);
      return validation.ok ? validation.board : null;
    } catch {
      return null;
    }
  },

  save(board: Board): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
  },
};

import { useContext } from "react";
import { BoardContext } from "../contexts/BoardContext";

// export const useBoard = () => useBoardContext();

export const useBoard = () => {
  const ctx = useContext(BoardContext);
  if (!ctx) {
    throw new Error("useBoardContext must be used within BoardProvider");
  }
  return ctx;
};

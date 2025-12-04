import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App";
import { BoardProvider } from "./contexts/BoardContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BoardProvider>
      <App />
    </BoardProvider>
  </StrictMode>
);

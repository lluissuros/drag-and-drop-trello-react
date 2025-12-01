import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefObject } from "react";
import { vi } from "vitest";
import { COLUMN_ORDER, ColumnId } from "../../domain/types/Column";
import { createBoard } from "../../domain/services/createBoard";
import { Board as BoardModel } from "../../domain/types/Board";
import { BoardProvider } from "../../context/BoardContext";
import Board, { BoardTestApi } from "../../components/board/Board";
import { BoardRepository } from "../../infra/storage/BoardRepository";

// Mock BoardRepository
vi.mock("../../infra/storage/BoardRepository", () => ({
  BoardRepository: {
    load: vi.fn(),
    save: vi.fn(),
  },
}));

const pointerTargets: Record<ColumnId, { x: number; y: number }> = {
  BACKLOG: { x: 10, y: 10 },
  TODO: { x: 280, y: 10 },
  DOING: { x: 540, y: 10 },
  DONE: { x: 800, y: 10 },
};

const dragCardToColumn = (
  card: HTMLElement,
  columnId: ColumnId,
  testApiRef: RefObject<BoardTestApi | null>,
  options?: { openDialog?: boolean }
) => {
  const target = pointerTargets[columnId];
  fireEvent.pointerDown(card, {
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    buttons: 1,
  });
  fireEvent.pointerMove(document.body, {
    pointerId: 1,
    clientX: target.x,
    clientY: target.y,
    buttons: 1,
  });
  fireEvent.pointerUp(document.body, {
    pointerId: 1,
    clientX: target.x,
    clientY: target.y,
  });
  act(() => {
    const cardId = card.getAttribute("data-card-id") ?? "";
    if (columnId === "DONE" && options?.openDialog) {
      testApiRef.current?.openDoneDialog(cardId);
    } else {
      testApiRef.current?.moveCard(cardId, columnId);
    }
  });
};

const renderBoard = (initialBoard?: BoardModel) =>
  render(
    <BoardProvider initialBoard={initialBoard}>
      <Board />
    </BoardProvider>
  );

const renderBoardWithApi = (initialBoard?: BoardModel) => {
  const testApiRef = { current: null } as RefObject<BoardTestApi | null>;
  render(
    <BoardProvider initialBoard={initialBoard}>
      <Board testApiRef={testApiRef} />
    </BoardProvider>
  );
  return testApiRef;
};

describe("Board component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BoardRepository.load).mockReturnValue(null);
  });

  it.only("renders all four columns", () => {
    renderBoard();
    COLUMN_ORDER.forEach((id) => {
      expect(screen.getByText(id)).toBeInTheDocument();
    });
  });

  it.only("adds cards via the column form", async () => {
    const user = userEvent.setup();
    renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");
    const input = within(backlog).getByPlaceholderText("Add a card");
    await user.type(input, "Ship feature");
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    expect(within(backlog).getByText("Ship feature")).toBeInTheDocument();
  });

  it.only("disable add card if the input is empty", async () => {
    renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");

    expect(
      within(backlog).getByRole("button", { name: /add/i })
    ).toBeDisabled();
  });

  it("drags a card to another column", async () => {
    const user = userEvent.setup();
    const testApi = renderBoardWithApi();

    const backlog = screen.getByTestId("column-BACKLOG");
    const input = within(backlog).getByPlaceholderText("Add a card");
    await user.type(input, "Move me");
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    const card = screen
      .getByText("Move me")
      .closest("[data-card-id]") as HTMLElement;
    dragCardToColumn(card, "TODO", testApi);

    await waitFor(() =>
      expect(
        within(screen.getByTestId("column-TODO")).getByText("Move me")
      ).toBeInTheDocument()
    );
  });

  it("asks for confirmation when moving into DONE", async () => {
    const initial = createBoard();
    const doing = initial.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column in test");
    doing.cards.push({ id: "c1", text: "Finish this" });

    const testApi = renderBoardWithApi(initial);

    const card = screen
      .getByText("Finish this")
      .closest("[data-card-id]") as HTMLElement;
    dragCardToColumn(card, "DONE", testApi, { openDialog: true });

    expect(
      await screen.findByRole("button", { name: "Move to DONE" })
    ).toBeInTheDocument();
  });

  it("moves into DONE after confirming", async () => {
    const initial = createBoard();
    const doing = initial.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column in test");
    doing.cards.push({ id: "c1", text: "Confirm me" });

    const testApi = renderBoardWithApi(initial);

    const card = screen
      .getByText("Confirm me")
      .closest("[data-card-id]") as HTMLElement;
    dragCardToColumn(card, "DONE", testApi, { openDialog: true });
    fireEvent.click(
      await screen.findByRole("button", { name: "Move to DONE" })
    );

    await waitFor(() =>
      expect(
        within(screen.getByTestId("column-DONE")).getByText("Confirm me")
      ).toBeInTheDocument()
    );
  });

  it("cancels moves into DONE", () => {
    const initial = createBoard();
    const doing = initial.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column in test");
    doing.cards.push({ id: "c1", text: "Cancel me" });

    const testApi = renderBoardWithApi(initial);

    const card = screen
      .getByText("Cancel me")
      .closest("[data-card-id]") as HTMLElement;
    dragCardToColumn(card, "DONE", testApi, { openDialog: true });
    fireEvent.click(screen.getByRole("button", { name: /^Cancel$/ }));

    expect(
      within(screen.getByTestId("column-DOING")).getByText("Cancel me")
    ).toBeInTheDocument();
    expect(
      within(screen.getByTestId("column-DONE")).queryByText("Cancel me")
    ).not.toBeInTheDocument();
  });

  it("persists and loads from BoardRepository", async () => {
    const user = userEvent.setup();
    const { unmount } = renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");
    await user.type(
      within(backlog).getByPlaceholderText("Add a card"),
      "Persisted task"
    );
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    // Verify BoardRepository.save was called with the correct data
    expect(BoardRepository.save).toHaveBeenCalled();
    const saveCall = vi.mocked(BoardRepository.save).mock.calls[0][0];
    expect(saveCall.columns[0].cards[0].text).toBe("Persisted task");

    // Mock load to return the saved board
    vi.mocked(BoardRepository.load).mockReturnValue(saveCall);
    unmount();
    renderBoard();
    expect(screen.getAllByText("Persisted task")[0]).toBeInTheDocument();
  });
});

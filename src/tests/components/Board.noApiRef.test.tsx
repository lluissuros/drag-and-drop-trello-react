import {
  act,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { COLUMN_ORDER, ColumnId } from "../../lib/types/Column";
import { createBoard } from "../../lib/services/createBoard";
import { Board as BoardModel } from "../../lib/types/Board";
import { BoardProvider } from "../../contexts/BoardContext";
import Board from "../../components/board/Board";
import { BoardRepository } from "../../infra/storage/BoardRepository";

// Mock BoardRepository
vi.mock("../../infra/storage/BoardRepository", () => ({
  BoardRepository: {
    load: vi.fn(),
    save: vi.fn(),
  },
}));

/**
 * Drags a card to a target column using actual DOM positions.
 * This tests the real drag-and-drop system without using testApiRef.
 *
 * Note: Testing @dnd-kit drag-and-drop is challenging because it relies on
 * complex pointer event handling. This implementation attempts to simulate
 * the drag, but if it doesn't work reliably, consider that @dnd-kit may
 * require more sophisticated event simulation or manual testing.
 */
const dragCardToColumn = async (
  card: HTMLElement,
  targetColumnId: ColumnId
) => {
  // Get the actual column element from the DOM (the droppable area)
  const targetColumn = screen.getByTestId(`column-${targetColumnId}`);

  // Get positions for accurate drag simulation
  const cardRect = card.getBoundingClientRect();
  const targetRect = targetColumn.getBoundingClientRect();

  const cardX = cardRect.left + cardRect.width / 2;
  const cardY = cardRect.top + cardRect.height / 2;
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  // @dnd-kit PointerSensor event sequence
  // The listeners are on the card element (from useSortable)
  const pointerId = 1;

  // 1. Pointer down - starts the drag
  act(() => {
    fireEvent.pointerDown(card, {
      pointerId,
      clientX: cardX,
      clientY: cardY,
      button: 0,
      buttons: 1,
      bubbles: true,
      cancelable: true,
    });
  });

  // Small delay to let @dnd-kit process
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  // 2. Pointer move - activates drag (even with distance: 0)
  act(() => {
    fireEvent.pointerMove(document, {
      pointerId,
      clientX: cardX + 5,
      clientY: cardY + 5,
      button: 0,
      buttons: 1,
      bubbles: true,
      cancelable: true,
    });
  });

  // 3. Move over target - for collision detection
  act(() => {
    fireEvent.pointerMove(targetColumn, {
      pointerId,
      clientX: targetX,
      clientY: targetY,
      button: 0,
      buttons: 1,
      bubbles: true,
      cancelable: true,
    });
  });

  // 4. Pointer up - completes the drag
  act(() => {
    fireEvent.pointerUp(targetColumn, {
      pointerId,
      clientX: targetX,
      clientY: targetY,
      button: 0,
      buttons: 0,
      bubbles: true,
      cancelable: true,
    });
  });

  // Wait for React and @dnd-kit to process
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
  });
};

const renderBoard = (initialBoard?: BoardModel) =>
  render(
    <BoardProvider initialBoard={initialBoard}>
      <Board />
    </BoardProvider>
  );

describe("Board component - Real Drag and Drop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BoardRepository.load).mockReturnValue(null);
  });

  it("renders all four columns", () => {
    renderBoard();
    COLUMN_ORDER.forEach((id) => {
      expect(screen.getByText(id)).toBeInTheDocument();
    });
  });

  it("adds cards via the column form", async () => {
    const user = userEvent.setup();
    renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");
    const input = within(backlog).getByPlaceholderText("Add a card");
    await user.type(input, "Ship feature");
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    expect(within(backlog).getByText("Ship feature")).toBeInTheDocument();
  });

  it("disables add card if the input is empty", async () => {
    renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");

    expect(
      within(backlog).getByRole("button", { name: /add/i })
    ).toBeDisabled();
  });

  it("drags a card to another column using real drag-and-drop", async () => {
    const user = userEvent.setup();
    renderBoard();

    // Add a card to BACKLOG
    const backlog = screen.getByTestId("column-BACKLOG");
    const input = within(backlog).getByPlaceholderText("Add a card");
    await user.type(input, "Move me");
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    // Find the card element
    const card = screen
      .getByText("Move me")
      .closest("[data-card-id]") as HTMLElement;
    expect(card).toBeInTheDocument();

    // Drag the card to TODO column
    await dragCardToColumn(card, "TODO");

    // Verify the card moved to TODO
    await waitFor(() => {
      expect(
        within(screen.getByTestId("column-TODO")).getByText("Move me")
      ).toBeInTheDocument();
    });

    // Verify the card is no longer in BACKLOG
    expect(
      within(screen.getByTestId("column-BACKLOG")).queryByText("Move me")
    ).not.toBeInTheDocument();
  });

  it("asks for confirmation when moving into DONE via drag-and-drop", async () => {
    const user = userEvent.setup();
    const initial = createBoard();
    const doing = initial.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column in test");
    doing.cards.push({ id: "c1", text: "Finish this" });

    renderBoard(initial);

    const card = screen
      .getByText("Finish this")
      .closest("[data-card-id]") as HTMLElement;
    expect(card).toBeInTheDocument();

    // Drag to DONE - should trigger confirmation dialog
    await dragCardToColumn(card, "DONE");

    // Verify the confirmation dialog appears
    expect(
      await screen.findByRole("button", { name: "Move to DONE" })
    ).toBeInTheDocument();

    // Verify the card is still in DOING (not moved yet)
    expect(
      within(screen.getByTestId("column-DOING")).getByText("Finish this")
    ).toBeInTheDocument();
  });

  it("moves into DONE after confirming via drag-and-drop", async () => {
    const user = userEvent.setup();
    const initial = createBoard();
    const doing = initial.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column in test");
    doing.cards.push({ id: "c1", text: "Confirm me" });

    renderBoard(initial);

    const card = screen
      .getByText("Confirm me")
      .closest("[data-card-id]") as HTMLElement;

    // Drag to DONE
    await dragCardToColumn(card, "DONE");

    // Confirm the move
    const confirmButton = await screen.findByRole("button", {
      name: "Move to DONE",
    });
    await user.click(confirmButton);

    // Verify the card moved to DONE
    await waitFor(() => {
      expect(
        within(screen.getByTestId("column-DONE")).getByText("Confirm me")
      ).toBeInTheDocument();
    });

    // Verify the card is no longer in DOING
    expect(
      within(screen.getByTestId("column-DOING")).queryByText("Confirm me")
    ).not.toBeInTheDocument();
  });

  it("cancels moves into DONE via drag-and-drop", async () => {
    const user = userEvent.setup();
    const initial = createBoard();
    const doing = initial.columns.find((col) => col.id === "DOING");
    if (!doing) throw new Error("Missing DOING column in test");
    doing.cards.push({ id: "c1", text: "Cancel me" });

    renderBoard(initial);

    const card = screen
      .getByText("Cancel me")
      .closest("[data-card-id]") as HTMLElement;

    // Drag to DONE
    await dragCardToColumn(card, "DONE");

    // Cancel the move
    const cancelButton = await screen.findByRole("button", {
      name: /^Cancel$/,
    });
    await user.click(cancelButton);

    // Verify the card is still in DOING
    expect(
      within(screen.getByTestId("column-DOING")).getByText("Cancel me")
    ).toBeInTheDocument();

    // Verify the card is not in DONE
    expect(
      within(screen.getByTestId("column-DONE")).queryByText("Cancel me")
    ).not.toBeInTheDocument();
  });

  it("drags a card between multiple columns", async () => {
    const user = userEvent.setup();
    renderBoard();

    // Add a card to BACKLOG
    const backlog = screen.getByTestId("column-BACKLOG");
    const input = within(backlog).getByPlaceholderText("Add a card");
    await user.type(input, "Multi-move card");
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    const card = screen
      .getByText("Multi-move card")
      .closest("[data-card-id]") as HTMLElement;

    // Move from BACKLOG to TODO
    await dragCardToColumn(card, "TODO");
    await waitFor(() => {
      expect(
        within(screen.getByTestId("column-TODO")).getByText("Multi-move card")
      ).toBeInTheDocument();
    });

    // Get the card again (it's now in TODO)
    const cardInTodo = screen
      .getByText("Multi-move card")
      .closest("[data-card-id]") as HTMLElement;

    // Move from TODO to DOING
    await dragCardToColumn(cardInTodo, "DOING");
    await waitFor(() => {
      expect(
        within(screen.getByTestId("column-DOING")).getByText("Multi-move card")
      ).toBeInTheDocument();
    });
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

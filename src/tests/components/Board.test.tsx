import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { COLUMN_ORDER } from "../../lib/types/Column";
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

const renderBoard = () =>
  render(
    <BoardProvider>
      <Board />
    </BoardProvider>
  );

describe("Board component", () => {
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

  it("adds tasks via the column form", async () => {
    const user = userEvent.setup();
    renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");
    const input = within(backlog).getByPlaceholderText("Add a card");
    await user.type(input, "Ship feature");
    await user.click(within(backlog).getByRole("button", { name: /add/i }));

    expect(within(backlog).getByText("Ship feature")).toBeInTheDocument();
  });

  it("disable add card if the input is empty", async () => {
    renderBoard();

    const backlog = screen.getByTestId("column-BACKLOG");

    expect(
      within(backlog).getByRole("button", { name: /add/i })
    ).toBeDisabled();
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
    expect(saveCall.columns[0].tasks[0].text).toBe("Persisted task");

    // Mock load to return the saved board
    vi.mocked(BoardRepository.load).mockReturnValue(saveCall);
    unmount();
    renderBoard();
    expect(screen.getAllByText("Persisted task")[0]).toBeInTheDocument();
  });
});

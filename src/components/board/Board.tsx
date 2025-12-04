import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { RefObject, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card as CardModel } from "../../lib/types/Card";
import { COLUMN_ORDER, ColumnId } from "../../lib/types/Column";
import { useBoard } from "../../hooks/useBoard";
import ConfirmDoneDialog from "../dialogs/ConfirmDoneDialog";
import { Card, CardContent } from "../ui/card";
import Column from "./Column";

//TODO: review this
export type BoardTestApi = {
  moveCard: (cardId: string, columnId: ColumnId) => void;
};

const Board = ({
  testApiRef,
}: {
  testApiRef?: RefObject<BoardTestApi | null>;
}) => {
  const { board, moveCard, addCard } = useBoard();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [pendingDone, setPendingDone] = useState<{
    cardId: string;
    targetColumnId: ColumnId;
  } | null>(null);

  const findColumnByCardId = (cardId: string) =>
    board.columns.find((column) =>
      column.cards.some((card) => card.id === cardId)
    );

  const findCardById = (cardId: string): CardModel | undefined => {
    for (const column of board.columns) {
      const found = column.cards.find((card) => card.id === cardId);
      if (found) return found;
    }
    return undefined;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const resolveTargetColumn = (
    overId: string | number,
    data?: { columnId?: ColumnId }
  ): ColumnId | null => {
    if (data?.columnId) {
      return data.columnId;
    }
    const asString = String(overId);
    if (asString.startsWith("column-")) {
      return asString.replace("column-", "") as ColumnId;
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);

    if (!over) return;

    const activeId = String(active.id);
    const fromColumn = findColumnByCardId(activeId);
    if (!fromColumn) return;

    const overData = over.data.current as { columnId?: ColumnId } | undefined;
    const targetColumnId = resolveTargetColumn(over.id, overData);
    if (!targetColumnId) return;

    if (targetColumnId === "DONE" && fromColumn.id !== "DONE") {
      setPendingDone({ cardId: activeId, targetColumnId });
      return;
    }

    const result = moveCard(activeId, targetColumnId);
    if (!result.ok) {
      toast.error(result.reason);
    }
  };

  const handleDragCancel = () => {
    setActiveCardId(null);
  };

  const handleAddCard = (columnId: ColumnId, text: string) => {
    const result = addCard(columnId, text);
    if (!result.ok) {
      toast.error(result.reason);
    }
    return result.ok;
  };

  const confirmDoneMove = () => {
    if (!pendingDone) return;
    const result = moveCard(pendingDone.cardId, pendingDone.targetColumnId);
    if (!result.ok) {
      toast.error(result.reason);
    }
    setPendingDone(null);
  };

  const cancelDoneMove = () => {
    setPendingDone(null);
  };

  const activeCard = activeCardId ? findCardById(activeCardId) : undefined;

  useEffect(() => {
    //testApiRef is used for testing the board
    if (!testApiRef) return;
    testApiRef.current = {
      moveCard: (cardId: string, columnId: ColumnId) => {
        const result = moveCard(cardId, columnId);
        if (!result.ok) {
          toast.error(result.reason);
        }
      },
    };

    return () => {
      testApiRef.current = null;
    };
  }, [moveCard, testApiRef]);

  return (
    <div className="space-y-4">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-8">
          {COLUMN_ORDER.map((columnId) => {
            const column = board.columns.find((col) => col.id === columnId)!;
            return (
              <Column
                key={column.id}
                column={column}
                onAddCard={handleAddCard}
              />
            );
          })}
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card className="w-64 shadow-lg">
              <CardContent className="py-3 text-sm text-slate-800">
                {activeCard.text}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmDoneDialog
        open={Boolean(pendingDone)}
        onCancel={cancelDoneMove}
        onConfirm={confirmDoneMove}
      />
    </div>
  );
};

export default Board;

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { RefObject, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card as CardType } from "../../lib/types/Card";
import { ColumnId } from "../../lib/types/Column";
import { useBoard } from "../../hooks/useBoard";
import ConfirmDoneDialog, { PendingDone } from "../dialogs/ConfirmDoneDialog";
import { Card, CardContent } from "../ui/card";
import Column from "./Column";

//TODO: review this
export type BoardTestApi = {
  moveTask: (cardId: string, columnId: ColumnId) => void;
};

export default function Board({
  testApiRef,
}: {
  testApiRef?: RefObject<BoardTestApi | null>;
}) {
  const { board, moveTask } = useBoard();
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [pendingDone, setPendingDone] = useState<PendingDone | null>(null);

  const findCardById = (cardId: string): CardType | undefined => {
    for (const column of board.columns) {
      for (const card of column.cards) {
        if (card.id === cardId) return card;
      }
    }
  };

  const activeCard = activeCardId ? findCardById(activeCardId) : undefined;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCardId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCardId(null);
    if (!over) return; // the card is not over a column

    const activeCardId = String(active.id);
    const fromColumn = active.data.current as { columnId: ColumnId };
    const targetColumn = over.data.current as { columnId: ColumnId };
    const targetColumnId = targetColumn.columnId;

    if (targetColumnId === "DONE" && fromColumn.columnId !== "DONE") {
      setPendingDone({
        cardId: activeCardId,
        targetColumnId: targetColumnId,
      });
      return;
    }

    const result = moveTask(activeCardId, targetColumnId);
    if (!result.ok) {
      toast.error(result.reason);
    }
  };

  const handleDragCancel = () => {
    setActiveCardId(null);
  };

  useEffect(() => {
    //testApiRef is used for testing the board
    if (!testApiRef) return;
    testApiRef.current = {
      moveTask: (cardId: string, columnId: ColumnId) => {
        const result = moveTask(cardId, columnId);
        if (!result.ok) {
          toast.error(result.reason);
        }
      },
    };

    return () => {
      testApiRef.current = null;
    };
  }, [moveTask, testApiRef]);

  return (
    <div className="space-y-4">
      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-8">
          {board.columns.map((column) => {
            return <Column key={column.id} column={column} />;
          })}
        </div>

        <DragOverlay>
          {activeCard ? (
            <Card className="w-64 shadow-lg opacity-80 rotate-[15deg]">
              <CardContent className="py-3 text-sm text-slate-800">
                {activeCard.text}
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
      </DndContext>

      <ConfirmDoneDialog
        pendingDone={pendingDone}
        onClose={() => setPendingDone(null)}
      />
    </div>
  );
}

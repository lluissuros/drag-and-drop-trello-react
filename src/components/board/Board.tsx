import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import { RefObject, useEffect, useState } from "react";
import { toast } from "sonner";
import { Task as TaskType } from "../../lib/types/Task";
import { ColumnId } from "../../lib/types/Column";
import { useBoard } from "../../hooks/useBoard";
import ConfirmDoneDialog, { PendingDone } from "../dialogs/ConfirmDoneDialog";
import { Card, CardContent } from "../ui/card";
import Column from "./Column";
import { TaskDraggableData } from "./Task";

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
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [pendingDone, setPendingDone] = useState<PendingDone | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask((event.active.data.current?.task as TaskType) || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return; // the card is not over a column

    const activeCardId = String(active.id);
    const fromData = active.data.current as TaskDraggableData;
    const targetData = over.data.current as TaskDraggableData;
    const targetColumnId = targetData.columnId;

    if (targetColumnId === "DONE" && fromData.columnId !== "DONE") {
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
    setActiveTask(null);
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
          {activeTask ? (
            <Card className="w-64 shadow-lg opacity-80 rotate-[15deg]">
              <CardContent className="py-3 text-sm text-slate-800">
                {activeTask.text}
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

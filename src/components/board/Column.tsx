import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Column as ColumnModel } from "../../lib/types/Column";
import {
  Card as CardComponent,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Task from "./Task";
import { AddTaskForm } from "./AddTaskForm";

type ColumnProps = {
  column: ColumnModel;
};

const Column = ({ column }: ColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  return (
    <CardComponent
      data-column-id={column.id}
      className="flex w-72 flex-col border-slate-200 bg-white/80 shadow"
    >
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-center justify-between">
          <CardTitle>{column.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent
        ref={setNodeRef}
        data-testid={`column-${column.id}`}
        className="flex flex-1 flex-col p-4"
      >
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`flex-1 ${
              isOver ? "bg-slate-50/70 rounded-lg p-1" : ""
            }`}
          >
            {column.cards.map((card) => (
              <Task key={card.id} card={card} columnId={column.id} />
            ))}
          </div>
        </SortableContext>

        <AddTaskForm column={column} />
      </CardContent>
    </CardComponent>
  );
};

export default Column;

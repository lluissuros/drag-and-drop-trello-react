import { useSortable } from "@dnd-kit/sortable";
import { Task as TaskType } from "../../lib/types/Task";
import { ColumnId } from "../../lib/types/Column";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

type TaskProps = {
  task: TaskType;
  columnId: ColumnId;
};

export type TaskDraggableData = {
  columnId: ColumnId;
  task: TaskType;
};

const Task = ({ task, columnId }: TaskProps) => {
  //useSortable is used to handle the drag and drop of the card, is an abstraction over useDraggable
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: task.id,
    data: { columnId, task } as TaskDraggableData,
  });

  return (
    <Card
      ref={setNodeRef}
      data-card-id={task.id}
      className={cn(
        "mb-3 cursor-grab bg-white shadow-sm transition hover:shadow-md",
        isDragging && "opacity-20 shadow-lg ring-2 ring-slate-200"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="py-3 text-sm text-slate-800">
        {task.text}
      </CardContent>
    </Card>
  );
};

export default Task;

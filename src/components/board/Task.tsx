import { useSortable } from "@dnd-kit/sortable";
import { Card as CardType } from "../../lib/types/Card";
import { ColumnId } from "../../lib/types/Column";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

type TaskProps = {
  card: CardType;
  columnId: ColumnId;
};

const Task = ({ card, columnId }: TaskProps) => {
  //useSortable is used to handle the drag and drop of the card, is an abstraction over useDraggable
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({
    id: card.id,
    data: { columnId },
  });

  return (
    <Card
      ref={setNodeRef}
      data-card-id={card.id}
      className={cn(
        "mb-3 cursor-grab bg-white shadow-sm transition hover:shadow-md",
        isDragging && "opacity-20 shadow-lg ring-2 ring-slate-200"
      )}
      {...attributes}
      {...listeners}
    >
      <CardContent className="py-3 text-sm text-slate-800">
        {card.text}
      </CardContent>
    </Card>
  );
};

export default Task;

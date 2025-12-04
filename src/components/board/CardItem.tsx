import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card as CardModel } from "../../lib/types/Card";
import { ColumnId } from "../../lib/types/Column";
import { cn } from "../../lib/utils";
import { Card, CardContent } from "../ui/card";

type CardItemProps = {
  card: CardModel;
  columnId: ColumnId;
};

const CardItem = ({ card, columnId }: CardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      data-card-id={card.id}
      className={cn(
        "mb-3 cursor-grab bg-white shadow-sm transition hover:shadow-md",
        isDragging && "opacity-80 shadow-lg ring-2 ring-slate-200"
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

export default CardItem;

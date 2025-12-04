import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { FormEvent, useState } from "react";
import { Column as ColumnModel, ColumnId } from "../../lib/types/Column";
import {
  Card as CardComponent,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import CardItem from "./CardItem";

type ColumnProps = {
  column: ColumnModel;
  onAddCard: (columnId: ColumnId, text: string) => boolean;
};

const Column = ({ column, onAddCard }: ColumnProps) => {
  const [text, setText] = useState("");
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const added = onAddCard(column.id, text);
    if (added) {
      setText("");
    }
  };

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
              <CardItem key={card.id} card={card} columnId={column.id} />
            ))}
          </div>
        </SortableContext>

        <form onSubmit={handleSubmit} className="mt-auto flex gap-2 pt-2">
          <Input
            aria-label={`Add card to ${column.title}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a card"
          />
          <Button type="submit" disabled={!text.trim()}>
            Add
          </Button>
        </form>
      </CardContent>
    </CardComponent>
  );
};

export default Column;

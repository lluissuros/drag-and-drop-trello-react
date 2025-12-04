import { Column } from "@/lib/types/Column";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useBoard } from "@/hooks/useBoard";

export function AddTaskForm({ column }: { column: Column }) {
  const [text, setText] = useState("");
  const { addTask } = useBoard();

  //   const handleAddTask = (columnId: ColumnId, text: string) => {
  //     //TODO: maybe this could go in the Task itself
  //     const result = addTask(columnId, text);
  //     if (!result.ok) {
  //       toast.error(result.reason);
  //     }
  //     return result.ok;
  //   };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    // const added = onAddTask(columnId, text);

    const result = addTask(column.id, text);
    if (!result.ok) {
      toast.error(result.reason);
    }
    // return result.ok;

    setText("");
  };

  return (
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
  );
}

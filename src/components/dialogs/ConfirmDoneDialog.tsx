import { useBoard } from "@/hooks/useBoard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { ColumnId } from "@/lib/types/Column";
import { toast } from "sonner";

export type PendingDone = {
  cardId: string;
  targetColumnId: ColumnId;
};

type ConfirmDoneDialogProps = {
  pendingDone: PendingDone | null;
  onClose: () => void;
};

export default function ConfirmDoneDialog({
  pendingDone,
  onClose,
}: ConfirmDoneDialogProps) {
  const { moveTask } = useBoard();

  const handleConfirm = () => {
    if (!pendingDone) return;
    const result = moveTask(pendingDone.cardId, pendingDone.targetColumnId);
    if (!result.ok) {
      toast.error(result.reason);
    }
    onClose();
  };

  return (
    <AlertDialog
      open={Boolean(pendingDone)}
      onOpenChange={(value) => !value && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move to DONE?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to move this card to DONE?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction type="button" onClick={handleConfirm}>
            Move to DONE
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

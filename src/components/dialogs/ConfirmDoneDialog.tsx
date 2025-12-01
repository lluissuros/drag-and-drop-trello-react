import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

type ConfirmDoneDialogProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDoneDialog = ({ open, onConfirm, onCancel }: ConfirmDoneDialogProps) => (
  <AlertDialog open={open} onOpenChange={(value) => !value && onCancel()}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Move to DONE?</AlertDialogTitle>
        <AlertDialogDescription>Are you sure you want to move this card to DONE?</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel type="button" onClick={onCancel}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction type="button" onClick={onConfirm}>
          Move to DONE
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ConfirmDoneDialog;

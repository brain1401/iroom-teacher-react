import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteClassDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  targetClassName?: string;
  onConfirm?: () => void;
};

/**
 * 반 삭제 확인 모달
 */
export default function ConfirmDeleteClassDialog({ open, onOpenChange, targetClassName, onConfirm, className }: ConfirmDeleteClassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"sm:max-w-[480px] bg-white " + (className ?? "") }>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">반 삭제</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-base"><span className="font-semibold">{targetClassName}</span></p>
          <p className="text-base">정말로 삭제하시겠습니까?</p>
        </div>
        <DialogFooter className="mt-4 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white border border-[var(--color-brand-point)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]">취소</Button>
          <Button onClick={() => { onConfirm?.(); onOpenChange(false); }} className="bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)]">삭제</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



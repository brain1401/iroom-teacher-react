import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmDeleteStudentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  className?: string;
  onConfirm?: () => void;
};

/**
 * 학생 삭제 확인 모달
 * @description 선택된 학생의 삭제를 확인하는 모달
 */
export default function ConfirmDeleteStudentDialog({ 
  open, 
  onOpenChange, 
  studentName = "", 
  className = "",
  onConfirm 
}: ConfirmDeleteStudentDialogProps) {
  
  const handleDelete = () => {
    onConfirm?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{studentName}</DialogTitle>
        </DialogHeader>
        
                 <div className="py-4">
           <p className="text-center text-gray-600">
             {className}에서 삭제하시겠습니까?
           </p>
         </div>

        <DialogFooter className="mt-6 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white border border-[var(--color-brand-point)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
          >
            취소
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)]"
          >
            삭제
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

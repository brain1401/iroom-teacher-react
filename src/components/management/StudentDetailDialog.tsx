import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type StudentDetail = {
  name: string;
  grade: string;
  className: string;
  time: string;
  school: string;
  phone: string;
  academy: string;
  teacher: string;
};

type StudentDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentDetail | null;
  className?: string;
};

/**
 * 학생 상세 모달
 * @description 학생 기본 정보 표시 모달
 */
export function StudentDetailDialog({ open, onOpenChange, student, className }: StudentDetailDialogProps) {
  if (!student) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[680px] bg-white", className)}>
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold">{student.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-2 gap-x-10 gap-y-4">
          <div>
            <div className="text-[var(--color-brand-point)] text-lg font-medium">학년</div>
            <div className="text-neutral-700 text-lg">{student.grade}</div>
          </div>
          <div>
            <div className="text-[var(--color-brand-point)] text-lg font-medium">학교</div>
            <div className="text-neutral-700 text-lg">{student.school}</div>
          </div>
          <div>
            <div className="text-[var(--color-brand-point)] text-lg font-medium">전화번호</div>
            <div className="text-neutral-700 text-lg">{student.phone}</div>
          </div>
          <div>
            <div className="text-[var(--color-brand-point)] text-lg font-medium">학원명</div>
            <div className="text-neutral-700 text-lg">{student.academy}</div>
          </div>
          <div>
            <div className="text-[var(--color-brand-point)] text-lg font-medium">반 이름</div>
            <div className="text-neutral-700 text-lg">{student.className}</div>
          </div>
          <div>
            <div className="text-[var(--color-brand-point)] text-lg font-medium">담당 선생님</div>
            <div className="text-neutral-700 text-lg">{student.teacher}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { StudentDetail };
export default StudentDetailDialog;



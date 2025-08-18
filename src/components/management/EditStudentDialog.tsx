import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type StudentInfo = {
  name: string;
  className: string;
  time: string;
  days: string[];
  timeSlot: string;
  teacher: string;
  grade: string;
  school: string;
};

type EditStudentDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentInfo?: StudentInfo;
  className?: string;
  onConfirm?: (updatedInfo: StudentInfo) => void;
};

/**
 * 학생 정보 수정 모달
 */
export default function EditStudentDialog({ open, onOpenChange, studentInfo, onConfirm, className }: EditStudentDialogProps) {
  const [formData, setFormData] = useState<StudentInfo>({
    name: "",
    className: "",
    time: "",
    days: [],
    timeSlot: "",
    teacher: "",
    grade: "",
    school: "",
  });

  useEffect(() => {
    if (studentInfo) {
      setFormData(studentInfo);
    }
  }, [studentInfo]);

  const handleSubmit = () => {
    onConfirm?.(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={"sm:max-w-[600px] bg-white " + (className ?? "") }>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">학생 정보 수정</DialogTitle>
        </DialogHeader>
                 <div className="space-y-4">
           <div>
             <Label htmlFor="name" className="text-sm font-medium">이름</Label>
             <div className="mt-1 p-2 bg-gray-50 border rounded-md text-sm">
               {formData.name}
             </div>
           </div>
                                           <div>
              <Label htmlFor="time" className="text-sm font-medium">수강 시간</Label>
              <div className="space-y-3 mt-1">
                <div>
                  <Label className="text-xs text-muted-foreground">요일 선택</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"].map((day) => (
                      <div key={day} className="flex items-center space-x-2">
                        <Checkbox
                          id={day}
                          checked={formData.days.includes(day)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({ ...formData, days: [...formData.days, day] });
                            } else {
                              setFormData({ ...formData, days: formData.days.filter(d => d !== day) });
                            }
                          }}
                        />
                        <Label htmlFor={day} className="text-sm">{day}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">시간 선택</Label>
                  <Select value={formData.timeSlot} onValueChange={(value) => setFormData({ ...formData, timeSlot: value })}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="시간 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14:00-16:00">14:00-16:00</SelectItem>
                      <SelectItem value="16:00-18:00">16:00-18:00</SelectItem>
                      <SelectItem value="18:00-20:00">18:00-20:00</SelectItem>
                      <SelectItem value="20:00-22:00">20:00-22:00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          <div>
            <Label htmlFor="className" className="text-sm font-medium">반 이름</Label>
            <Select value={formData.className} onValueChange={(value) => setFormData({ ...formData, className: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="반을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="중등 A반">중등 A반</SelectItem>
                <SelectItem value="중등 B반">중등 B반</SelectItem>
                <SelectItem value="중등 C반">중등 C반</SelectItem>
                <SelectItem value="고등 A반">고등 A반</SelectItem>
                <SelectItem value="고등 B반">고등 B반</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="teacher" className="text-sm font-medium">담당 선생님</Label>
            <Select value={formData.teacher} onValueChange={(value) => setFormData({ ...formData, teacher: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="선생님을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="김수학">김수학</SelectItem>
                <SelectItem value="이영어">이영어</SelectItem>
                <SelectItem value="박과학">박과학</SelectItem>
                <SelectItem value="최국어">최국어</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="grade" className="text-sm font-medium">학년</Label>
            <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="학년을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="중1">중1</SelectItem>
                <SelectItem value="중2">중2</SelectItem>
                <SelectItem value="중3">중3</SelectItem>
                <SelectItem value="고1">고1</SelectItem>
                <SelectItem value="고2">고2</SelectItem>
                <SelectItem value="고3">고3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-6 flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white border border-[var(--color-brand-point)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]">취소</Button>
          <Button onClick={handleSubmit} className="bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)]">수정</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

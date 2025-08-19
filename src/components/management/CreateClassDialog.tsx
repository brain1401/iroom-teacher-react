import {
Dialog,
DialogContent,
DialogHeader,
DialogTitle,
DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type CreateClassDialogProps = {
open: boolean;
onOpenChange: (open: boolean) => void;
className?: string;
};

/**
 * 반 생성 모달
 * @description 반 이름, 수강 시간, 담당 선생님, 학년을 입력/선택하여 새 반을 생성하는 모달
 */
export function CreateClassDialog({
open,
onOpenChange,
className,
}: CreateClassDialogProps) {
const [classNameValue, setClassNameValue] = useState("");
const [teacherValue, setTeacherValue] = useState("김가나");
const [gradeValue, setGradeValue] = useState("중1");
const [days, setDays] = useState<string[]>([]);
const [timeSlot, setTimeSlot] = useState("13:00-14:00");

const handleCreate = () => {
    // TODO: API 연동 시 이곳에서 요청 수행
    // console.log({ classNameValue, days, timeSlot, teacherValue, gradeValue });
    onOpenChange(false);
};

return (
    <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className={cn("sm:max-w-[600px] bg-white", className)}>
        <DialogHeader>
        <DialogTitle className="text-2xl font-bold">반 생성</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
        <div className="grid gap-2">
            <label className="text-sm font-medium">반 이름</label>
            <Input
            value={classNameValue}
            onChange={(e) => setClassNameValue(e.target.value)}
            placeholder="예: 중등 B반"
            />
        </div>

        <div className="grid gap-2">
            <Label className="text-sm font-medium">수강 시간</Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">요일 선택</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Checkbox
                        id={day}
                        checked={days.includes(day)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDays([...days, day]);
                          } else {
                            setDays(days.filter(d => d !== day));
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
                <Select value={timeSlot} onValueChange={setTimeSlot}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="시간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="13:00-14:00">13:00-14:00</SelectItem>
                    <SelectItem value="14:00-15:00">14:00-15:00</SelectItem>
                    <SelectItem value="15:00-16:00">15:00-16:00</SelectItem>
                    <SelectItem value="16:00-17:00">16:00-17:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium">담당 선생님</label>
            <Select value={teacherValue} onValueChange={setTeacherValue}>
              <SelectTrigger>
                <SelectValue placeholder="선생님 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="김가나">김가나</SelectItem>
                <SelectItem value="김다라">김다라</SelectItem>
                <SelectItem value="김마바">김마바</SelectItem>
                <SelectItem value="김사아">김사아</SelectItem>
              </SelectContent>
            </Select>
          </div>

        <div className="grid gap-2">
            <label className="text-sm font-medium">학년</label>
            <Select value={gradeValue} onValueChange={setGradeValue}>
            <SelectTrigger>
                <SelectValue placeholder="학년 선택" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="중1">중1</SelectItem>
                <SelectItem value="중2">중2</SelectItem>
                <SelectItem value="중3">중3</SelectItem>
            </SelectContent>
            </Select>
        </div>
        </div>

        <DialogFooter className="mt-4 flex gap-2 justify-end">
        <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-white border border-[var(--color-brand-point)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
        >
            취소
        </Button>
        <Button
            type="button"
            onClick={handleCreate}
            className="bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)]"
        >
            생성
        </Button>
        </DialogFooter>
    </DialogContent>
    </Dialog>
);
}

export default CreateClassDialog;

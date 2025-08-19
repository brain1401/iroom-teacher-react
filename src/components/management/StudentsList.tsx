import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import type { StudentDetail } from "./StudentDetailDialog";
import StudentDetailDialog from "./StudentDetailDialog";
import EditStudentDialog from "./EditStudentDialog";
import ConfirmDeleteStudentDialog from "./ConfirmDeleteStudentDialog";

type Student = {
name: string;
grade: string;
className: string;
time: string;
};

const SAMPLE_STUDENTS: Student[] = [
{ name: "김가나", grade: "중1", className: "중등 A반", time: "월요일 18:00-20:00" },
{ name: "김다라", grade: "중1", className: "중등 B반", time: "화요일 18:00-20:00" },
{ name: "김마바", grade: "중1", className: "중등 C반", time: "수요일 18:00-20:00" },
{ name: "김사아", grade: "중1", className: "중등 D반", time: "목요일 18:00-20:00" },
{ name: "김자차", grade: "중1", className: "중등 1반", time: "금요일 18:00-20:00" },
];

type StudentsListProps = {
embedded?: boolean;
selectedClass?: string;
onSelectedClassChange?: (v: string) => void;
};

export function StudentsList({
embedded = false,
selectedClass = "전체",
onSelectedClassChange,
}: StudentsListProps) {
const classOptions = useMemo(() => {
const names = Array.from(new Set(SAMPLE_STUDENTS.map((s) => s.className)));
return names;
}, []);

const [internalSelectedClass, setInternalSelectedClass] =
useState<string>(selectedClass);
const setSelectedClass = (v: string) => {
setInternalSelectedClass(v);
onSelectedClassChange?.(v);
};

const [detailOpen, setDetailOpen] = useState(false);
const [detailStudent, setDetailStudent] = useState<StudentDetail | null>(
null,
);
const [editOpen, setEditOpen] = useState(false);
const [editingStudent, setEditingStudent] = useState<Student | null>(null);
const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
const [deleteOpen, setDeleteOpen] = useState(false);
const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

const openDetail = (name: string) => {
const base = SAMPLE_STUDENTS.find((s) => s.name === name);
if (!base) return;
const payload: StudentDetail = {
    name: base.name,
    grade: base.grade.replace("중", "중") + "",
    className: base.className,
    time: base.time,
    school: "드림중학교",
    phone: "010-1234-5678",
    academy: "모모 학원",
    teacher: "김다라",
};
setDetailStudent(payload);
setDetailOpen(true);
};

const handleEdit = () => {
if (selectedStudents.length === 1) {
    const student = SAMPLE_STUDENTS.find((s) => s.name === selectedStudents[0]);
    if (student) {
    setEditingStudent(student);
    setEditOpen(true);
    }
}
};

const handleDelete = () => {
if (selectedStudents.length === 1) {
    const student = SAMPLE_STUDENTS.find((s) => s.name === selectedStudents[0]);
    if (student) {
    setDeletingStudent(student);
    setDeleteOpen(true);
    }
}
};

const handleStudentSelect = (name: string, checked: boolean) => {
if (checked) {
    setSelectedStudents([...selectedStudents, name]);
} else {
    setSelectedStudents(selectedStudents.filter((n) => n !== name));
}
};

if (embedded) {
return (
    <div className="w-full">
    <div className="pb-4">
        <div className="flex items-center justify-between gap-3 w-full">
        <CardTitle className="text-lg md:text-xl my-2 md:my-3">
            학생 목록
        </CardTitle>
        <div className="flex items-center gap-2">
            <Select
            value={internalSelectedClass}
            onValueChange={setSelectedClass}
            >
            <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder="반 선택" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="전체">전체</SelectItem>
                {classOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                    {opt}
                </SelectItem>
                ))}
            </SelectContent>
            </Select>
            <Input
            className="h-8 w-48 text-xs"
            placeholder="이름/반/시간 검색"
            />
                         <Button 
             className="h-8 px-3 text-xs bg-[var(--color-brand-sub)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)] border-transparent"
             onClick={handleEdit}
             disabled={selectedStudents.length !== 1}
             >
             수정
             </Button>
             <Button 
             className="h-8 px-3 text-xs bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)] border-transparent"
             onClick={handleDelete}
             disabled={selectedStudents.length !== 1}
             >
             삭제
             </Button>
         </div>
         </div>
     </div>
    <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
        <colgroup>
            <col className="w-[6%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
        </colgroup>
        <TableHeader>
            <TableRow>
            <TableHead className="text-center"></TableHead>
            <TableHead className="text-center">반 이름</TableHead>
            <TableHead className="text-center">수강 시간</TableHead>
            <TableHead className="text-center">담당 선생님</TableHead>
            <TableHead className="text-center">학년</TableHead>
            <TableHead className="text-center">이름</TableHead>
            <TableHead className="text-center">학교</TableHead>
            <TableHead className="text-center"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {SAMPLE_STUDENTS.filter((s) =>
            internalSelectedClass === "전체"
                ? true
                : s.className === internalSelectedClass,
            ).map((s, idx) => (
            <TableRow key={`${s.name}-${idx}`}>
                <TableCell className="text-center">
                <Checkbox 
                aria-label="선택" 
                checked={selectedStudents.includes(s.name)}
                onCheckedChange={(checked) => handleStudentSelect(s.name, checked as boolean)}
                />
                </TableCell>
                <TableCell className="text-center">{s.className}</TableCell>
                <TableCell className="text-center">{s.time}</TableCell>
                <TableCell className="text-center">김수학</TableCell>
                <TableCell className="text-center">{s.grade}</TableCell>
                <TableCell className="text-center">{s.name}</TableCell>
                <TableCell className="text-center">드림중학교</TableCell>
                <TableCell className="text-center">
                <Button
                    size="sm"
                    className="h-7 px-2 text-xs text-[var(--color-brand-point)] bg-white border border-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
                    onClick={() => openDetail(s.name)}
                >
                    상세보기
                </Button>
                </TableCell>
            </TableRow>
            ))}
            {SAMPLE_STUDENTS.filter((s) =>
            internalSelectedClass === "전체"
                ? true
                : s.className === internalSelectedClass,
            ).length === 0 && (
            <TableRow>
                <TableCell
                colSpan={8}
                className="text-center text-muted-foreground"
                >
                학생 목록이 없습니다.
                </TableCell>
            </TableRow>
            )}
        </TableBody>
        </Table>
    </div>
    <StudentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={detailStudent}
    />
         <EditStudentDialog
         open={editOpen}
         onOpenChange={setEditOpen}
         studentInfo={editingStudent ? {
         name: editingStudent.name,
         className: editingStudent.className,
         time: editingStudent.time,
         days: [editingStudent.time.split(" ")[0]], // "월요일 18:00-20:00"에서 "월요일" 추출
         timeSlot: editingStudent.time.split(" ")[1], // "월요일 18:00-20:00"에서 "18:00-20:00" 추출
         teacher: "김수학",
         grade: editingStudent.grade,
         school: "드림중학교"
         } : undefined}
         onConfirm={(updatedInfo) => {
         // TODO: API 연동 수정
         console.log("학생 정보 수정:", updatedInfo);
         }}
     />
     <ConfirmDeleteStudentDialog
         open={deleteOpen}
         onOpenChange={setDeleteOpen}
         studentName={deletingStudent?.name}
         className={deletingStudent?.className}
         onConfirm={() => {
         // TODO: API 연동 삭제
         console.log("학생 삭제:", deletingStudent?.name);
         }}
     />
     </div>
 );
 }

return (
<Card className="shadow-md w-full">
    <CardHeader className="pb-4">
    <div className="flex items-center justify-between gap-3 w-full">
        <CardTitle className="text-lg md:text-xl my-2 md:my-3">
        학생 목록
        </CardTitle>
        <div className="flex items-center gap-2">
        <Select
            value={internalSelectedClass}
            onValueChange={setSelectedClass}
        >
            <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="반 선택" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="전체">전체</SelectItem>
            {classOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                {opt}
                </SelectItem>
            ))}
            </SelectContent>
        </Select>
        <Input
            className="h-8 w-48 text-xs"
            placeholder="이름/반/시간 검색"
        />
        <Button 
        className="h-8 px-3 text-xs bg-[var(--color-brand-sub)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)] border-transparent"
        onClick={handleEdit}
        disabled={selectedStudents.length !== 1}
        >
            수정
        </Button>
        <Button 
        className="h-8 px-3 text-xs bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)] border-transparent"
        onClick={handleDelete}
        disabled={selectedStudents.length !== 1}
        >
            삭제
        </Button>
        </div>
    </div>
    </CardHeader>
    <CardContent>
    <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
        <colgroup>
            <col className="w-[6%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[14%]" />
        </colgroup>
        <TableHeader>
            <TableRow>
            <TableHead className="text-center"></TableHead>
            <TableHead className="text-center">반 이름</TableHead>
            <TableHead className="text-center">수강 시간</TableHead>
            <TableHead className="text-center">담당 선생님</TableHead>
            <TableHead className="text-center">학년</TableHead>
            <TableHead className="text-center">이름</TableHead>
            <TableHead className="text-center">학교</TableHead>
            <TableHead className="text-center"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {SAMPLE_STUDENTS.map((s, idx) => (
            <TableRow key={`${s.name}-${idx}`}>
                <TableCell className="text-center">
                <Checkbox 
                aria-label="선택" 
                checked={selectedStudents.includes(s.name)}
                onCheckedChange={(checked) => handleStudentSelect(s.name, checked as boolean)}
                />
                </TableCell>
                <TableCell className="text-center">{s.className}</TableCell>
                <TableCell className="text-center">{s.time}</TableCell>
                <TableCell className="text-center">김수학</TableCell>
                <TableCell className="text-center">{s.grade}</TableCell>
                <TableCell className="text-center">{s.name}</TableCell>
                <TableCell className="text-center">드림중학교</TableCell>
                <TableCell className="text-center">
                <Button
                    size="sm"
                    className="h-7 px-2 text-xs text-[var(--color-brand-point)] bg-white border border-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
                    onClick={() => openDetail(s.name)}
                >
                    상세보기
                </Button>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
    <StudentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        student={detailStudent}
    />
         <EditStudentDialog
         open={editOpen}
         onOpenChange={setEditOpen}
         studentInfo={editingStudent ? {
         name: editingStudent.name,
         className: editingStudent.className,
         time: editingStudent.time,
         days: [editingStudent.time.split(" ")[0]], // "월요일 18:00-20:00"에서 "월요일" 추출
         timeSlot: editingStudent.time.split(" ")[1], // "월요일 18:00-20:00"에서 "18:00-20:00" 추출
         teacher: "김수학",
         grade: editingStudent.grade,
         school: "드림중학교"
         } : undefined}
         onConfirm={(updatedInfo) => {
         // TODO: API 연동 수정
         console.log("학생 정보 수정:", updatedInfo);
         }}
     />
     <ConfirmDeleteStudentDialog
         open={deleteOpen}
         onOpenChange={setDeleteOpen}
         studentName={deletingStudent?.name}
         className={deletingStudent?.className}
         onConfirm={() => {
         // TODO: API 연동 삭제
         console.log("학생 삭제:", deletingStudent?.name);
         }}
     />
     </CardContent>
 </Card>
 );
 }

export default StudentsList;

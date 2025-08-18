import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
Table,
TableBody,
TableCell,
TableHead,
TableHeader,
TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
Select,
SelectContent,
SelectItem,
SelectTrigger,
SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import CreateClassDialog from "./CreateClassDialog";
import EditClassDialog from "./EditClassDialog";
import ConfirmDeleteClassDialog from "./ConfirmDeleteClassDialog";

type ClassInfo = {
grade: string;
className: string;
teacher: string;
time: string;
days: string[];
timeSlot: string;
};

const SAMPLE_CLASSES: ClassInfo[] = [
{
grade: "중1",
className: "중등 A반",
teacher: "김가나",
time: "월요일 13:00-14:00",
days: ["월요일"],
timeSlot: "13:00-14:00",
},
{
grade: "중1",
className: "중등 B반",
teacher: "김다라",
time: "화요일 13:00-14:00",
days: ["화요일"],
timeSlot: "13:00-14:00",
},
{
grade: "중1",
className: "중등 C반",
teacher: "김마바",
time: "수요일 13:00-14:00",
days: ["수요일"],
timeSlot: "13:00-14:00",
},
{
grade: "중1",
className: "중등 D반",
teacher: "김사아",
time: "목요일 13:00-14:00",
days: ["목요일"],
timeSlot: "13:00-14:00",
},
{
grade: "중1",
className: "중등 1반",
teacher: "김자차",
time: "금요일 13:00-14:00",
days: ["금요일"],
timeSlot: "13:00-14:00",
},
{
grade: "중1",
className: "중등 2반",
teacher: "김카타",
time: "토요일 15:00-16:00",
days: ["토요일"],
timeSlot: "15:00-16:00",
},
{
grade: "중1",
className: "중등 3반",
teacher: "김파하",
time: "일요일 15:00-16:00",
days: ["일요일"],
timeSlot: "15:00-16:00",
},
{
grade: "중1",
className: "중등 4반",
teacher: "김나나",
time: "월요일 15:00-16:00",
days: ["월요일"],
timeSlot: "15:00-16:00",
},
{
grade: "중1",
className: "중등 5반",
teacher: "김다다",
time: "화요일 15:00-16:00",
days: ["화요일"],
timeSlot: "15:00-16:00",
},
];

type ClassListProps = {
embedded?: boolean;
onShowStudentsForClass?: (className: string) => void;
};

export function ClassList({
embedded = false,
onShowStudentsForClass,
}: ClassListProps) {
const [openCreate, setOpenCreate] = useState(false);
const [selectedGrade, setSelectedGrade] = useState<string>("all");
const gradeMap: Record<string, string> = {
all: "",
m1: "중1",
m2: "중2",
m3: "중3",
};
const filteredClasses = SAMPLE_CLASSES.filter((c) =>
selectedGrade === "all" ? true : c.grade === gradeMap[selectedGrade],
);
const [editOpen, setEditOpen] = useState(false);
const [editing, setEditing] = useState<ClassInfo | null>(null);
const [deleteOpen, setDeleteOpen] = useState(false);
const [deleting, setDeleting] = useState<ClassInfo | null>(null);
if (embedded) {
return (
    <div className="w-full">
    <div className="pb-4">
        <div className="flex items-center justify-between gap-3 w-full">
        <CardTitle className="text-lg md:text-xl my-2 md:my-3">
            반 목록
        </CardTitle>
        <div className="flex items-center gap-2">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="h-8 w-28 text-xs">
                <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="m1">중1</SelectItem>
                <SelectItem value="m2">중2</SelectItem>
                <SelectItem value="m3">중3</SelectItem>
            </SelectContent>
            </Select>
            <Input
            className="h-8 w-40 text-xs"
            placeholder="반/담당/시간 검색"
            />
            <Button
            onClick={() => setOpenCreate(true)}
            className="h-8 px-3 text-xs bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)] border-transparent"
            >
            반 생성
            </Button>
        </div>
        </div>
    </div>
    <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
        <colgroup>
            <col className="w-[24%]" /> {/* 반 이름 */}
            <col className="w-[20%]" /> {/* 수강 시간 */}
            <col className="w-[20%]" /> {/* 담당 선생님 */}
            <col className="w-[12%]" /> {/* 학년 */}
            <col className="w-[24%]" /> {/* 액션 */}
        </colgroup>
        <TableHeader>
            <TableRow>
            <TableHead className="text-center">반 이름</TableHead>
            <TableHead className="text-center">수강 시간</TableHead>
            <TableHead className="text-center">담당 선생님</TableHead>
            <TableHead className="text-center">학년</TableHead>
            <TableHead className="text-center"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {filteredClasses.length === 0 && (
            <TableRow>
                <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                >
                반이 없습니다.
                </TableCell>
            </TableRow>
            )}
            {filteredClasses.map((c, idx) => (
            <TableRow key={`${c.className}-${idx}`}>
                <TableCell className="text-center">{c.className}</TableCell>
                <TableCell className="text-center">{c.time}</TableCell>
                <TableCell className="text-center">{c.teacher}</TableCell>
                <TableCell className="text-center">{c.grade}</TableCell>
                <TableCell className="text-center">
                <div className="inline-flex justify-center gap-1">
                    <Button
                    size="sm"
                    className="h-7 px-2 text-xs bg-[var(--color-brand-sub)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)] border-transparent"
                    onClick={() => onShowStudentsForClass?.(c.className)}
                    >
                    학생목록 보기
                    </Button>
                    <Button
                    size="sm"
                    className="h-7 px-2 text-xs text-[var(--color-brand-point)] bg-white border border-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
                    onClick={() => { setEditing(c); setEditOpen(true); }}
                    >
                    수정
                    </Button>
                    <Button
                    size="sm"
                    className="h-7 px-2 text-xs text-[var(--color-brand-point)] bg-white border border-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
                    onClick={() => { setDeleting(c); setDeleteOpen(true); }}
                    >
                    삭제
                    </Button>
                </div>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
    <CreateClassDialog open={openCreate} onOpenChange={setOpenCreate} />
    <EditClassDialog open={editOpen} onOpenChange={setEditOpen} value={editing} />
    <ConfirmDeleteClassDialog open={deleteOpen} onOpenChange={setDeleteOpen} targetClassName={deleting?.className} onConfirm={() => { /* TODO: API 연동 삭제 */ }} />
    </div>
);
}

return (
<Card className="shadow-md w-full">
    <CardHeader className="pb-4">
    <div className="flex items-center justify-between gap-3 w-full">
        <CardTitle className="text-lg md:text-xl my-2 md:my-3">
        반 목록
        </CardTitle>
        <div className="flex items-center gap-2">
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="m1">중1</SelectItem>
            <SelectItem value="m2">중2</SelectItem>
            <SelectItem value="m3">중3</SelectItem>
            </SelectContent>
        </Select>
        <Input
            className="h-8 w-40 text-xs"
            placeholder="반/담당/시간 검색"
        />
        <Button
            onClick={() => setOpenCreate(true)}
            className="h-8 px-3 text-xs bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)] border-transparent"
        >
            반 생성
        </Button>
        </div>
    </div>
    </CardHeader>
    <CardContent>
    <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
        <colgroup>
            <col className="w-[24%]" />
            <col className="w-[20%]" />
            <col className="w-[20%]" />
            <col className="w-[12%]" />
            <col className="w-[24%]" />
        </colgroup>
        <TableHeader>
            <TableRow>
            <TableHead className="text-center">반 이름</TableHead>
            <TableHead className="text-center">수강 시간</TableHead>
            <TableHead className="text-center">담당 선생님</TableHead>
            <TableHead className="text-center">학년</TableHead>
            <TableHead className="text-center"></TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {filteredClasses.length === 0 && (
            <TableRow>
                <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
                >
                반이 없습니다.
                </TableCell>
            </TableRow>
            )}
            {filteredClasses.map((c, idx) => (
            <TableRow key={`${c.className}-${idx}`}>
                <TableCell className="text-center">{c.className}</TableCell>
                <TableCell className="text-center">{c.time}</TableCell>
                <TableCell className="text-center">{c.teacher}</TableCell>
                <TableCell className="text-center">{c.grade}</TableCell>
                <TableCell className="text-center">
                <div className="inline-flex justify-center gap-1">
                    <Button
                    size="sm"
                    className="h-7 px-2 text-xs bg-[var(--color-brand-sub)] text-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)] border-transparent"
                    onClick={() => onShowStudentsForClass?.(c.className)}
                    >
                    학생목록 보기
                    </Button>
                    <Button
                    size="sm"
                    className="h-7 px-2 text-xs text-[var(--color-brand-point)] bg-white border border-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
                    onClick={() => { setEditing(c); setEditOpen(true); }}
                    >
                    수정
                    </Button>
                    <Button
                    size="sm"
                    className="h-7 px-2 text-xs text-[var(--color-brand-point)] bg-white border border-[var(--color-brand-point)] hover:bg-[var(--color-brand-sub)]"
                    onClick={() => { setEditing(c); setEditOpen(true); }}
                    >
                    삭제
                    </Button>
                </div>
                </TableCell>
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
    <CreateClassDialog open={openCreate} onOpenChange={setOpenCreate} />
    </CardContent>
</Card>
);
}

export default ClassList;

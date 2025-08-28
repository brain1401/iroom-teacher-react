// src/routes/test-paper/_components/TestTable.tsx

// 1. shadcn/ui 컴포넌트들을 모두 import
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox"; // 👈 경로 수정!
import type { TestSubmission } from "@/types/test";
import { Link } from "@tanstack/react-router";

/**
 * 시험지 테이블 컴포넌트 props 타입
 * @description 목록 렌더링, 선택 제어, 모달 오픈 콜백 전달
 *
 * 주요 속성:
 * - submissions: 시험 제출 현황 목록 데이터
 * - selectedIds: 체크된 행의 ID 집합
 * - onSelectAll: 전체 선택 토글 핸들러
 * - onSelect: 개별 선택 토글 핸들러
 * - onOpenDetail: 시험 제출 상세 모달 오픈 콜백
 */
type TestDetailTableProps = {
  submissions: TestSubmission[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpenDetail: (paper: TestSubmission) => void;
};

export function TestDetailTable({
  submissions,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenDetail,
}: TestDetailTableProps) {
  return (
    <Table className="w-full">
      {/* 2. TableHeader와 "전체 선택" 체크박스 추가 */}
      <TableHeader className="bg-gray-100 w-full">
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={selectedIds.size === submissions.length}
              onCheckedChange={onSelectAll}
            />
          </TableHead>
          <TableHead>이름</TableHead>
          <TableHead>전화번호</TableHead>
          <TableHead>시험명</TableHead>
          <TableHead>제출일자</TableHead>
          <TableHead></TableHead>
          <TableHead>답안확인</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.map((submission) => (
          <TableRow key={submission.studentId}>
            <TableCell>
              <Checkbox
                checked={selectedIds.has(submission.studentId)}
                onCheckedChange={(checked) =>
                  onSelect(submission.studentId, Boolean(checked))
                }
              />
            </TableCell>
            <TableCell>{submission.studentName}</TableCell>
            <TableCell>{submission.phoneNumber}</TableCell>
            <TableCell>{submission.testName}</TableCell>
            <TableCell>{submission.submittedAt}</TableCell>
            <TableCell>{submission.submittedAnswer}</TableCell>
            {/* 3. UI에 있던 버튼들도 추가 */}
            <TableCell>
              <Link
                to="/main/test-management/$examId"
                params={{ examId: "1" }}
                className="bg-sky-100 text-sky-500 hover:bg-sky-200 hover:text-sky-600 rounded-md px-2 py-1"
                onClick={() => onOpenDetail(submission)}
              >
                답안확인
              </Link>
            </TableCell>
            <TableCell className="flex gap-2 justify-center"></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

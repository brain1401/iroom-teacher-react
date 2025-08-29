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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  tableStyles,
  buttonStyles,
  badgeStyles,
  getStatusBadgeVariant,
} from "@/utils/commonStyles";
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
  // "전체 선택" 체크박스의 상태를 결정하는 변수
  const isAllSelected =
    submissions.length > 0 && selectedIds.size === submissions.length;

  return (
    <div className={tableStyles.container}>
      <Table>
        {/* 2. TableHeader와 "전체 선택" 체크박스 추가 */}
        <TableHeader>
          <TableRow className={tableStyles.header}>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                className={tableStyles.checkbox}
              />
            </TableHead>
            <TableHead className={tableStyles.headerCell}>이름</TableHead>
            <TableHead className={tableStyles.headerCell}>전화번호</TableHead>
            <TableHead className={tableStyles.headerCell}>시험명</TableHead>
            <TableHead className={tableStyles.headerCell}>제출일자</TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              제출 상태
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              답안확인
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission, index) => (
            <TableRow
              key={submission.studentId}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
              )}
            >
              <TableCell className={tableStyles.cellCenter}>
                <Checkbox
                  checked={selectedIds.has(submission.studentId)}
                  onCheckedChange={(checked) =>
                    onSelect(submission.studentId, Boolean(checked))
                  }
                  className={tableStyles.checkbox}
                />
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                {submission.studentName}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {submission.phoneNumber}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {submission.testName}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {submission.submittedAt}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge
                  variant={getStatusBadgeVariant("제출 완료")}
                  className={badgeStyles[getStatusBadgeVariant("제출 완료")]}
                >
                  제출 완료
                </Badge>
              </TableCell>
              {/* 3. UI에 있던 버튼들도 추가 */}
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className={buttonStyles.primary}
                >
                  <Link
                    to="/main/test-management/$examId"
                    params={{ examId: "1" }}
                    onClick={() => onOpenDetail(submission)}
                  >
                    답안확인
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

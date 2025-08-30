// src/components/test/TestDetailTable.tsx

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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  tableStyles,
  buttonStyles,
  badgeStyles,
  getStatusBadgeVariant,
} from "@/utils/commonStyles";
import type { TestSubmitStatusDetail } from "@/types/test";

/**
 * 시험 제출 현황 테이블 컴포넌트 props 타입
 * @description 학생별 제출 현황 목록 렌더링, 선택 제어, 모달 오픈 콜백 전달
 *
 * 주요 속성:
 * - submissions: 시험 제출 현황 목록 데이터
 * - selectedIds: 체크된 행의 ID 집합
 * - onSelectAll: 전체 선택 토글 핸들러
 * - onSelect: 개별 선택 토글 핸들러
 * - onOpenDetail: 시험 제출 상세 모달 오픈 콜백
 */
type TestDetailTableProps = {
  submissions: TestSubmitStatusDetail[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpenDetail: (submission: TestSubmitStatusDetail) => void;
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
              key={submission.student.id}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
              )}
            >
              <TableCell className={tableStyles.cellCenter}>
                <Checkbox
                  checked={selectedIds.has(submission.student.id)}
                  onCheckedChange={(checked) =>
                    onSelect(submission.student.id, Boolean(checked))
                  }
                  className={tableStyles.checkbox}
                />
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                {submission.student.name}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {submission.student.phoneNumber}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {submission.testName}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {submission.submissionDate}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge
                  variant={getStatusBadgeVariant(submission.submissionStatus)}
                  className={
                    badgeStyles[
                      getStatusBadgeVariant(submission.submissionStatus)
                    ]
                  }
                >
                  {submission.submissionStatus}
                </Badge>
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="outline"
                  size="sm"
                  className={buttonStyles.primary}
                  onClick={() => onOpenDetail(submission)}
                  disabled={submission.submissionStatus === "미제출"}
                >
                  답안확인
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

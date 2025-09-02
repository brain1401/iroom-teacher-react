// src/routes/exam-sheet/_components/ExamTable.tsx

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
  getDifficultyBadgeVariant,
} from "@/utils/commonStyles";
import { Trash2 } from "lucide-react";
import type { Exam } from "@/types/exam";

/**
 * 시험지 테이블 컴포넌트 props 타입
 * @description 목록 렌더링, 선택 제어, 모달 오픈 콜백 전달
 *
 * 주요 속성:
 * - sheets: 시험지 목록 데이터
 * - selectedIds: 체크된 행의 ID 집합
 * - onSelectAll: 전체 선택 토글 핸들러
 * - onSelect: 개별 선택 토글 핸들러
 * - onOpenPrint: 인쇄 미리보기 모달 오픈 콜백
 * - onOpenDetail: 시험지 상세 모달 오픈 콜백
 */
type ExamTableProps = {
  sheets: Exam[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpenPrint: (sheet: Exam) => void;
  onOpenDetail: (sheet: Exam) => void;
  onDelete?: (id: string) => void;
};

export function ExamTable({
  sheets,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenPrint,
  onOpenDetail,
  onDelete,
}: ExamTableProps) {
  // "전체 선택" 체크박스의 상태를 결정하는 변수
  const isAllSelected = sheets.length > 0 && selectedIds.size === sheets.length;

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
            <TableHead className={tableStyles.headerCell}>단원정보</TableHead>
            <TableHead className={tableStyles.headerCell}>시험명</TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              문항수
            </TableHead>
            <TableHead className={tableStyles.headerCell}>
              시험 난이도
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>
              시험 제출 현황
            </TableHead>
            <TableHead className={tableStyles.headerCellCenter}>삭제</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sheets.map((sheet, index) => (
            <TableRow
              key={sheet.id}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
              )}
            >
              <TableCell className={tableStyles.cellCenter}>
                <Checkbox
                  checked={selectedIds.has(sheet.id)}
                  onCheckedChange={(checked) =>
                    onSelect(sheet.id, Boolean(checked))
                  }
                  className={tableStyles.checkbox}
                />
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                {sheet.unitName}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {sheet.examName}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge variant="outline" className={badgeStyles.outline}>
                  {sheet.questionCount}문항
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getDifficultyBadgeVariant(sheet.questionLevel)}
                  className={
                    badgeStyles[getDifficultyBadgeVariant(sheet.questionLevel)]
                  }
                >
                  {sheet.questionLevel}
                </Badge>
              </TableCell>
              {/* 3. UI에 있던 버튼들도 추가 */}
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDetail(sheet)}
                  className={buttonStyles.primary}
                >
                  상세보기
                </Button>
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(sheet.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

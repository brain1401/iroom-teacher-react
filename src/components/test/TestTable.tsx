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
  getDifficultyBadgeVariant,
} from "@/utils/commonStyles";
import { Trash2 } from "lucide-react";
import type { Test } from "@/types/test";

/**
 * 시험지 테이블 컴포넌트 props 타입
 * @description 목록 렌더링, 선택 제어, 모달 오픈 콜백 전달
 *
 * 주요 속성:
 * - papers: 시험지 목록 데이터
 * - selectedIds: 체크된 행의 ID 집합
 * - onSelectAll: 전체 선택 토글 핸들러
 * - onSelect: 개별 선택 토글 핸들러
 * - onOpenPrint: 인쇄 미리보기 모달 오픈 콜백
 * - onOpenDetail: 시험지 상세 모달 오픈 콜백
 */
type TestTableProps = {
  papers: Test[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpenPrint: (paper: Test) => void;
  onOpenDetail: (paper: Test) => void;
  onDelete?: (id: string) => void;
};

export function TestTable({
  papers,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenPrint,
  onOpenDetail,
  onDelete,
}: TestTableProps) {
  // "전체 선택" 체크박스의 상태를 결정하는 변수
  const isAllSelected = papers.length > 0 && selectedIds.size === papers.length;

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
          {papers.map((paper, index) => (
            <TableRow
              key={paper.id}
              className={cn(
                tableStyles.row,
                index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
              )}
            >
              <TableCell className={tableStyles.cellCenter}>
                <Checkbox
                  checked={selectedIds.has(paper.id)}
                  onCheckedChange={(checked) =>
                    onSelect(paper.id, Boolean(checked))
                  }
                  className={tableStyles.checkbox}
                />
              </TableCell>
              <TableCell className={tableStyles.cellMedium}>
                {paper.unitName}
              </TableCell>
              <TableCell className={tableStyles.cell}>
                {paper.testName}
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Badge variant="outline" className={badgeStyles.outline}>
                  {paper.questionCount}문항
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getDifficultyBadgeVariant(paper.questionLevel)}
                  className={
                    badgeStyles[getDifficultyBadgeVariant(paper.questionLevel)]
                  }
                >
                  {paper.questionLevel}
                </Badge>
              </TableCell>
              {/* 3. UI에 있던 버튼들도 추가 */}
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenDetail(paper)}
                  className={buttonStyles.primary}
                >
                  상세보기
                </Button>
              </TableCell>
              <TableCell className={tableStyles.cellCenter}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(paper.id)}
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

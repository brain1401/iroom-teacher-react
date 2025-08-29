// src/routes/test-paper/_components/TestPaperTable.tsx

import type { TestPaper } from "@/types/test-paper";
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
import { tableStyles, buttonStyles, badgeStyles } from "@/utils/commonStyles";
import {
  Printer,
  Eye,
  FileText,
  ChevronUp,
  ChevronDown,
  Trash2,
} from "lucide-react";

/**
 * 정렬 타입 정의
 */
type SortField = "unitName" | "testName" | "createdAt";
type SortOrder = "asc" | "desc";

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
 * - onOpenProblemModal: 문제 모달 오픈 콜백
 * - onOpenAnswerModal: 답안 모달 오픈 콜백
 * - sortField: 현재 정렬 필드
 * - sortOrder: 현재 정렬 순서
 * - onSort: 정렬 변경 핸들러
 */
type TestPaperTableProps = {
  papers: TestPaper[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpenPrint: (paper: TestPaper) => void;
  onOpenProblemModal: (paper: TestPaper) => void;
  onOpenAnswerModal: (paper: TestPaper) => void;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
};

export function TestPaperTable({
  papers,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenPrint,
  onOpenProblemModal,
  onOpenAnswerModal,
  sortField,
  sortOrder,
  onSort,
}: TestPaperTableProps) {
  // "전체 선택" 체크박스의 상태를 결정하는 변수
  const isAllSelected = papers.length > 0 && selectedIds.size === papers.length;

  return (
    <div className={tableStyles.container}>
      <Table>
        {/* 2. TableHeader와 "전체 선택" 체크박스 추가 */}
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className={tableStyles.header}>
            <TableHead className="w-[50px] text-center">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onSelectAll}
                className={tableStyles.checkbox}
              />
            </TableHead>
            <SortableHeader
              field="unitName"
              label="단원정보"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <SortableHeader
              field="testName"
              label="시험지명"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
            />
            <TableHead className={tableStyles.headerCellCenter}>
              문항수
            </TableHead>
            <SortableHeader
              field="createdAt"
              label="생성일시"
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={onSort}
              className={tableStyles.headerCellCenter}
            />
            <TableHead className={tableStyles.headerCellCenter}>
              답안/미리보기/인쇄
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-h-[400px] overflow-y-auto">
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
              <TableCell className={tableStyles.cellCenter}>
                {paper.createdAt
                  ? `${new Date(paper.createdAt)
                      .toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      .replace(/\./g, ".")
                      .replace(",", "")} 생성`
                  : "날짜 없음"}
              </TableCell>
              {/* 3. 답안/미리보기/인쇄 버튼들 추가 */}
              <TableCell className={tableStyles.cellCenter}>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAnswerModal(paper)}
                    className="text-xs px-2 py-1"
                  >
                    답안보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenProblemModal(paper)}
                    className="text-xs px-2 py-1"
                  >
                    문제보기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenPrint(paper)}
                    className="text-xs px-2 py-1"
                  >
                    <Printer className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * 정렬 가능한 테이블 헤더 컴포넌트
 */
function SortableHeader({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
  className,
}: {
  field: SortField;
  label: string;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
  className?: string;
}) {
  const isActive = sortField === field;

  return (
    <TableHead className={cn(tableStyles.headerCell, className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-semibold hover:bg-transparent"
        onClick={() => onSort?.(field)}
      >
        {label}
        <div className="ml-1 flex items-center">
          {isActive ? (
            sortOrder === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )
          ) : (
            <div className="h-4 w-4 flex items-center justify-center">
              <ChevronUp className="h-3 w-3 text-muted-foreground/50" />
            </div>
          )}
        </div>
      </Button>
    </TableHead>
  );
}

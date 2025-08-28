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
import { Printer } from "lucide-react";

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
 */
type TestPaperTableProps = {
  papers: TestPaper[];
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onSelect: (id: string, checked: boolean) => void;
  onOpenPrint: (paper: TestPaper) => void;
  onOpenProblemModal: (paper: TestPaper) => void;
};

export function TestPaperTable({
  papers,
  selectedIds,
  onSelectAll,
  onSelect,
  onOpenPrint,
  onOpenProblemModal,
}: TestPaperTableProps) {
  // "전체 선택" 체크박스의 상태를 결정하는 변수
  const isAllSelected = papers.length > 0 && selectedIds.size === papers.length;

  return (
    <Table>
      {/* 2. TableHeader와 "전체 선택" 체크박스 추가 */}
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]">
            <Checkbox checked={isAllSelected} onCheckedChange={onSelectAll} />
          </TableHead>
          <TableHead>단원정보</TableHead>
          <TableHead>시험지명</TableHead>
          <TableHead>문항수</TableHead>
          <TableHead>답안/미리보기/인쇄</TableHead>
          <TableHead>시험지 상세 보기</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {papers.map((paper) => (
          <TableRow key={paper.id}>
            <TableCell>
              <Checkbox
                checked={selectedIds.has(paper.id)}
                onCheckedChange={(checked) =>
                  onSelect(paper.id, Boolean(checked))
                }
              />
            </TableCell>
            <TableCell>{paper.unitName}</TableCell>
            <TableCell>{paper.testName}</TableCell>
            <TableCell>{paper.questionCount}</TableCell>
            {/* 3. UI에 있던 버튼들도 추가 */}
            <TableCell className="flex gap-2">
              <Button variant="outline" size="sm">
                답안보기
              </Button>
              <Button variant="outline" size="sm">
                문제보기
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenPrint(paper)}
              >
                <Printer className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onOpenProblemModal(paper)}
              >
                문제 보기
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

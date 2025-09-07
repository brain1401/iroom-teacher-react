import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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

import { cn } from "@/lib/utils";
import { tableStyles, buttonStyles } from "@/utils/commonStyles";
import { examAttendeesQueryOptions } from "@/api/exam/query";
import type { ExamAttendee, ExamAttendeesParams } from "@/api/exam/types";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * 시험 응시자 테이블 컴포넌트 Props
 */
type ExamAttendeesTableProps = {
  /** 시험 ID */
  examId: string;
  /** 답안 상세 보기 모달 열기 핸들러 */
  onOpenDetail?: (attendee: ExamAttendee) => void;
};

/**
 * 시험 응시자 테이블 컴포넌트
 * @description 별도 API 엔드포인트에서 응시자 정보를 가져와 표시하는 테이블
 *
 * 주요 기능:
 * - 페이지네이션된 응시자 목록 표시
 * - 정렬 기능 (제출시간, 이름)
 * - 체크박스 선택 기능
 * - 답안 확인 버튼
 *
 * API 엔드포인트:
 * - GET /exams/{examId}/attendees
 * - 페이지네이션, 정렬 지원
 */
export function ExamAttendeesTable({
  examId,
  onOpenDetail,
}: ExamAttendeesTableProps) {
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10; // 고정값으로 설정
  const [sortBy, setSortBy] = useState<string>("submittedAt,desc");

  // 선택 상태
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 응시자 데이터 조회
  const queryParams: ExamAttendeesParams = {
    page: currentPage,
    size: pageSize,
    sort: sortBy,
  };

  const { data, isLoading, isError } = useQuery(
    examAttendeesQueryOptions(examId, queryParams),
  );

  // 전체 선택/해제 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked && data?.content) {
      setSelectedIds(new Set(data.content.map((a) => a.submissionId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  // 개별 선택/해제 핸들러
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // 전체 선택 상태
  const isAllSelected =
    data?.content &&
    data.content.length > 0 &&
    selectedIds.size === data.content.length;

  // 정렬 변경 핸들러
  const handleSort = (field: "submittedAt" | "studentName") => {
    const currentField = sortBy.split(",")[0];
    const currentDirection = sortBy.split(",")[1];

    if (currentField === field) {
      // 같은 필드 클릭 시 정렬 방향 토글
      setSortBy(`${field},${currentDirection === "asc" ? "desc" : "asc"}`);
    } else {
      // 다른 필드 클릭 시 기본 정렬 방향 적용
      setSortBy(`${field},${field === "submittedAt" ? "desc" : "asc"}`);
    }
    setCurrentPage(0); // 정렬 변경 시 첫 페이지로
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 0 && data && page < data.totalPages) {
      setCurrentPage(page);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className={tableStyles.container}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">응시자 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className={tableStyles.container}>
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              응시자 정보를 불러오는데 실패했습니다.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없는 경우
  if (!data || data.content.length === 0) {
    return (
      <div className={tableStyles.container}>
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-gray-500">아직 제출한 학생이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={tableStyles.container}>
        <Table>
          <TableHeader>
            <TableRow className={tableStyles.header}>
              {/* 전체 선택 체크박스 */}
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  className={tableStyles.checkbox}
                  aria-label="전체 학생 선택/해제"
                />
              </TableHead>
              <TableHead
                className={cn(
                  tableStyles.headerCell,
                  "cursor-pointer hover:bg-muted/50",
                )}
                onClick={() => handleSort("studentName")}
              >
                이름
                {sortBy.startsWith("studentName") && (
                  <span className="ml-1">
                    {sortBy.includes("asc") ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className={tableStyles.headerCell}>전화번호</TableHead>
              <TableHead className={tableStyles.headerCell}>생년월일</TableHead>
              <TableHead
                className={cn(
                  tableStyles.headerCell,
                  "cursor-pointer hover:bg-muted/50",
                )}
                onClick={() => handleSort("submittedAt")}
              >
                제출일시
                {sortBy.startsWith("submittedAt") && (
                  <span className="ml-1">
                    {sortBy.includes("asc") ? "↑" : "↓"}
                  </span>
                )}
              </TableHead>
              <TableHead className={tableStyles.headerCellCenter}>
                답안확인
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.content.map((attendee, index) => {
              const isSelected = selectedIds.has(attendee.submissionId);

              return (
                <TableRow
                  key={attendee.submissionId}
                  className={cn(
                    tableStyles.row,
                    index % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd,
                  )}
                >
                  {/* 개별 선택 체크박스 */}
                  <TableCell className={tableStyles.cellCenter}>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelect(attendee.submissionId, Boolean(checked))
                      }
                      className={tableStyles.checkbox}
                      aria-label={`${attendee.studentName} 선택/해제`}
                    />
                  </TableCell>

                  {/* 학생 이름 */}
                  <TableCell className={tableStyles.cellMedium}>
                    {attendee.studentName}
                  </TableCell>

                  {/* 전화번호 */}
                  <TableCell className={tableStyles.cell}>
                    {attendee.studentPhone}
                  </TableCell>

                  {/* 생년월일 */}
                  <TableCell className={tableStyles.cell}>
                    {attendee.studentBirthDate}
                  </TableCell>

                  {/* 제출일시 */}
                  <TableCell className={tableStyles.cell}>
                    {new Date(attendee.submittedAt).toLocaleString("ko-KR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {/* 답안확인 버튼 */}
                  <TableCell className={tableStyles.cellCenter}>
                    <Button
                      variant="outline"
                      size="sm"
                      className={buttonStyles.primary}
                      onClick={() => onOpenDetail?.(attendee)}
                      aria-label={`${attendee.studentName} 답안 상세보기`}
                    >
                      답안확인
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center">
        <div className="text-sm text-muted-foreground">
          전체 {data.totalElements}명 중 {data.numberOfElements}명 표시
        </div>
        <Pagination className="flex-1">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                className={cn(
                  !data.first && "cursor-pointer",
                  data.first && "opacity-50 cursor-not-allowed",
                )}
              />
            </PaginationItem>

            {/* 페이지 번호들 */}
            {(() => {
              // 페이지 번호 배열 생성
              const pageNumbers: number[] = [];

              if (data.totalPages <= 5) {
                // 전체 페이지가 5개 이하면 모두 표시
                for (let i = 0; i < data.totalPages; i++) {
                  pageNumbers.push(i);
                }
              } else {
                // 5개 이상이면 현재 페이지 중심으로 5개 표시
                let start = Math.max(0, currentPage - 2);
                const end = Math.min(data.totalPages - 1, start + 4);

                // 끝에 도달했으면 시작점 조정
                if (end - start < 4) {
                  start = Math.max(0, end - 4);
                }

                for (let i = start; i <= end; i++) {
                  pageNumbers.push(i);
                }
              }

              return pageNumbers.map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    onClick={() => handlePageChange(pageNum)}
                    isActive={pageNum === currentPage}
                    className="cursor-pointer"
                  >
                    {pageNum + 1}
                  </PaginationLink>
                </PaginationItem>
              ));
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                className={cn(
                  !data.last && "cursor-pointer",
                  data.last && "opacity-50 cursor-not-allowed",
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}

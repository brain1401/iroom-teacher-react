import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { PagePagination } from "@/components/layout/PagePagination";
import { Toolbar } from "@/components/layout/Toolbar";
import { ProblemModal } from "@/components/layout/ProblemModal";
import { PrintOptionsModal } from "./PrintOptionsModal";
import { ExamSheetTable } from "./ExamSheetTable";
import {
  filteredSheetListAtom,
  sheetSearchKeywordAtom,
  selectedSheetGradeAtom,
  sheetPageAtom,
  sheetSortAtom,
  sheetSortDirectionAtom,
  setSheetSearchKeywordAtom,
  setSheetPageAtom,
  setSheetSortAtom,
} from "@/atoms/sheetFilters";
import type { ExamSheet } from "@/types/exam-sheet";
import logger from "@/utils/logger";

/**
 * 문제지 목록 관리 탭 컴포넌트
 * @description 생성된 문제지들을 종합적으로 관리하는 메인 대시보드 컴포넌트
 *
 * 주요 기능:
 * - atomWithQuery를 통한 서버 상태 관리 및 SSR 지원
 * - Jotai atoms를 통한 클라이언트 상태 관리 (필터링, 페이징, 정렬)
 * - 문제지 목록 조회 및 표시 (테이블 형태의 구조화된 뷰)
 * - 대량 선택을 통한 일괄 관리 (체크박스 기반 다중 선택)
 * - 실시간 검색 및 필터링 (단원명, 문제지명 기준)
 * - 동적 정렬 기능 (단원명, 문제지명, 생성일시 기준)
 * - 페이지네이션을 통한 성능 최적화
 * - 문제지별 상세 액션 (인쇄, 문제 보기, 답안 확인, 삭제)
 * - TanStack Router를 통한 URL 동기화
 * - 모달 통합 관리 (인쇄 옵션, 문제 뷰어)
 *
 * 아키텍처 개선사항:
 * - SSR 지원: 초기 HTML에 데이터 포함으로 LCP 개선
 * - 상태 관리 통합: Jotai + TanStack Query로 클라이언트/서버 상태 분리
 * - 타입 안전성: TanStack Router의 타입 안전한 네비게이션
 * - 성능 최적화: atomWithQuery의 자동 캐싱 및 중복 요청 방지
 * - 접근성: 키보드 네비게이션, 스크린 리더 지원
 *
 * 데이터 플로우:
 * URL params → atoms → atomWithQuery → server → UI
 *             ↑                                ↓
 *           user actions ← ← ← ← ← ← ← ← ← ← ← ←
 *
 * @example
 * ```tsx
 * // 기본 사용법 - SSR과 함께 사용
 * <ExamSheetListTab />
 *
 * // 부모 컴포넌트에서 통합 사용 예시
 * function ExamSheetManagement() {
 *   return (
 *     <div className="exam-sheet-dashboard">
 *       <ExamSheetListTab />
 *     </div>
 *   );
 * }
 * ```
 */
export function ExamSheetListTab() {
  // TanStack Router navigation 훅
  const navigate = useNavigate();

  // Jotai atoms에서 상태 읽기
  const {
    sheets,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isEmpty,
    isPending,
    isError,
    error,
  } = useAtomValue(filteredSheetListAtom);

  const searchKeyword = useAtomValue(sheetSearchKeywordAtom);
  const selectedGrade = useAtomValue(selectedSheetGradeAtom);
  const sortField = useAtomValue(sheetSortAtom);
  const sortDirection = useAtomValue(sheetSortDirectionAtom);

  // Jotai atoms 설정 함수들
  const setSearchKeyword = useSetAtom(setSheetSearchKeywordAtom);
  const setSheetPage = useSetAtom(setSheetPageAtom);
  const setSheetSort = useSetAtom(setSheetSortAtom);

  logger.info("ExamSheetListTab rendered", {
    totalElements,
    currentPage,
    pageSize,
    isPending,
    isError,
  });

  // 로컬 UI 상태 (모달, 선택 등)
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [selectedSheet, setSelectedSheet] = useState<ExamSheet | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [searchScope, setSearchScope] = useState<
    "both" | "unitName" | "examName"
  >("both");

  // 문제 모달 관련 상태
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [currentProblemNumber, setCurrentProblemNumber] = useState(1);
  const [currentExamSheet, setCurrentExamSheet] = useState<ExamSheet | null>(
    null,
  );

  // 이벤트 핸들러들
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      const currentPageIds = sheets.map((sheet: ExamSheet) => sheet.id);

      if (checked) {
        setSelectedIds((prev) => new Set([...prev, ...currentPageIds]));
      } else {
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          currentPageIds.forEach((id) => newSet.delete(id));
          return newSet;
        });
      }
    },
    [sheets],
  );

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleOpenPrint = useCallback((sheet: ExamSheet) => {
    setSelectedSheet(sheet);
    setIsPrintModalOpen(true);
  }, []);

  const handleOpenProblemModal = useCallback((sheet: ExamSheet) => {
    setCurrentExamSheet(sheet);
    setCurrentProblemNumber(1);
    setIsProblemModalOpen(true);
  }, []);

  const handleOpenAnswerModal = useCallback((sheet: ExamSheet) => {
    console.log("답안 모달 열기:", sheet);
    alert(`${sheet.examName}의 답안을 확인합니다.`);
  }, []);

  const handleDelete = useCallback((sheet: ExamSheet) => {
    console.log("시험지 삭제:", sheet);
    if (confirm(`${sheet.examName}을(를) 삭제하시겠습니까?`)) {
      alert(`${sheet.examName}이(가) 삭제되었습니다.`);
    }
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    const selectedSheets = sheets.filter((sheet: ExamSheet) =>
      selectedIds.has(sheet.id),
    );
    const sheetNames = selectedSheets
      .map((sheet: ExamSheet) => sheet.examName)
      .join(", ");

    if (
      confirm(
        `선택된 ${selectedIds.size}개의 시험지(${sheetNames})를 삭제하시겠습니까?`,
      )
    ) {
      alert(`${selectedIds.size}개의 시험지가 삭제되었습니다.`);
      setSelectedIds(new Set());
    }
  }, [sheets, selectedIds]);

  // TanStack Router navigate를 사용한 정렬 처리 함수
  const handleSort = useCallback(
    (field: "examName" | "createdAt") => {
      const currentDirection = sortDirection;
      const newDirection =
        sortField === field
          ? currentDirection === "asc"
            ? "desc"
            : "asc"
          : "asc";

      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          sort: field,
          direction: newDirection,
          page: 0, // 정렬 변경 시 첫 페이지로 이동
        }),
      });
    },
    [navigate, sortField, sortDirection],
  );

  // TanStack Router navigate를 사용한 페이지 변경 처리 함수
  const handlePageChange = useCallback(
    (newPage: number) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          page: newPage - 1, // 1-based를 0-based로 변환
        }),
      });
    },
    [navigate],
  );

  // TanStack Router navigate를 사용한 검색 처리 함수
  const handleSearchChange = useCallback(
    (value: string) => {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          search: value.trim() || undefined,
          page: 0, // 검색어 변경 시 첫 페이지로 이동
        }),
      });
    },
    [navigate],
  );

  // 현재 페이지의 전체 선택 상태 계산
  const currentPageIds = sheets.map((sheet: ExamSheet) => sheet.id);
  const selectedCurrentPageIds = currentPageIds.filter((id) =>
    selectedIds.has(id),
  );
  const isAllSelected =
    selectedCurrentPageIds.length === currentPageIds.length &&
    currentPageIds.length > 0;
  const isIndeterminate =
    selectedCurrentPageIds.length > 0 &&
    selectedCurrentPageIds.length < currentPageIds.length;

  // 모달 핸들러들
  const handleClosePrintModal = useCallback(() => {
    setIsPrintModalOpen(false);
    setSelectedSheet(null);
  }, []);

  const handleCloseProblemModal = useCallback(() => {
    setIsProblemModalOpen(false);
    setCurrentExamSheet(null);
    setCurrentProblemNumber(1);
  }, []);

  const handlePreviousProblem = useCallback(() => {
    if (currentProblemNumber > 1) {
      setCurrentProblemNumber(currentProblemNumber - 1);
    }
  }, [currentProblemNumber]);

  const handleNextProblem = useCallback(() => {
    if (
      currentExamSheet &&
      currentProblemNumber < currentExamSheet.totalQuestions
    ) {
      setCurrentProblemNumber(currentProblemNumber + 1);
    }
  }, [currentExamSheet, currentProblemNumber]);

  // 가상의 문제 데이터 생성 함수
  const generateProblemData = useCallback((examSheet: ExamSheet) => {
    const problems = [];
    for (let i = 1; i <= examSheet.totalQuestions; i++) {
      problems.push({
        number: i,
        text: `${examSheet.unitSummary?.unitDetails?.[0]?.unitName || "단원"} - ${i}번 문제입니다. 이 문제는 ${examSheet.examName}의 ${i}번째 문제로, 수학적 사고력을 요구하는 문제입니다.`,
        image: `/path/to/problem${i}-image.png`,
      });
    }
    return problems;
  }, []);

  const currentProblemData = currentExamSheet
    ? generateProblemData(currentExamSheet)
    : [];
  const currentProblem = currentProblemData.find(
    (p) => p.number === currentProblemNumber,
  );

  // 로딩 상태 처리
  if (isPending) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="text-[2.5rem] font-bold flex-shrink-0">문제지 목록</div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-lg text-muted-foreground">로딩 중...</div>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="text-[2.5rem] font-bold flex-shrink-0">문제지 목록</div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-lg text-red-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="text-[2.5rem] font-bold flex-shrink-0">문제지 목록</div>

      {/* 1. 툴바 영역: 필터와 검색 */}
      <Toolbar
        searchKeyword={searchKeyword}
        onSearchChange={handleSearchChange}
        searchScope={searchScope}
        onSearchScopeChange={(value) =>
          setSearchScope(value as "both" | "unitName" | "examName")
        }
        searchScopeOptions={[
          { value: "both", label: "단원정보+문제지명" },
          { value: "unitName", label: "단원정보" },
          { value: "examName", label: "문제지명" },
        ]}
        selectedCount={selectedIds.size}
        onDelete={handleDeleteSelected}
      />

      {/* 2. 테이블 컴포넌트 - 스크롤 영역 */}
      <div className="flex-1 min-h-0">
        <ExamSheetTable
          sheets={sheets}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onSelect={handleSelect}
          onOpenPrint={handleOpenPrint}
          onOpenProblemModal={handleOpenProblemModal}
          onOpenAnswerModal={handleOpenAnswerModal}
          sortField={sortField as "examName" | "createdAt" | undefined}
          sortOrder={
            (sortDirection?.toLowerCase?.() || "desc") as "asc" | "desc"
          }
          onSort={handleSort}
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
        />
      </div>

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination
        currentPage={currentPage + 1} // 0-based를 1-based로 변환
        totalPages={totalPages}
        onPageChange={handlePageChange}
        className="flex-shrink-0"
      />

      {/* 인쇄 옵션 모달 */}
      <PrintOptionsModal
        isOpen={isPrintModalOpen}
        onClose={handleClosePrintModal}
        onConfirm={(selectedItems) => {
          console.log("선택된 인쇄 항목:", selectedItems);
          console.log("선택된 시험지:", selectedSheet);
        }}
      />

      {/* 문제 모달 */}
      {currentProblem && currentExamSheet && (
        <ProblemModal
          isOpen={isProblemModalOpen}
          onClose={handleCloseProblemModal}
          problemNumber={currentProblem.number}
          problemText={currentProblem.text}
          geometryImage={currentProblem.image}
          hasPrevious={currentProblemNumber > 1}
          hasNext={currentProblemNumber < currentExamSheet.totalQuestions}
          onPrevious={handlePreviousProblem}
          onNext={handleNextProblem}
        />
      )}
    </div>
  );
}

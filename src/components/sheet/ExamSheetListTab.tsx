import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAtomValue, useSetAtom } from "jotai";
import { PagePagination } from "@/components/layout/PagePagination";
import { ProblemModal } from "@/components/layout/ProblemModal";
import { Button } from "@/components/ui/button";
import { ExamTable } from "@/components/exam/ExamListTable";
import { ExamSheetTable } from "./ExamSheetTable";
import { ExamPrintModal } from "@/components/exam/ExamPrintModal";
import { currentExamListAtom, examSearchSummaryAtom } from "@/atoms/exam";
import { filteredSheetListAtom } from "@/atoms/sheetFilters";
import {
  examPageAtom,
  examPageSizeAtom,
  examSortAtom,
  setExamPageAtom,
} from "@/atoms/examFilters";
import type { Exam } from "@/types/exam";
import type { ExamSheet } from "@/types/exam-sheet";
import logger from "@/utils/logger";

/**
 * ExamSheetListTab 컴포넌트 Props
 */
type ExamSheetListTabProps = {
  /** 데이터 소스 타입 - "exam" 또는 "sheet" */
  dataType?: "exam" | "sheet";
};

/**
 * 시험/문제지 목록 관리 탭 컴포넌트
 * @description 시험 목록 또는 문제지 목록을 종합적으로 관리하는 메인 대시보드 컴포넌트
 *
 * 주요 기능:
 * - atomWithQuery를 통한 서버 상태 관리 및 SSR 지원
 * - Jotai atoms를 통한 클라이언트 상태 관리 (페이징, 정렬)
 * - 시험/문제지 목록 조회 및 표시 (테이블 형태의 구조화된 뷰)
 * - 대량 선택을 통한 일괄 관리 (체크박스 기반 다중 선택)
 * - 동적 정렬 기능 (시험명/문제지명, 생성일시 기준)
 * - 페이지네이션을 통한 성능 최적화
 * - 시험/문제지별 상세 액션 (인쇄, 상세보기, 삭제)
 * - TanStack Router를 통한 URL 동기화
 *
 * @example
 * ```tsx
 * // 시험 목록으로 사용
 * <ExamSheetListTab dataType="exam" />
 *
 * // 문제지 목록으로 사용
 * <ExamSheetListTab dataType="sheet" />
 * ```
 */
export function ExamSheetListTab({ dataType = "exam" }: ExamSheetListTabProps) {
  // TanStack Router navigation 훅
  const navigate = useNavigate();

  // 데이터 타입에 따라 다른 atoms 사용
  const examData = useAtomValue(currentExamListAtom);
  const sheetData = useAtomValue(filteredSheetListAtom);
  const examSearchSummary = useAtomValue(examSearchSummaryAtom);

  // 현재 데이터 소스에 따른 데이터 선택
  const currentData = dataType === "exam" ? examData : sheetData;
  const exams = dataType === "exam" ? examData.exams : sheetData.sheets;
  const pagination =
    dataType === "exam"
      ? examData.pagination
      : {
          currentPage: sheetData.currentPage,
          totalPages: sheetData.totalPages,
          totalElements: sheetData.totalElements,
          size: sheetData.pageSize,
          hasNext: sheetData.currentPage < sheetData.totalPages - 1,
          hasPrev: sheetData.currentPage > 0,
        };
  const isLoading =
    dataType === "exam" ? examData.isLoading : sheetData.isPending;
  const isError = dataType === "exam" ? examData.isError : sheetData.isError;
  const error = dataType === "exam" ? examData.error : sheetData.error;
  const searchSummary =
    dataType === "exam"
      ? examSearchSummary
      : { totalResults: sheetData.totalElements };

  const currentPage = useAtomValue(examPageAtom);
  const pageSize = useAtomValue(examPageSizeAtom);
  const sortField = useAtomValue(examSortAtom);

  // Jotai atoms 설정 함수들
  const setExamPage = useSetAtom(setExamPageAtom);

  logger.info("ExamSheetListTab rendered", {
    totalElements: searchSummary.totalResults,
    currentPage,
    pageSize,
    isLoading,
    isError,
  });

  // 로컬 UI 상태 (모달, 선택 등)
  const [selectedIds, setSelectedIds] = useState(new Set<string>());
  const [searchScope, setSearchScope] = useState<"both" | "examName" | "grade">(
    "both",
  );

  // 문제 모달 관련 상태
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [currentProblemNumber, setCurrentProblemNumber] = useState(1);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);

  // 프린트 모달 관련 상태
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printModalExamId, setPrintModalExamId] = useState<string | null>(null);

  // 이벤트 핸들러들
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      let currentPageIds: string[];

      if (dataType === "exam") {
        currentPageIds = (exams as Exam[]).map((exam: Exam) => exam.id);
      } else {
        currentPageIds = (exams as ExamSheet[]).map(
          (sheet: ExamSheet) => sheet.id,
        );
      }

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
    [exams, dataType],
  );

  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleOpenPrint = useCallback((item: Exam | ExamSheet) => {
    setPrintModalExamId(item.id);
    setIsPrintModalOpen(true);
  }, []);

  const handleOpenProblemModal = useCallback(
    (item: Exam | ExamSheet) => {
      if (dataType === "exam") {
        setCurrentExam(item as Exam);
      } else {
        // 문제지의 경우 Exam 타입으로 변환
        const sheet = item as ExamSheet;
        setCurrentExam({
          id: sheet.id,
          examName: sheet.examName,
          grade: 1, // 기본값
          content: "",
          qrCodeUrl: null,
          createdAt: sheet.createdAt || "",
        } as Exam);
      }
      setCurrentProblemNumber(1);
      setIsProblemModalOpen(true);
    },
    [dataType],
  );

  const handleOpenAnswerModal = useCallback(
    (item: Exam | ExamSheet) => {
      const name =
        dataType === "exam"
          ? (item as Exam).examName
          : (item as ExamSheet).examName;
      console.log("답안 모달 열기:", item);
      alert(`${name}의 답안을 확인합니다.`);
    },
    [dataType],
  );

  const handleDelete = useCallback(
    (item: Exam | ExamSheet) => {
      const name =
        dataType === "exam"
          ? (item as Exam).examName
          : (item as ExamSheet).examName;
      const type = dataType === "exam" ? "시험" : "문제지";
      console.log(`${type} 삭제:`, item);
      if (confirm(`${name}을(를) 삭제하시겠습니까?`)) {
        alert(`${name}이(가) 삭제되었습니다.`);
      }
    },
    [dataType],
  );

  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    let selectedItems: (Exam | ExamSheet)[];
    let itemNames: string;

    if (dataType === "exam") {
      const examItems = (exams as Exam[]).filter((exam: Exam) =>
        selectedIds.has(exam.id),
      );
      selectedItems = examItems;
      itemNames = examItems.map((exam: Exam) => exam.examName).join(", ");
    } else {
      const sheetItems = (exams as ExamSheet[]).filter((sheet: ExamSheet) =>
        selectedIds.has(sheet.id),
      );
      selectedItems = sheetItems;
      itemNames = sheetItems
        .map((sheet: ExamSheet) => sheet.examName)
        .join(", ");
    }

    const type = dataType === "exam" ? "시험" : "문제지";

    if (
      confirm(
        `선택된 ${selectedIds.size}개의 ${type}(${itemNames})을 삭제하시겠습니까?`,
      )
    ) {
      alert(`${selectedIds.size}개의 ${type}이 삭제되었습니다.`);
      setSelectedIds(new Set());
    }
  }, [exams, selectedIds, dataType]);

  // 페이지 변경 처리 함수
  const handlePageChange = useCallback(
    (newPage: number) => {
      setExamPage(newPage - 1); // 1-based를 0-based로 변환
    },
    [setExamPage],
  );

  // 현재 페이지의 전체 선택 상태 계산
  let currentPageIds: string[];
  if (dataType === "exam") {
    currentPageIds = (exams as Exam[]).map((exam: Exam) => exam.id);
  } else {
    currentPageIds = (exams as ExamSheet[]).map((sheet: ExamSheet) => sheet.id);
  }
  const selectedCurrentPageIds = currentPageIds.filter((id: string) =>
    selectedIds.has(id),
  );
  const isAllSelected =
    selectedCurrentPageIds.length === currentPageIds.length &&
    currentPageIds.length > 0;
  const isIndeterminate =
    selectedCurrentPageIds.length > 0 &&
    selectedCurrentPageIds.length < currentPageIds.length;

  // 모달 핸들러들

  const handleCloseProblemModal = useCallback(() => {
    setIsProblemModalOpen(false);
    setCurrentExam(null);
    setCurrentProblemNumber(1);
  }, []);

  const handleClosePrintModal = useCallback(() => {
    setIsPrintModalOpen(false);
    setPrintModalExamId(null);
  }, []);

  const handlePreviousProblem = useCallback(() => {
    if (currentProblemNumber > 1) {
      setCurrentProblemNumber(currentProblemNumber - 1);
    }
  }, [currentProblemNumber]);

  const handleNextProblem = useCallback(() => {
    // 기본적으로 10문제로 설정
    const totalQuestions = 10;
    if (currentProblemNumber < totalQuestions) {
      setCurrentProblemNumber(currentProblemNumber + 1);
    }
  }, [currentProblemNumber]);

  // 가상의 문제 데이터 생성 함수
  const generateProblemData = useCallback((exam: Exam) => {
    const problems = [];
    // 기본적으로 10문제로 설정
    const totalQuestions = 10;
    for (let i = 1; i <= totalQuestions; i++) {
      problems.push({
        number: i,
        text: `${exam.grade || "학년"} - ${i}번 문제입니다. 이 문제는 ${exam.examName}의 ${i}번째 문제로, 수학적 사고력을 요구하는 문제입니다.`,
        image: `/path/to/problem${i}-image.png`,
      });
    }
    return problems;
  }, []);

  const currentProblemData = currentExam
    ? generateProblemData(currentExam)
    : [];
  const currentProblem = currentProblemData.find(
    (p) => p.number === currentProblemNumber,
  );

  const title = dataType === "exam" ? "시험 목록" : "문제지 목록";

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-4">
        <div className="text-[2.5rem] font-bold flex-shrink-0">{title}</div>
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
        <div className="text-[2.5rem] font-bold flex-shrink-0">{title}</div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="text-lg text-red-500">
            데이터를 불러오는 중 오류가 발생했습니다.
          </div>
        </div>
      </div>
    );
  }

  const itemType = dataType === "exam" ? "시험" : "문제지";

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="text-[2.5rem] font-bold flex-shrink-0">{title}</div>

      {/* 1. 툴바 영역 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            총 {searchSummary.totalResults}개 {itemType}
          </span>
          {selectedIds.size > 0 && (
            <span className="text-sm text-blue-600">
              {selectedIds.size}개 선택됨
            </span>
          )}
        </div>
        {selectedIds.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
          >
            선택 삭제
          </Button>
        )}
      </div>

      {/* 2. 테이블 컴포넌트 - 스크롤 영역 */}
      <div className="flex-1 min-h-0">
        {dataType === "exam" ? (
          <ExamTable
            sheets={exams as Exam[]}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelect={handleSelect}
            onOpenPrint={handleOpenPrint}
            onOpenDetail={handleOpenProblemModal}
          />
        ) : (
          <ExamSheetTable
            sheets={exams as ExamSheet[]}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelect={handleSelect}
            onOpenPrint={handleOpenPrint}
            onOpenProblemModal={handleOpenProblemModal}
            onOpenAnswerModal={handleOpenAnswerModal}
            isAllSelected={isAllSelected}
            isIndeterminate={isIndeterminate}
          />
        )}
      </div>

      {/* 3. 페이지네이션 컴포넌트 */}
      <PagePagination
        currentPage={currentPage + 1} // 0-based를 1-based로 변환
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        className="flex-shrink-0"
      />

      {/* 문제 모달 */}
      {currentProblem && currentExam && (
        <ProblemModal
          isOpen={isProblemModalOpen}
          onClose={handleCloseProblemModal}
          problemNumber={currentProblem.number}
          problemText={currentProblem.text}
          geometryImage={currentProblem.image}
          hasPrevious={currentProblemNumber > 1}
          hasNext={currentProblemNumber < 10}
          onPrevious={handlePreviousProblem}
          onNext={handleNextProblem}
        />
      )}

      {/* 프린트 모달 */}
      {printModalExamId && (
        <ExamPrintModal
          isOpen={isPrintModalOpen}
          examId={printModalExamId}
          onClose={handleClosePrintModal}
        />
      )}
    </div>
  );
}

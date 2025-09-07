/**
 * 서버 API 기반 시험 목록 관리 훅
 * @description 실제 서버 API와 연동된 시험 목록 조회 및 관리 기능
 *
 * 주요 변경사항:
 * - 가데이터 완전 제거
 * - 서버 API 직접 연동 (Jotai atomWithQuery 사용)
 * - 실제 서버 응답 구조에 맞춘 데이터 처리
 * - 페이지네이션 지원
 * - 실시간 필터링 (debouncing 포함)
 */

import { useState, useCallback, useMemo } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  currentExamListAtom,
  selectedExamIdAtom,
  selectExamAtom,
  examSearchSummaryAtom,
} from "@/atoms/exam";
import {
  searchKeywordAtom,
  selectedGradeAtom,
  setSearchKeywordAtom,
  setSelectedGradeAtom,
  setExamPageAtom,
  nextPageAtom,
  prevPageAtom,
  resetAllFiltersAtom,
  filterSummaryAtom,
} from "@/atoms/examFilters";
import type { Exam } from "@/types/exam";

/**
 * 모달 상태 타입
 * @description 시험 관련 모달 상태 관리
 */
type ModalState = "printPreview" | "examDetail" | "submissionStatus" | null;

/**
 * 서버 API 기반 시험 목록 관리 훅
 *
 * 주요 기능:
 * - 실제 서버 API를 통한 시험 목록 조회
 * - 학년별, 검색어별 실시간 필터링
 * - 페이지네이션 지원 (서버 사이드)
 * - 시험 선택 및 상세보기 모달 관리
 * - 로딩, 에러 상태 관리
 * - 캐시 기반 성능 최적화
 *
 * @returns 시험 목록 데이터와 관련 액션들
 */
export function useExamListWithFilters() {
  // 서버 상태 (atomWithQuery로 자동 관리)
  const examListData = useAtomValue(currentExamListAtom);
  const searchSummary = useAtomValue(examSearchSummaryAtom);
  const filterSummary = useAtomValue(filterSummaryAtom);
  const selectedExamId = useAtomValue(selectedExamIdAtom);

  // 필터 상태 (atom 직접 읽기)
  const searchKeyword = useAtomValue(searchKeywordAtom);
  const selectedGrade = useAtomValue(selectedGradeAtom);

  // 액션 함수들 (atom setter)
  const setSearchKeyword = useSetAtom(setSearchKeywordAtom);
  const setSelectedGrade = useSetAtom(setSelectedGradeAtom);
  const setExamPage = useSetAtom(setExamPageAtom);
  const nextPage = useSetAtom(nextPageAtom);
  const prevPage = useSetAtom(prevPageAtom);
  const resetFilters = useSetAtom(resetAllFiltersAtom);
  const selectExam = useSetAtom(selectExamAtom);

  // 로컬 UI 상태
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [selectedSheet, setSelectedSheet] = useState<Exam | null>(null);

  /**
   * 검색어 변경 핸들러
   * @description debouncing 없이 즉시 반영 (atom에서 페이지 리셋 처리)
   */
  const handleSearchChange = useCallback(
    (keyword: string) => {
      setSearchKeyword(keyword);
    },
    [setSearchKeyword],
  );

  /**
   * 학년 변경 핸들러
   * @description 학년 변경 시 페이지 자동 리셋
   */
  const handleGradeChange = useCallback(
    (grade: string) => {
      setSelectedGrade(grade);
    },
    [setSelectedGrade],
  );

  /**
   * 페이지 변경 핸들러
   * @description 안전한 페이지 변경 (범위 체크)
   */
  const handlePageChange = useCallback(
    (page: number) => {
      const maxPage = Math.max(0, examListData.pagination.totalPages - 1);
      const safePage = Math.max(0, Math.min(page, maxPage));
      setExamPage(safePage);
    },
    [setExamPage, examListData.pagination.totalPages],
  );

  /**
   * 다음 페이지 핸들러
   */
  const handleNextPage = useCallback(() => {
    if (examListData.pagination.hasNext) {
      nextPage();
    }
  }, [nextPage, examListData.pagination.hasNext]);

  /**
   * 이전 페이지 핸들러
   */
  const handlePrevPage = useCallback(() => {
    if (examListData.pagination.hasPrev) {
      prevPage();
    }
  }, [prevPage, examListData.pagination.hasPrev]);

  /**
   * 필터 초기화 핸들러
   */
  const handleResetFilters = useCallback(() => {
    resetFilters();
    setSelectedIds(new Set()); // 선택 항목도 초기화
  }, [resetFilters]);

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(examListData.exams.map((exam) => exam.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [examListData.exams],
  );

  /**
   * 개별 선택/해제 핸들러
   */
  const handleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  /**
   * 시험 상세보기 모달 열기
   */
  const handleOpenDetail = useCallback(
    (exam: Exam) => {
      setSelectedSheet(exam);
      selectExam(exam.id);
      setActiveModal("examDetail");
    },
    [selectExam],
  );

  /**
   * 제출 현황 모달 열기
   */
  const handleOpenSubmissionStatus = useCallback(
    (exam: Exam) => {
      setSelectedSheet(exam);
      selectExam(exam.id);
      setActiveModal("submissionStatus");
    },
    [selectExam],
  );

  /**
   * 인쇄 미리보기 모달 열기
   */
  const handleOpenPrint = useCallback((exam: Exam) => {
    setSelectedSheet(exam);
    setActiveModal("printPreview");
  }, []);

  /**
   * 모달 닫기 핸들러
   */
  const handleCloseModal = useCallback(() => {
    setActiveModal(null);
    setSelectedSheet(null);
    // 선택된 시험 ID는 유지 (상세 정보 캐시 유지)
  }, []);

  /**
   * 선택 항목 초기화 핸들러
   */
  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * 시험 삭제 핸들러 (TODO: 실제 API 연동 필요)
   */
  const handleDeleteSelected = useCallback(() => {
    console.warn(
      "[TODO] 선택된 시험 삭제 API 연동 필요:",
      Array.from(selectedIds),
    );
    // TODO: 실제 삭제 API 호출
    // await deleteExams(Array.from(selectedIds));
    setSelectedIds(new Set());
  }, [selectedIds]);

  /**
   * 개별 시험 삭제 핸들러 (TODO: 실제 API 연동 필요)
   */
  const handleDelete = useCallback((id: string) => {
    console.warn("[TODO] 개별 시험 삭제 API 연동 필요:", id);
    // TODO: 실제 삭제 API 호출
    // await deleteExam(id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * 선택 상태 계산
   */
  const selectionState = useMemo(() => {
    const totalCount = examListData.exams.length;
    const selectedCount = selectedIds.size;
    const allSelected = totalCount > 0 && selectedCount === totalCount;
    const someSelected = selectedCount > 0 && selectedCount < totalCount;

    return {
      allSelected,
      someSelected,
      selectedCount,
      totalCount,
      hasSelection: selectedCount > 0,
    };
  }, [examListData.exams.length, selectedIds.size]);

  /**
   * 데이터 상태 정보
   */
  const dataState = useMemo(() => {
    return {
      hasData: examListData.exams.length > 0,
      hasError: examListData.isError,
      isLoading: examListData.isLoading,
      isFetching: examListData.isFetching,
      error: examListData.error,
      isEmpty: !examListData.isLoading && examListData.exams.length === 0,
      isFiltered:
        filterSummary.hasSearchKeyword || filterSummary.hasGradeFilter,
    };
  }, [examListData, filterSummary]);

  return {
    // 데이터 상태
    exams: examListData.exams,
    pagination: examListData.pagination,
    searchSummary,
    filterSummary,
    dataState,
    selectionState,

    // UI 상태
    selectedIds,
    activeModal,
    selectedSheet,
    selectedExamId,
    searchKeyword,
    selectedGrade,

    // 필터 및 페이지네이션 액션
    handleSearchChange,
    handleGradeChange,
    handlePageChange,
    handleNextPage,
    handlePrevPage,
    handleResetFilters,

    // 선택 관련 액션
    handleSelectAll,
    handleSelect,
    handleClearSelection,

    // 모달 관련 액션
    handleOpenDetail,
    handleOpenSubmissionStatus,
    handleOpenPrint,
    handleCloseModal,

    // 데이터 조작 액션 (TODO: API 연동)
    handleDeleteSelected,
    handleDelete,
  };
}

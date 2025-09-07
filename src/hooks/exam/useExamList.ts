import { useState, useMemo, useCallback, useEffect } from "react";
import type {
  Exam,
  ExamSubmitStatusDetail,
  SearchScope,
  ExamListFilters,
} from "@/types/exam";
// TODO: 서버 API에서 시험 데이터를 가져오도록 수정 필요

/**
 * 시험 목록 관리 커스텀 훅
 * @description 시험 목록의 상태 관리와 비즈니스 로직을 담당
 *
 * 주요 기능:
 * - 시험 목록 필터링 및 검색
 * - 선택된 항목 관리
 * - 모달 상태 관리
 * - 삭제 기능
 * - 새로운 시험 추가 기능
 */
export function useExamList() {
  // 검색 및 필터 상태
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("1");

  // 선택된 항목 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 모달 상태 관리
  const [activeModal, setActiveModal] = useState<"detail" | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<Exam | null>(null);

  // 시험 목록 상태 (가변적)
  // TODO: 서버 API에서 시험 목록을 가져오도록 수정 필요
  const [examList, setExamList] = useState<Exam[]>([]);

  // 시험 제출 현황 데이터는 서버 API에서 가져옴

  /**
   * 새로운 시험 추가 함수
   * @description 시험 출제 완료 후 목록 상단에 새로운 시험을 추가
   */
  const addNewExam = useCallback((newExam: Omit<Exam, "id" | "createdAt">) => {
    const now = new Date().toISOString().split("T")[0]; // YYYY-MM-DD 형식
    const examId = `exam-${Date.now()}`; // 고유 ID 생성

    const examToAdd: Exam = {
      ...newExam,
      id: examId,
      createdAt: now,
    };

    // 목록 상단에 추가 (최신순)
    setExamList((prev) => [examToAdd, ...prev]);

    return examId;
  }, []);

  /**
   * localStorage에서 새로운 시험 로드
   * @description 페이지 로드 시 localStorage에서 새로운 시험들을 로드
   */
  useEffect(() => {
    try {
      // SSR 호환성: 브라우저 환경에서만 localStorage 접근
      if (typeof window === "undefined") {
        return;
      }

      const newExams = JSON.parse(localStorage.getItem("newExams") || "[]");
      if (newExams.length > 0) {
        // 새로운 시험들을 목록에 추가
        newExams.forEach((newExam: any) => {
          addNewExam(newExam);
        });
        // localStorage에서 제거
        localStorage.removeItem("newExams");
      }
    } catch (error) {
      console.error("새로운 시험 로드 실패:", error);
    }
  }, [addNewExam]);

  /**
   * 실제 서버에서 참여 현황 정보를 가져와서 시험 데이터와 연동
   * @description 서버 API 연동을 위해 추후 수정 필요
   */
  const getExamDataWithRealParticipation = useMemo(() => {
    // TODO: 서버 API에서 참여 현황 데이터를 가져와서 연동하도록 수정 필요
    return examList.map((exam) => exam);
  }, [examList]);

  /**
   * 필터링된 시험 목록 계산
   */
  const filteredSheets = useMemo(() => {
    return getExamDataWithRealParticipation.filter((sheet) => {
      const matchesKeyword =
        searchKeyword.trim() === "" ||
        (searchScope === "all" &&
          (sheet.examName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            sheet.content
              ?.toLowerCase()
              .includes(searchKeyword.toLowerCase()))) ||
        (searchScope === "content" &&
          sheet.content?.toLowerCase().includes(searchKeyword.toLowerCase())) ||
        (searchScope === "examName" &&
          sheet.examName.toLowerCase().includes(searchKeyword.toLowerCase()));

      return matchesKeyword;
    });
  }, [getExamDataWithRealParticipation, searchKeyword, searchScope]);

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(filteredSheets.map((sheet) => sheet.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [filteredSheets],
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
   * 선택된 항목 삭제 핸들러
   */
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;

    const sheetNames = Array.from(selectedIds)
      .map(
        (id) =>
          getExamDataWithRealParticipation.find((sheet) => sheet.id === id)
            ?.examName,
      )
      .filter(Boolean)
      .join(", ");

    if (
      confirm(
        `선택된 ${selectedIds.size}개의 시험(${sheetNames})을 삭제하시겠습니까?`,
      )
    ) {
      // 실제로는 API 호출
      console.log("삭제할 시험 ID들:", Array.from(selectedIds));

      // 목록에서 삭제
      setExamList((prev) => prev.filter((exam) => !selectedIds.has(exam.id)));
      setSelectedIds(new Set());

      alert(`${selectedIds.size}개의 시험이 삭제되었습니다.`);
    }
  }, [selectedIds, getExamDataWithRealParticipation]);

  /**
   * 개별 시험 삭제 핸들러
   */
  const handleDelete = useCallback(
    (id: string) => {
      const sheet = getExamDataWithRealParticipation.find((p) => p.id === id);
      if (!sheet) return;

      if (confirm(`"${sheet.examName}" 시험을 삭제하시겠습니까?`)) {
        // 실제로는 API 호출
        console.log("시험 삭제:", sheet);

        // 목록에서 삭제
        setExamList((prev) => prev.filter((exam) => exam.id !== id));

        alert("시험이 삭제되었습니다.");
      }
    },
    [getExamDataWithRealParticipation],
  );

  /**
   * 인쇄 모달 열기 핸들러
   */
  const handleOpenPrint = useCallback((sheet: Exam) => {
    console.log("인쇄 모달 열기:", sheet);
    // TODO: 인쇄 모달 구현
    alert("인쇄 기능은 추후 구현 예정입니다.");
  }, []);

  /**
   * 상세 모달 열기 핸들러
   */
  const handleOpenDetail = useCallback((sheet: Exam) => {
    setSelectedSheet(sheet);
    setActiveModal("detail");
  }, []);

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = useCallback(() => {
    setActiveModal(null);
    setSelectedSheet(null);
  }, []);

  /**
   * 필터 상태 객체
   */
  const filters: ExamListFilters = {
    searchKeyword,
    searchScope,
    selectedGrade,
  };

  return {
    // 상태
    sheets: examList,
    filteredSheets,
    selectedIds,
    activeModal,
    selectedSheet,
    filters,
    // fakeExamSubmitStatusDetail removed - now using server API

    // 액션
    setSearchKeyword,
    setSearchScope,
    setSelectedGrade,
    handleSelectAll,
    handleSelect,
    handleDeleteSelected,
    handleDelete,
    handleOpenPrint,
    handleOpenDetail,
    handleClose,
    addNewExam, // 새로운 시험 추가 함수
  };
}

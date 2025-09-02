/**
 * 고급 필터링을 지원하는 시험 목록 훅
 * @description 시험 목록의 종합적인 필터링 및 관리 기능을 제공하는 커스텀 훅
 */

import { useState, useCallback, useMemo } from "react";
import { useAtomValue } from "jotai";
import {
  searchKeywordAtom,
  searchScopeAtom,
  statusFiltersAtom,
  difficultyFiltersAtom,
  dateRangeFiltersAtom,
  questionCountRangeAtom,
  participationRateRangeAtom,
  unitFiltersAtom,
  examTypeFiltersAtom,
  advancedSearchOptionsAtom,
} from "@/atoms/examFilters";
import type { Exam, ExamStatus, ExamLevel, SearchScope, ExamSubmitStatusDetail, Student, SubmissionStatus } from "@/types/exam";

/**
 * 모달 상태 타입
 */
type ModalState = "printPreview" | "examDetail" | "detail" | null;



/**
 * 필터 옵션 타입
 */
type FilterOptions = {
  availableUnits: string[];
  availableExamTypes: string[];
  availableStatuses: ExamStatus[];
  availableDifficulties: ExamLevel[];
};

/**
 * 가짜 시험 데이터 (실제 API 대신 사용)
 */
const mockExamList: Exam[] = [
  {
    id: "exam-001",
    examName: "2025-1학기 중간고사 대비",
    unitName: "1단원: 다항식의 연산",
    status: "승인완료",
    questionLevel: "보통",
    questionCount: 20,
    actualParticipants: 14,
    totalParticipants: 30,
    createdAt: "2024-03-15T09:00:00Z",
    updatedAt: "2024-03-16T14:30:00Z",
  },
  {
    id: "exam-002",
    examName: "2025-1학기 중간고사 대비",
    unitName: "2단원: 나머지정리와 인수분해",
    status: "승인완료",
    questionLevel: "심화",
    questionCount: 20,
    actualParticipants: 20,
    totalParticipants: 30,
    createdAt: "2024-03-16T10:00:00Z",
    updatedAt: "2024-03-17T15:45:00Z",
  },
  {
    id: "exam-003",
    examName: "2025-1학기 기말고사 대비",
    unitName: "3단원: 유리식과 무리식",
    status: "승인완료",
    questionLevel: "심화",
    questionCount: 25,
    actualParticipants: 10,
    totalParticipants: 30,
    createdAt: "2024-04-20T11:00:00Z",
    updatedAt: "2024-04-21T16:20:00Z",
  },
  {
    id: "exam-004",
    examName: "단원 평가 (A)",
    unitName: "4단원: 이차방정식과 이차함수",
    status: "승인완료",
    questionLevel: "기초",
    questionCount: 20,
    actualParticipants: 15,
    totalParticipants: 30,
    createdAt: "2024-04-10T08:30:00Z",
    updatedAt: "2024-04-11T13:15:00Z",
  },
  {
    id: "exam-005",
    examName: "단원 평가 (B)",
    unitName: "5단원: 여러 가지 방정식",
    status: "승인거부",
    questionLevel: "기초",
    questionCount: 20,
    actualParticipants: 8,
    totalParticipants: 25,
    createdAt: "2024-04-05T14:00:00Z",
    updatedAt: "2024-04-06T09:45:00Z",
  },
  {
    id: "exam-006",
    examName: "기말 대비 모의고사",
    unitName: "6단원: 도형의 방정식",
    status: "승인완료",
    questionLevel: "보통",
    questionCount: 30,
    actualParticipants: 42,
    totalParticipants: 45,
    createdAt: "2024-05-15T12:00:00Z",
    updatedAt: "2024-05-16T10:30:00Z",
  },
];;

/**
 * 가짜 시험 제출 상세 데이터
 */
const mockExamSubmissionDetails: ExamSubmitStatusDetail[] = [
  {
    student: {
      id: "student-001",
      name: "김철수",
      phoneNumber: "010-1234-5678",
      grade: "3학년",
      class: "2반",
      number: 5,
      registeredAt: "2024-03-01T09:00:00Z",
    },
    examName: "2025-1학기 중간고사 대비",
    submissionDate: "2024-03-20T10:30:00Z",
    submissionStatus: "제출완료",
    totalScore: 100,
    earnedScore: 85,
    submissionTime: 45,
    wrongAnswerCount: 3,
  },
  {
    student: {
      id: "student-002",
      name: "이영희",
      phoneNumber: "010-2345-6789",
      grade: "3학년",
      class: "2반",
      number: 12,
      registeredAt: "2024-03-01T09:00:00Z",
    },
    examName: "2025-1학기 중간고사 대비",
    submissionDate: "2024-03-20T11:15:00Z",
    submissionStatus: "제출완료",
    totalScore: 100,
    earnedScore: 92,
    submissionTime: 38,
    wrongAnswerCount: 1,
  },
  {
    student: {
      id: "student-003",
      name: "박민수",
      phoneNumber: "010-3456-7890",
      grade: "3학년",
      class: "2반",
      number: 8,
      registeredAt: "2024-03-01T09:00:00Z",
    },
    examName: "2025-1학기 중간고사 대비",
    submissionDate: "",
    submissionStatus: "미제출",
    totalScore: 100,
    earnedScore: 0,
    submissionTime: 0,
    wrongAnswerCount: 0,
  },
];

/**
 * 고급 필터링을 지원하는 시험 목록 훅
 * 
 * 주요 기능:
 * - 실시간 필터링 (검색어, 상태, 난이도, 날짜 범위 등)
 * - 시험 선택 및 다중 선택 관리
 * - 인쇄 미리보기 및 상세보기 모달 상태 관리
 * - 가용한 필터 옵션 자동 추출
 * - 성과 지표 기반 필터링 (문항 수, 참여율)
 * 
 * @returns 필터링된 시험 목록과 관련 액션들
 */
export function useExamListWithFilters() {
  // 필터 상태들
  const searchKeyword = useAtomValue(searchKeywordAtom);
  const searchScope = useAtomValue(searchScopeAtom);
  const statusFilters = useAtomValue(statusFiltersAtom);
  const difficultyFilters = useAtomValue(difficultyFiltersAtom);
  const dateFilters = useAtomValue(dateRangeFiltersAtom);
  const questionRange = useAtomValue(questionCountRangeAtom);
  const participationRange = useAtomValue(participationRateRangeAtom);
  const unitFilters = useAtomValue(unitFiltersAtom);
  const examTypeFilters = useAtomValue(examTypeFiltersAtom);
  const advancedOptions = useAtomValue(advancedSearchOptionsAtom);

  // 로컬 상태
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<ModalState>(null);
  const [selectedSheet, setSelectedSheet] = useState<Exam | null>(null);

  // 가짜 데이터를 사용한 시험 목록 (실제로는 API 호출)
  const examList = useMemo(() => {
    return mockExamList.map(exam => ({
      ...exam,
      participationRate: Math.round((exam.actualParticipants / exam.totalParticipants) * 100 * 10) / 10,
    }));
  }, []);

  /**
   * 검색어 매칭 함수
   */
  const matchesSearch = useCallback(
    (exam: Exam, keyword: string) => {
      if (!keyword.trim()) return true;

      const searchText = advancedOptions.caseSensitive ? keyword : keyword.toLowerCase();
      const getCompareText = (text: string) => 
        advancedOptions.caseSensitive ? text : text.toLowerCase();

      const examName = getCompareText(exam.examName);
      const unitName = getCompareText(exam.unitName);

      if (advancedOptions.exactMatch) {
        // 정확히 일치하는 검색
        switch (searchScope) {
          case "all":
            return examName === searchText || unitName === searchText;
          case "examName":
            return examName === searchText;
          case "unitName":
            return unitName === searchText;
        }
      } else {
        // 포함 검색 (기본)
        switch (searchScope) {
          case "all":
            return examName.includes(searchText) || unitName.includes(searchText);
          case "examName":
            return examName.includes(searchText);
          case "unitName":
            return unitName.includes(searchText);
        }
      }

      return false;
    },
    [searchScope, advancedOptions],
  );

  /**
   * 날짜 범위 매칭 함수
   */
  const matchesDateRange = useCallback(
    (exam: Exam) => {
      const createdDate = new Date(exam.createdAt);
      const updatedDate = new Date(exam.updatedAt);

      // 생성일 범위 체크
      if (dateFilters.createdFrom && createdDate < dateFilters.createdFrom) {
        return false;
      }
      if (dateFilters.createdTo && createdDate > dateFilters.createdTo) {
        return false;
      }

      // 수정일 범위 체크
      if (dateFilters.updatedFrom && updatedDate < dateFilters.updatedFrom) {
        return false;
      }
      if (dateFilters.updatedTo && updatedDate > dateFilters.updatedTo) {
        return false;
      }

      return true;
    },
    [dateFilters],
  );

  /**
   * 성과 지표 매칭 함수
   */
  const matchesPerformanceRange = useCallback(
    (exam: Exam) => {
      const participationRate = Math.round((exam.actualParticipants / exam.totalParticipants) * 100 * 10) / 10;

      // 문항 수 범위 체크
      if (exam.questionCount < questionRange.min || exam.questionCount > questionRange.max) {
        return false;
      }

      // 참여율 범위 체크
      if (participationRate < participationRange.min || participationRate > participationRange.max) {
        return false;
      }

      return true;
    },
    [questionRange, participationRange],
  );

  /**
   * 필터링된 시험 목록
   */
  const filteredSheets = useMemo(() => {
    return examList.filter((exam) => {
      // 검색어 필터
      if (!matchesSearch(exam, searchKeyword)) {
        return false;
      }

      // 상태 필터
      if (statusFilters.length > 0 && !statusFilters.includes(exam.status)) {
        return false;
      }

      // 난이도 필터
      if (difficultyFilters.length > 0 && !difficultyFilters.includes(exam.questionLevel)) {
        return false;
      }

      // 날짜 범위 필터
      if (!matchesDateRange(exam)) {
        return false;
      }

      // 성과 지표 필터
      if (!matchesPerformanceRange(exam)) {
        return false;
      }

      // 단원 필터
      if (unitFilters.length > 0 && !unitFilters.includes(exam.unitName)) {
        return false;
      }

      // 시험 유형 필터 (현재 Exam 타입에 examType 없음 - 추후 확장 시 사용)
      // if (examTypeFilters.length > 0 && !examTypeFilters.includes(exam.examType || "")) {
      //   return false;
      // }

      return true;
    });
  }, [
    examList,
    searchKeyword,
    statusFilters,
    difficultyFilters,
    unitFilters,
    examTypeFilters,
    matchesSearch,
    matchesDateRange,
    matchesPerformanceRange,
  ]);

  /**
   * 사용 가능한 필터 옵션 추출
   */
  const availableFilterOptions: FilterOptions = useMemo(() => {
    const uniqueUnits = [...new Set(examList.map(exam => exam.unitName))].sort();
    const uniqueExamTypes: string[] = []; // 현재 Exam 타입에 examType 없음 - 추후 확장 시 사용
    const uniqueStatuses = [...new Set(examList.map(exam => exam.status))] as ExamStatus[];
    const uniqueDifficulties = [...new Set(examList.map(exam => exam.questionLevel))] as ExamLevel[];

    return {
      availableUnits: uniqueUnits,
      availableExamTypes: uniqueExamTypes,
      availableStatuses: uniqueStatuses,
      availableDifficulties: uniqueDifficulties,
    };
  }, [examList]);

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
   * 선택된 시험들 삭제 핸들러
   */
  const handleDeleteSelected = useCallback(() => {
    console.log("선택된 시험 삭제:", Array.from(selectedIds));
    // 실제로는 API 호출
    setSelectedIds(new Set());
  }, [selectedIds]);

  /**
   * 개별 시험 삭제 핸들러
   */
  const handleDelete = useCallback((id: string) => {
    console.log("시험 삭제:", id);
    // 실제로는 API 호출
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  /**
   * 인쇄 미리보기 모달 열기
   */
  const handleOpenPrint = useCallback((sheet: Exam) => {
    setSelectedSheet(sheet);
    setActiveModal("printPreview");
  }, []);

  /**
   * 시험 상세보기 모달 열기
   */
  const handleOpenDetail = useCallback((sheet: Exam) => {
    setSelectedSheet(sheet);
    setActiveModal("examDetail");
  }, []);

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = useCallback(() => {
    setActiveModal(null);
    setSelectedSheet(null);
  }, []);

  /**
   * 새 시험 추가 핸들러 (시험 출제 완료 후 호출)
   */
  const addNewExam = useCallback((newExam: {
    examName: string;
    unitName: string;
    status: ExamStatus;
    level: ExamLevel;
    questionCount: number;
  }) => {
    console.log("새 시험 추가:", newExam);
    // 실제로는 API 호출 후 목록 새로고침
    // 현재는 콘솔 로그만 출력
  }, []);

  return {
    // 상태
    sheets: examList,
    filteredSheets,
    selectedIds,
    activeModal,
    selectedSheet,
    fakeExamSubmitStatusDetail: mockExamSubmissionDetails,
    availableFilterOptions,

    // 액션
    handleSelectAll,
    handleSelect,
    handleDeleteSelected,
    handleDelete,
    handleOpenPrint,
    handleOpenDetail,
    handleClose,
    addNewExam,
  };
}
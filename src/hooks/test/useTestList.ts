import { useState, useMemo, useCallback, useEffect } from "react";
import type { Test, TestSubmitStatusDetail, SearchScope, TestListFilters } from "@/types/test";
import { testSubmissionMockData } from "@/data/student-mock-data";
import { dashboardTestSubmissions } from "@/data/test-submission-dashboard";

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
export function useTestList() {
  // 검색 및 필터 상태
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [searchScope, setSearchScope] = useState<SearchScope>("all");
  const [selectedGrade, setSelectedGrade] = useState<string>("중1");

  // 선택된 항목 관리
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 모달 상태 관리
  const [activeModal, setActiveModal] = useState<"detail" | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Test | null>(null);

  // 시험 목록 상태 (가변적)
  const [testList, setTestList] = useState<Test[]>([
    {
      id: "test-001",
      unitName: "1단원: 다항식의 연산",
      testName: "2025-1학기 중간고사 대비",
      questionCount: 20,
      questionLevel: "기초",
      status: "승인완료",
      createdAt: "2025-01-15",
      updatedAt: "2025-01-15",
      totalParticipants: 30,
      actualParticipants: 14, // 46.7% 참여
    },
    {
      id: "test-002",
      unitName: "2단원: 나머지정리와 인수분해",
      testName: "2025-1학기 중간고사 대비",
      questionCount: 20,
      questionLevel: "기초",
      status: "승인완료",
      createdAt: "2025-01-15",
      updatedAt: "2025-01-15",
      totalParticipants: 30,
      actualParticipants: 20, // 66.7% 참여
    },
    {
      id: "test-003",
      unitName: "3단원: 유리식과 무리식",
      testName: "2025-1학기 기말고사 대비",
      questionCount: 25,
      questionLevel: "보통",
      status: "승인대기",
      createdAt: "2025-01-16",
      updatedAt: "2025-01-16",
      totalParticipants: 30,
      actualParticipants: 10, // 33.3% 참여
    },
    {
      id: "test-004",
      unitName: "4단원: 이차방정식과 이차함수",
      testName: "단원 평가 (A)",
      questionCount: 20,
      questionLevel: "기초",
      status: "승인완료",
      createdAt: "2025-01-17",
      updatedAt: "2025-01-17",
      totalParticipants: 30,
      actualParticipants: 15, // 50% 참여
    },
    {
      id: "test-005",
      unitName: "5단원: 여러 가지 방정식",
      testName: "단원 평가 (B)",
      questionCount: 20,
      questionLevel: "보통",
      status: "승인완료",
      createdAt: "2025-01-18",
      updatedAt: "2025-01-18",
      totalParticipants: 25,
      actualParticipants: 8, // 32% 참여
    },
    {
      id: "test-006",
      unitName: "6단원: 도형의 방정식",
      testName: "기말 대비 모의고사",
      questionCount: 30,
      questionLevel: "심화",
      status: "승인완료",
      createdAt: "2025-01-19",
      updatedAt: "2025-01-19",
      totalParticipants: 45,
      actualParticipants: 42, // 93.3% 참여
    },
  ]);

  // 시험 제출 현황 데이터 (새로운 학생 가데이터 사용)
  const fakeTestSubmitStatusDetail: TestSubmitStatusDetail[] = testSubmissionMockData;

  /**
   * 새로운 시험 추가 함수
   * @description 시험 출제 완료 후 목록 상단에 새로운 시험을 추가
   */
  const addNewTest = useCallback((newTest: Omit<Test, 'id' | 'createdAt' | 'updatedAt' | 'totalParticipants' | 'actualParticipants'>) => {
    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const testId = `test-${Date.now()}`; // 고유 ID 생성
    
    const testToAdd: Test = {
      ...newTest,
      id: testId,
      createdAt: now,
      updatedAt: now,
      totalParticipants: 0,
      actualParticipants: 0,
    };

    // 목록 상단에 추가 (최신순)
    setTestList(prev => [testToAdd, ...prev]);
    
    return testId;
  }, []);

  /**
   * localStorage에서 새로운 시험 로드
   * @description 페이지 로드 시 localStorage에서 새로운 시험들을 로드
   */
  useEffect(() => {
    try {
      const newTests = JSON.parse(localStorage.getItem("newTests") || "[]");
      if (newTests.length > 0) {
        // 새로운 시험들을 목록에 추가
        newTests.forEach((newTest: any) => {
          addNewTest(newTest);
        });
        // localStorage에서 제거
        localStorage.removeItem("newTests");
      }
    } catch (error) {
      console.error("새로운 시험 로드 실패:", error);
    }
  }, [addNewTest]);

  /**
   * 실제 가데이터에서 참여 현황 정보를 가져와서 시험 데이터와 연동
   * @description dashboardTestSubmissions의 데이터를 기반으로 동적 계산
   */
  const getTestDataWithRealParticipation = useMemo(() => {
    return testList.map(test => {
      // 대시보드 데이터에서 해당 시험의 실제 참여 현황 찾기
      const dashboardTest = dashboardTestSubmissions.find(dt => dt.id === test.id);
      
      if (dashboardTest) {
        return {
          ...test,
          totalParticipants: dashboardTest.totalStudents,
          actualParticipants: dashboardTest.submittedCount,
        };
      }
      
      // 대시보드 데이터에 없는 경우 기본값 사용
      return test;
    });
  }, [testList, dashboardTestSubmissions]);

  /**
   * 필터링된 시험 목록 계산
   */
  const filteredPapers = useMemo(() => {
    return getTestDataWithRealParticipation.filter((paper) => {
      const matchesKeyword = searchKeyword.trim() === "" || 
        (searchScope === "all" && (
          paper.unitName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          paper.testName.toLowerCase().includes(searchKeyword.toLowerCase())
        )) ||
        (searchScope === "unitName" && 
          paper.unitName.toLowerCase().includes(searchKeyword.toLowerCase())
        ) ||
        (searchScope === "testName" && 
          paper.testName.toLowerCase().includes(searchKeyword.toLowerCase())
        );

      return matchesKeyword;
    });
  }, [getTestDataWithRealParticipation, searchKeyword, searchScope]);

  /**
   * 전체 선택/해제 핸들러
   */
  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredPapers.map((paper) => paper.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [filteredPapers]);

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

    const paperNames = Array.from(selectedIds)
      .map((id) => getTestDataWithRealParticipation.find((paper) => paper.id === id)?.testName)
      .filter(Boolean)
      .join(", ");

    if (
      confirm(
        `선택된 ${selectedIds.size}개의 시험(${paperNames})을 삭제하시겠습니까?`,
      )
    ) {
      // 실제로는 API 호출
      console.log("삭제할 시험 ID들:", Array.from(selectedIds));
      
      // 목록에서 삭제
      setTestList(prev => prev.filter(test => !selectedIds.has(test.id)));
      setSelectedIds(new Set());
      
      alert(`${selectedIds.size}개의 시험이 삭제되었습니다.`);
    }
  }, [selectedIds, getTestDataWithRealParticipation]);

  /**
   * 개별 시험 삭제 핸들러
   */
  const handleDelete = useCallback((id: string) => {
    const paper = getTestDataWithRealParticipation.find((p) => p.id === id);
    if (!paper) return;

    if (confirm(`"${paper.testName}" 시험을 삭제하시겠습니까?`)) {
      // 실제로는 API 호출
      console.log("시험 삭제:", paper);
      
      // 목록에서 삭제
      setTestList(prev => prev.filter(test => test.id !== id));
      
      alert("시험이 삭제되었습니다.");
    }
  }, [getTestDataWithRealParticipation]);

  /**
   * 인쇄 모달 열기 핸들러
   */
  const handleOpenPrint = useCallback((paper: Test) => {
    console.log("인쇄 모달 열기:", paper);
    // TODO: 인쇄 모달 구현
    alert("인쇄 기능은 추후 구현 예정입니다.");
  }, []);

  /**
   * 상세 모달 열기 핸들러
   */
  const handleOpenDetail = useCallback((paper: Test) => {
    setSelectedPaper(paper);
    setActiveModal("detail");
  }, []);

  /**
   * 모달 닫기 핸들러
   */
  const handleClose = useCallback(() => {
    setActiveModal(null);
    setSelectedPaper(null);
  }, []);

  /**
   * 필터 상태 객체
   */
  const filters: TestListFilters = {
    searchKeyword,
    searchScope,
    selectedGrade,
  };

  return {
    // 상태
    papers: testList,
    filteredPapers,
    selectedIds,
    activeModal,
    selectedPaper,
    filters,
    fakeTestSubmitStatusDetail,

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
    addNewTest, // 새로운 시험 추가 함수
  };
}

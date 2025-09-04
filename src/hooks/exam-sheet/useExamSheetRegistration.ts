import { useState, useCallback, useMemo } from "react";
// TODO: 서버 API에서 문제 관련 함수들을 가져오도록 수정 필요
type ProblemHierarchy = {
  unit: string;
  subunit: string;
  chapter: string;
};
import type { Problem } from "@/types/exam-sheet";
import type { Exam } from "@/types/exam";

/**
 * 문제지 등록 관련 상태 관리 커스텀 훅
 * @description 문제지 등록 과정에서 필요한 모든 상태와 로직을 관리
 *
 * 주요 기능:
 * - 문제지 정보 상태 관리
 * - 문제 선택/해제 로직
 * - 문제 개수 계산
 * - 문제 교체 로직
 * - 선택된 문제 목록 관리
 * - 시험 출제 완료 후 목록 이동
 */
export function useExamSheetRegistration() {
  // 문제지 정보 상태
  const [examName, setExamName] = useState<string>("");
  const [selectedGrade, setSelectedGrade] = useState<string>("중1");

  // 선택된 문제 상태
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(
    new Set(),
  );

  // 문제 순서 상태 (선택된 문제들의 순서를 관리)
  const [problemOrder, setProblemOrder] = useState<string[]>([]);

  // 문제 목록 화면 상태
  const [showProblemList, setShowProblemList] = useState<boolean>(false);

  // 문제 상세보기 모달 상태
  const [isProblemDetailModalOpen, setIsProblemDetailModalOpen] =
    useState<boolean>(false);
  const [selectedProblemForDetail, setSelectedProblemForDetail] =
    useState<Problem | null>(null);

  // 시험 목록 탭 이동 콜백
  const [onExamCreated, setOnExamCreated] = useState<
    | ((
        exam: Omit<
          Exam,
          | "id"
          | "createdAt"
          | "updatedAt"
          | "totalParticipants"
          | "actualParticipants"
        >,
      ) => void)
    | null
  >(null);

  /**
   * 시험 목록 탭 이동 콜백 설정
   * @param callback 시험 생성 완료 후 호출될 콜백 함수
   */
  const setExamCreatedCallback = useCallback(
    (
      callback: (
        exam: Omit<
          Exam,
          | "id"
          | "createdAt"
          | "updatedAt"
          | "totalParticipants"
          | "actualParticipants"
        >,
      ) => void,
    ) => {
      setOnExamCreated(() => callback);
    },
    [],
  );

  /**
   * 문제 선택 토글 함수
   * @param problemId 문제 ID
   */
  const toggleProblem = useCallback((problemId: string) => {
    setSelectedProblems((prev) => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        // 문제 해제
        next.delete(problemId);
      } else {
        // 문제 추가 (30개 제한 체크)
        if (next.size >= 30) {
          alert("최대 30문항까지만 선택할 수 있습니다.");
          return prev;
        }
        next.add(problemId);
      }
      return next;
    });
  }, []);

  /**
   * 문제 삭제 함수
   * @param problemId 문제 ID
   */
  const removeProblem = useCallback((problemId: string) => {
    setSelectedProblems((prev) => {
      const next = new Set(prev);
      next.delete(problemId);
      return next;
    });
  }, []);

  /**
   * 문제 교체 함수
   * @param oldProblemId 기존 문제 ID
   * @param newProblemId 새 문제 ID
   */
  const replaceProblem = useCallback(
    (oldProblemId: string, newProblemId: string) => {
      console.log("문제 교체:", oldProblemId, "→", newProblemId);

      // 기존 문제 제거
      setSelectedProblems((prev) => {
        const next = new Set(prev);
        next.delete(oldProblemId);
        return next;
      });

      // 새 문제 추가 (30개 제한은 교체 시에는 체크하지 않음 - 이미 제거했으므로)
      setSelectedProblems((prev) => {
        const next = new Set(prev);
        next.add(newProblemId);
        return next;
      });

      // 문제 순서에서도 교체
      setProblemOrder((prev) => {
        const index = prev.indexOf(oldProblemId);
        if (index !== -1) {
          const newOrder = [...prev];
          newOrder[index] = newProblemId;
          return newOrder;
        }
        return prev;
      });
    },
    [],
  );

  /**
   * 문제 순서 변경 함수
   * @param problems 새로운 순서의 문제 배열
   */
  const reorderProblems = useCallback((problems: Problem[]) => {
    const newOrder = problems.map((problem) => problem.id);
    setProblemOrder(newOrder);
  }, []);

  /**
   * 선택된 문제 개수 계산 (실시간 업데이트용)
   */
  const selectedObjectiveCount = useMemo(() => {
    return Array.from(selectedProblems).filter((problemId) => {
      // TODO: 서버 API에서 문제 데이터를 가져오도록 수정 필요
      const problem = { type: "objective" } as any; // findProblemInTree(problemId);
      return problem?.type === "objective";
    }).length;
  }, [selectedProblems]);

  const selectedSubjectiveCount = useMemo(() => {
    return Array.from(selectedProblems).filter((problemId) => {
      // TODO: 서버 API에서 문제 데이터를 가져오도록 수정 필요
      const problem = { type: "objective" } as any; // findProblemInTree(problemId);
      return problem?.type === "subjective";
    }).length;
  }, [selectedProblems]);

  const totalQuestionCount = useMemo(() => {
    return selectedObjectiveCount + selectedSubjectiveCount;
  }, [selectedObjectiveCount, selectedSubjectiveCount]);

  /**
   * 선택된 문제 목록 (소단원별로 그룹화)
   */
  const selectedProblemList = useMemo(() => {
    const problemGroups: Record<
      string,
      {
        detailName: string;
        problems: Array<{
          id: string;
          name: string;
          hierarchy: ProblemHierarchy;
        }>;
      }
    > = {};

    Array.from(selectedProblems).forEach((problemId) => {
      // TODO: 서버 API에서 문제 계층 정보를 가져오도록 수정 필요
      const hierarchy = { unit: "", subunit: "", chapter: "", detail: "", count: 1 } as any; // findProblemHierarchy(problemId);
      if (hierarchy) {
        const detailKey = `${hierarchy.unit}-${hierarchy.subunit}-${hierarchy.detail}`;
        if (!problemGroups[detailKey]) {
          problemGroups[detailKey] = {
            detailName: `${hierarchy.unit} - ${hierarchy.subunit} - ${hierarchy.detail}`,
            problems: [],
          };
        }
        problemGroups[detailKey].problems.push({
          id: problemId,
          name: hierarchy
            ? `${hierarchy.unit} - ${hierarchy.subunit} - ${hierarchy.detail} (${hierarchy.count})`
            : "알 수 없는 문제",
          hierarchy,
        });
      }
    });

    return Object.values(problemGroups);
  }, [selectedProblems]);

  /**
   * 선택된 문제들을 Problem 객체로 변환
   */
  const getSelectedProblems = useCallback((): Problem[] => {
    const problems: Problem[] = [];
    let problemNumber = 1;

    // 문제 순서가 있으면 순서대로, 없으면 선택된 순서대로
    const orderedProblemIds =
      problemOrder.length > 0
        ? problemOrder.filter((id) => selectedProblems.has(id))
        : Array.from(selectedProblems);

    orderedProblemIds.forEach((problemId) => {
      // TODO: 서버 API에서 문제 데이터를 생성하도록 수정 필요
    const problemData = { id: problemId, name: "", type: "objective" } as any; // generateProblemData(problemId);
      if (problemData) {
        problems.push({
          ...problemData,
          number: problemNumber++,
          createdAt: new Date().toISOString(),
        });
      }
    });

    return problems;
  }, [selectedProblems, problemOrder]);

  /**
   * 문제 상세보기 핸들러
   * @param problemId 문제 ID
   */
  const handleProblemDetail = useCallback((problemId: string) => {
    // TODO: 서버 API에서 문제 데이터를 생성하도록 수정 필요
    const problemData = { id: problemId, name: "", type: "objective" } as any; // generateProblemData(problemId);
    if (problemData) {
      setSelectedProblemForDetail({
        ...problemData,
        number: 1,
        createdAt: new Date().toISOString(),
      });
      setIsProblemDetailModalOpen(true);
    }
  }, []);

  /**
   * 문제 상세보기 모달 닫기 핸들러
   */
  const handleCloseProblemDetail = useCallback(() => {
    setIsProblemDetailModalOpen(false);
    setSelectedProblemForDetail(null);
  }, []);

  /**
   * 문제지 생성 (문제 목록 화면으로 전환)
   */
  const handleCreateExam = useCallback(() => {
    if (selectedProblems.size === 0 || !examName.trim()) {
      alert("문제지명을 입력하고 문제를 선택해주세요.");
      return;
    }
    setShowProblemList(true);
  }, [selectedProblems.size, examName]);

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = useCallback(() => {
    setShowProblemList(false);
  }, []);

  /**
   * 문제지 생성 완료 핸들러
   * @description 시험 출제 완료 후 시험 목록 탭으로 이동하고 새로운 시험을 목록에 추가
   */
  const handleCreateExamSheet = useCallback(() => {
    // 시험 정보 생성
    const newExam: Omit<
      Exam,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "totalParticipants"
      | "actualParticipants"
    > = {
      // TODO: unitName 속성이 서버 타입에 없음 - 서버 API 구조에 맞게 수정 필요
      // unitName: `${selectedGrade} 수학 - 문제지`,
      examName,
      content: `${selectedGrade} 수학 시험지`,
      grade: parseInt(selectedGrade.replace('중', ''), 10) || 1,
      qrCodeUrl: null,
      examSheetInfo: null,
    };

    console.log("문제지 생성 완료:", {
      examName,
      selectedGrade,
      questionCount: totalQuestionCount,
      objectiveCount: selectedObjectiveCount,
      subjectiveCount: selectedSubjectiveCount,
      selectedProblems: Array.from(selectedProblems),
      newExam,
    });

    // 시험 목록에 추가하고 탭 이동
    if (onExamCreated) {
      onExamCreated(newExam);
    }

    alert("문제지가 성공적으로 생성되었습니다! 시험 목록으로 이동합니다.");
    setShowProblemList(false);

    // 상태 초기화
    setExamName("");
    setSelectedProblems(new Set());
    setProblemOrder([]);
  }, [
    examName,
    selectedGrade,
    totalQuestionCount,
    selectedObjectiveCount,
    selectedSubjectiveCount,
    selectedProblems,
    onExamCreated,
  ]);

  /**
   * 문제지 미리보기 핸들러
   */
  const handlePreviewExamSheet = useCallback(() => {
    console.log("문제지 미리보기");
    // TODO: 문제지 미리보기 모달 구현
    alert("문제지 미리보기 기능은 추후 구현 예정입니다.");
  }, []);

  return {
    // 상태
    examName,
    selectedGrade,
    selectedProblems,
    showProblemList,
    isProblemDetailModalOpen,
    selectedProblemForDetail,
    selectedObjectiveCount,
    selectedSubjectiveCount,
    totalQuestionCount,
    selectedProblemList,

    // 액션
    setExamName,
    setSelectedGrade,
    toggleProblem,
    removeProblem,
    replaceProblem,
    reorderProblems,
    handleProblemDetail,
    handleCloseProblemDetail,
    handleCreateExam,
    handleBack,
    handleCreateExamSheet,
    handlePreviewExamSheet,
    getSelectedProblems,
    setExamCreatedCallback, // 시험 생성 완료 콜백 설정
  };
}

// src/routes/test-paper/_components/TestPaperRegistrationTab.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SelectGrade } from "../layout/SelectGrade";
import { Eye, ChevronRight, Circle, Square } from "lucide-react";
import { ProblemListTab } from "./ProblemListTab";
import { ProblemDetailModal } from "./ProblemDetailModal";
import type { Problem } from "@/types/test-paper";

/**
 * 시험지 등록 탭 콘텐츠
 * @description 이미지와 동일한 구조로 시험지 정보, 단원 선택, 선택된 단원 확인 및 시험지 생성 기능 제공
 *
 * 주요 구성:
 * - 시험지 정보 섹션 (시험지명, 문항수, 객관식/주관식, 학년)
 * - 좌측: 단원 선택 트리 구조
 * - 우측: 선택된 단원 목록 및 시험지 생성
 */
export function TestPaperRegistrationTab() {
  // 시험지 정보 상태
  const [examName, setExamName] = useState<string>("");
  const [questionCount, setQuestionCount] = useState<string>("20");
  const [objectiveCount, setObjectiveCount] = useState<string>("17");
  const [subjectiveCount, setSubjectiveCount] = useState<string>("3");
  const [selectedGrade, setSelectedGrade] = useState<string>("중1");

  // 선택된 문제 상태
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(
    new Set(),
  );

  // 선택된 단원 상태
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set());

  // 문제 목록 화면 상태
  const [showProblemList, setShowProblemList] = useState<boolean>(false);

  // 문제 상세보기 모달 상태
  const [isProblemDetailModalOpen, setIsProblemDetailModalOpen] =
    useState<boolean>(false);
  const [selectedProblemForDetail, setSelectedProblemForDetail] =
    useState<Problem | null>(null);

  // 가짜 단원 트리 데이터
  const unitTreeData = [
    {
      id: "unit1",
      name: "수와 연산",
      children: [
        {
          id: "subunit1",
          name: "정수와 유리수",
          children: [
            {
              id: "detail1",
              name: "정수의 덧셈과 뺄셈 (25)",
              children: [
                {
                  id: "problem1",
                  name: "정수의 덧셈 - 다음 중 계산 결과가 가장 큰 것은? (객관식)",
                  type: "objective",
                },
                {
                  id: "problem2",
                  name: "정수의 뺄셈 - (-8) - (-3)의 값은? (객관식)",
                  type: "objective",
                },
                {
                  id: "problem3",
                  name: "정수의 곱셈 - (-4) × 6의 값은? (객관식)",
                  type: "objective",
                },
                {
                  id: "problem4",
                  name: "유리수의 덧셈 - 다음 중 계산 결과가 올바른 것은? (객관식)",
                  type: "objective",
                },
                {
                  id: "problem5",
                  name: "문자의 사용 - 어떤 수에 3을 더한 후 2를 곱하면 10이 된다. 이 수를 구하시오. (주관식)",
                  type: "subjective",
                },
              ],
            },
            {
              id: "detail2",
              name: "정수의 곱셈과 나눗셈 (20)",
              children: [
                {
                  id: "problem6",
                  name: "식의 계산 - 다음 식을 간단히 하시오. (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem7",
                  name: "다각형의 성질 - 정사각형의 대각선의 길이가 6√2cm일 때, 정사각형의 넓이는 몇 cm²인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem8",
                  name: "원의 성질 - 반지름이 5cm인 원의 넓이는 몇 cm²인가? (π = 3.14) (주관식)",
                  type: "subjective",
                },
              ],
            },
            {
              id: "detail3",
              name: "유리수의 덧셈과 뺄셈 (18)",
              children: [
                {
                  id: "problem9",
                  name: "기둥의 부피 - 밑면이 정사각형이고 높이가 8cm인 정사각기둥의 부피가 200cm³일 때, 밑면의 한 변의 길이는 몇 cm인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem10",
                  name: "확률 계산 - 주사위를 한 번 던질 때, 짝수의 눈이 나올 확률은? (객관식)",
                  type: "objective",
                },
              ],
            },
          ],
        },
        {
          id: "subunit2",
          name: "문자와 식",
          children: [
            {
              id: "detail4",
              name: "문자의 사용 (15)",
              children: [
                {
                  id: "problem11",
                  name: "문자의 사용 - x + 2y = 10일 때, y = 3이면 x의 값은? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem12",
                  name: "식의 계산 - 3x - 2y + x + 4y를 간단히 하시오. (주관식)",
                  type: "subjective",
                },
              ],
            },
            {
              id: "detail5",
              name: "식의 계산 (22)",
              children: [
                {
                  id: "problem13",
                  name: "식의 계산 - 2x + 3y - x + 2y를 간단히 하시오. (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem14",
                  name: "다각형의 성질 - 정삼각형의 한 변의 길이가 6cm일 때, 정삼각형의 넓이는 몇 cm²인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem15",
                  name: "원의 성질 - 지름이 10cm인 원의 둘레는 몇 cm인가? (π = 3.14) (주관식)",
                  type: "subjective",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "unit2",
      name: "도형",
      children: [
        {
          id: "subunit3",
          name: "평면도형",
          children: [
            {
              id: "detail6",
              name: "다각형 (30)",
              children: [
                {
                  id: "problem16",
                  name: "다각형의 성질 - 정사각형의 대각선의 길이가 6√2cm일 때, 정사각형의 넓이는 몇 cm²인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem17",
                  name: "다각형의 성질 - 정육각형의 한 변의 길이가 4cm일 때, 정육각형의 둘레는 몇 cm인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem18",
                  name: "다각형의 성질 - 정오각형의 한 내각의 크기는 몇 도인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem19",
                  name: "다각형의 성질 - 정팔각형의 한 외각의 크기는 몇 도인가? (주관식)",
                  type: "subjective",
                },
              ],
            },
            {
              id: "detail7",
              name: "원과 부채꼴 (28)",
              children: [
                {
                  id: "problem20",
                  name: "원의 성질 - 반지름이 5cm인 원의 넓이는 몇 cm²인가? (π = 3.14) (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem21",
                  name: "원의 성질 - 지름이 12cm인 원의 둘레는 몇 cm인가? (π = 3.14) (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem22",
                  name: "부채꼴의 성질 - 반지름이 6cm이고 중심각이 60°인 부채꼴의 호의 길이는 몇 cm인가? (π = 3.14) (주관식)",
                  type: "subjective",
                },
              ],
            },
          ],
        },
        {
          id: "subunit4",
          name: "입체도형",
          children: [
            {
              id: "detail8",
              name: "기둥과 뿔 (20)",
              children: [
                {
                  id: "problem23",
                  name: "기둥의 부피 - 밑면이 정사각형이고 높이가 8cm인 정사각기둥의 부피가 200cm³일 때, 밑면의 한 변의 길이는 몇 cm인가? (주관식)",
                  type: "subjective",
                },
                {
                  id: "problem24",
                  name: "뿔의 부피 - 밑면이 정사각형이고 높이가 6cm인 정사각뿔의 부피가 72cm³일 때, 밑면의 한 변의 길이는 몇 cm인가? (주관식)",
                  type: "subjective",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "unit3",
      name: "확률과 통계",
      children: [
        {
          id: "subunit5",
          name: "확률",
          children: [
            {
              id: "detail9",
              name: "확률의 뜻과 성질 (25)",
              children: [
                {
                  id: "problem25",
                  name: "확률 계산 - 주사위를 한 번 던질 때, 짝수의 눈이 나올 확률은? (객관식)",
                  type: "objective",
                },
                {
                  id: "problem26",
                  name: "확률 계산 - 동전을 두 번 던질 때, 앞면이 한 번 나올 확률은? (객관식)",
                  type: "objective",
                },
                {
                  id: "problem27",
                  name: "확률 계산 - 1부터 10까지의 자연수 중에서 3의 배수를 뽑을 확률은? (객관식)",
                  type: "objective",
                },
              ],
            },
          ],
        },
      ],
    },
  ];

  // 문제 ID로부터 계층적 정보를 찾는 함수
  const findProblemHierarchy = (problemId: string) => {
    for (const unit of unitTreeData) {
      for (const subunit of unit.children || []) {
        for (const detail of subunit.children || []) {
          const problem = detail.children?.find((p) => p.id === problemId);
          if (problem) {
            return {
              unit: unit.name,
              subunit: subunit.name,
              detail: detail.name,
              count: detail.children?.length || 0,
            };
          }
        }
      }
    }
    return null;
  };

  // 선택된 문제 목록 (소단원별로 그룹화)
  const selectedProblemList = (() => {
    const problemGroups: Record<
      string,
      {
        detailName: string;
        problems: Array<{
          id: string;
          name: string;
          hierarchy: any;
        }>;
      }
    > = {};

    Array.from(selectedProblems).forEach((problemId) => {
      const hierarchy = findProblemHierarchy(problemId);
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
  })();

  // 문제 선택 토글
  const toggleProblem = (problemId: string) => {
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

    // 객관식/주관식 개수 업데이트
    updateQuestionCounts();
  };

  // 트리에서 문제 찾기
  const findProblemInTree = (problemId: string) => {
    for (const unit of unitTreeData) {
      for (const subunit of unit.children || []) {
        for (const detail of subunit.children || []) {
          const problem = detail.children?.find((p) => p.id === problemId);
          if (problem) {
            return problem;
          }
        }
      }
    }
    return null;
  };

  // 객관식/주관식 개수 업데이트
  const updateQuestionCounts = () => {
    const selectedProblemsArray = Array.from(selectedProblems);
    let objectiveCount = 0;
    let subjectiveCount = 0;

    selectedProblemsArray.forEach((problemId) => {
      const problem = findProblemInTree(problemId);
      if (problem) {
        if (problem.type === "objective") {
          objectiveCount++;
        } else if (problem.type === "subjective") {
          subjectiveCount++;
        }
      }
    });

    setObjectiveCount(String(objectiveCount));
    setSubjectiveCount(String(subjectiveCount));
    // questionCount는 자동으로 계산되므로 별도 설정하지 않음
  };

  // 선택된 문제 개수 계산 (실시간 업데이트용)
  const selectedObjectiveCount = Array.from(selectedProblems).filter(
    (problemId) => {
      const problem = findProblemInTree(problemId);
      return problem?.type === "objective";
    },
  ).length;

  const selectedSubjectiveCount = Array.from(selectedProblems).filter(
    (problemId) => {
      const problem = findProblemInTree(problemId);
      return problem?.type === "subjective";
    },
  ).length;

  // 문제 토글 처리 (문제만 선택/해제)
  const toggleUnit = (unitId: string) => {
    // 현재 단원 찾기
    const findUnit = (units: any[]): any => {
      for (const unit of units) {
        if (unit.id === unitId) return unit;
        if (unit.children) {
          const found = findUnit(unit.children);
          if (found) return found;
        }
      }
      return null;
    };

    const currentUnit = findUnit(unitTreeData);
    if (!currentUnit) return;

    // 문제인 경우에만 선택/해제 처리
    if (
      currentUnit.name.includes("문제 내용") ||
      currentUnit.id.startsWith("problem")
    ) {
      setSelectedProblems((prev) => {
        const next = new Set(prev);
        if (next.has(unitId)) {
          // 문제 해제
          next.delete(unitId);
        } else {
          // 문제 추가 (30개 제한 체크)
          if (next.size >= 30) {
            alert("최대 30문항까지만 선택할 수 있습니다.");
            return prev;
          }
          next.add(unitId);
        }
        return next;
      });

      // 객관식/주관식 개수 업데이트
      updateQuestionCounts();
    }
  };

  // 모든 문제 ID를 가져오는 함수
  const getAllProblemIds = (unit: any): string[] => {
    const ids: string[] = [];
    if (unit.children) {
      unit.children.forEach((child: any) => {
        if (child.name.includes("문제 내용")) {
          ids.push(child.id);
        } else {
          ids.push(...getAllProblemIds(child));
        }
      });
    }
    return ids;
  };

  // 문제 삭제
  const removeProblem = (problemId: string) => {
    setSelectedProblems((prev) => {
      const next = new Set(prev);
      next.delete(problemId);
      return next;
    });

    // 객관식/주관식 개수 업데이트
    updateQuestionCounts();
  };

  // 선택된 문제들을 Problem 객체로 변환
  const getSelectedProblems = (): Problem[] => {
    const problems: Problem[] = [];
    let problemNumber = 1;

    Array.from(selectedProblems).forEach((problemId) => {
      const problemData = generateProblemData(problemId);
      if (problemData) {
        problems.push({
          ...problemData,
          number: problemNumber++,
        });
      }
    });

    return problems;
  };

  // 시험지 생성 (문제 목록 화면으로 전환)
  const handleCreateExam = () => {
    if (selectedProblems.size === 0 || !examName.trim()) {
      alert("시험지명을 입력하고 문제를 선택해주세요.");
      return;
    }
    setShowProblemList(true);
  };

  // 문제 교체 핸들러
  const handleReplaceProblem = (oldProblemId: string, newProblemId: string) => {
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

    // 객관식/주관식 개수 업데이트
    updateQuestionCounts();
  };

  // 시험지 미리보기 핸들러
  const handlePreviewTestPaper = () => {
    console.log("시험지 미리보기");
    // TODO: 시험지 미리보기 모달 구현
    alert("시험지 미리보기 기능은 추후 구현 예정입니다.");
  };

  // 시험지 생성 핸들러
  const handleCreateTestPaper = () => {
    console.log("시험지 생성 완료:", {
      examName,
      questionCount,
      objectiveCount,
      subjectiveCount,
      selectedGrade,
      selectedProblems: Array.from(selectedProblems),
    });
    alert("시험지가 성공적으로 생성되었습니다!");
    setShowProblemList(false);
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    setShowProblemList(false);
  };

  // 문제 상세보기 핸들러
  const handleProblemDetail = (problemId: string) => {
    // 문제 ID에 따라 실제 문제 데이터 생성
    const problemData = generateProblemData(problemId);

    if (problemData) {
      setSelectedProblemForDetail(problemData);
      setIsProblemDetailModalOpen(true);
    }
  };

  // 문제 ID에 따른 실제 문제 데이터 생성
  const generateProblemData = (problemId: string): Problem | null => {
    const problemMap: Record<string, Problem> = {
      problem1: {
        id: "problem1",
        number: 1,
        title: "정수의 덧셈",
        content:
          "다음 중 계산 결과가 가장 큰 것은?\n\n① (-5) + 3\n② (-2) + (-1)\n③ 4 + (-6)\n④ (-3) + 7",
        type: "objective",
        unitName: "정수의 덧셈과 뺄셈",
        difficulty: "low",
        points: 5,
        options: ["(-5) + 3", "(-2) + (-1)", "4 + (-6)", "(-3) + 7"],
        createdAt: new Date().toISOString(),
      },
      problem2: {
        id: "problem2",
        number: 2,
        title: "정수의 뺄셈",
        content: "(-8) - (-3)의 값은?\n\n① -11\n② -5\n③ -3\n④ 5",
        type: "objective",
        unitName: "정수의 덧셈과 뺄셈",
        difficulty: "medium",
        points: 5,
        options: ["-11", "-5", "-3", "5"],
        createdAt: new Date().toISOString(),
      },
      problem3: {
        id: "problem3",
        number: 3,
        title: "정수의 곱셈",
        content: "(-4) × 6의 값은?\n\n① -24\n② -10\n③ 10\n④ 24",
        type: "objective",
        unitName: "정수의 곱셈과 나눗셈",
        difficulty: "low",
        points: 5,
        options: ["-24", "-10", "10", "24"],
        createdAt: new Date().toISOString(),
      },
      problem4: {
        id: "problem4",
        number: 4,
        title: "유리수의 덧셈",
        content:
          "다음 중 계산 결과가 올바른 것은?\n\n① 1/2 + 1/3 = 2/5\n② 2/3 + 1/6 = 5/6\n③ 3/4 + 1/8 = 4/12\n④ 1/5 + 2/5 = 3/10",
        type: "objective",
        unitName: "유리수의 덧셈과 뺄셈",
        difficulty: "medium",
        points: 5,
        options: [
          "1/2 + 1/3 = 2/5",
          "2/3 + 1/6 = 5/6",
          "3/4 + 1/8 = 4/12",
          "1/5 + 2/5 = 3/10",
        ],
        createdAt: new Date().toISOString(),
      },
      problem5: {
        id: "problem5",
        number: 5,
        title: "문자의 사용",
        content:
          "어떤 수에 3을 더한 후 2를 곱하면 10이 된다. 이 수를 구하시오.",
        type: "subjective",
        unitName: "문자의 사용",
        difficulty: "medium",
        points: 10,
        createdAt: new Date().toISOString(),
      },
      problem6: {
        id: "problem6",
        number: 6,
        title: "식의 계산",
        content: "다음 식을 간단히 하시오.\n\n2x + 3y - x + 2y",
        type: "subjective",
        unitName: "식의 계산",
        difficulty: "low",
        points: 8,
        createdAt: new Date().toISOString(),
      },
      problem7: {
        id: "problem7",
        number: 7,
        title: "다각형의 성질",
        content:
          "정사각형의 대각선의 길이가 6√2cm일 때, 정사각형의 넓이는 몇 cm²인가?",
        type: "subjective",
        unitName: "다각형",
        difficulty: "high",
        points: 10,
        createdAt: new Date().toISOString(),
      },
      problem8: {
        id: "problem8",
        number: 8,
        title: "원의 성질",
        content: "반지름이 5cm인 원의 넓이는 몇 cm²인가? (π = 3.14)",
        type: "subjective",
        unitName: "원과 부채꼴",
        difficulty: "medium",
        points: 8,
        createdAt: new Date().toISOString(),
      },
      problem9: {
        id: "problem9",
        number: 9,
        title: "기둥의 부피",
        content:
          "밑면이 정사각형이고 높이가 8cm인 정사각기둥의 부피가 200cm³일 때, 밑면의 한 변의 길이는 몇 cm인가?",
        type: "subjective",
        unitName: "기둥과 뿔",
        difficulty: "high",
        points: 12,
        createdAt: new Date().toISOString(),
      },
      problem10: {
        id: "problem10",
        number: 10,
        title: "확률 계산",
        content:
          "주사위를 한 번 던질 때, 짝수의 눈이 나올 확률은?\n\n① 1/6\n② 1/3\n③ 1/2\n④ 2/3",
        type: "objective",
        unitName: "확률의 뜻과 성질",
        difficulty: "low",
        points: 5,
        options: ["1/6", "1/3", "1/2", "2/3"],
        createdAt: new Date().toISOString(),
      },
    };

    // 기본 문제 데이터 (문제 ID가 매핑되지 않은 경우)
    const defaultProblem: Problem = {
      id: problemId,
      number: parseInt(problemId.replace("problem", "")) || 1,
      title: `문제 ${problemId.replace("problem", "")}`,
      content: "이 문제의 상세 내용은 준비 중입니다.",
      type: "objective",
      unitName: "기본 단원",
      difficulty: "low",
      points: 5,
      options: ["보기 1", "보기 2", "보기 3", "보기 4"],
      createdAt: new Date().toISOString(),
    };

    return problemMap[problemId] || defaultProblem;
  };

  // 문제 상세보기 모달 닫기 핸들러
  const handleCloseProblemDetail = () => {
    setIsProblemDetailModalOpen(false);
    setSelectedProblemForDetail(null);
  };

  // 문제 목록 화면이 활성화된 경우
  if (showProblemList) {
    return (
      <ProblemListTab
        testName={examName}
        problems={getSelectedProblems()}
        onReplaceProblem={handleReplaceProblem}
        onPreviewTestPaper={handlePreviewTestPaper}
        onCreateTestPaper={handleCreateTestPaper}
        onBack={handleBack}
        selectedProblemIds={selectedProblems}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 시험지 정보 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sky-600">시험지 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 시험지명 */}
          <div className="space-y-2">
            <Label htmlFor="exam-name">시험지명</Label>
            <Input
              id="exam-name"
              placeholder="시험지명 입력"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          {/* 문항 수, 객관식, 주관식 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>문항 수</Label>
              <Input
                value={selectedObjectiveCount + selectedSubjectiveCount}
                className="text-center font-semibold"
                readOnly
              />
              <div className="text-xs text-muted-foreground">(최대30문항)</div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-blue-500" />
                <Label>객관식</Label>
              </div>
              <Input
                value={selectedObjectiveCount}
                className={`text-center font-semibold text-blue-600 ${
                  selectedObjectiveCount === 0 ? "opacity-50" : ""
                }`}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Square className="h-4 w-4 text-green-500" />
                <Label>주관식</Label>
              </div>
              <Input
                value={selectedSubjectiveCount}
                className={`text-center font-semibold text-green-600 ${
                  selectedSubjectiveCount === 0 ? "opacity-50" : ""
                }`}
                readOnly
              />
            </div>
          </div>

          {/* 학년 */}
          <div className="space-y-2">
            <Label>학년</Label>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="중1">중1</SelectItem>
                <SelectItem value="중2">중2</SelectItem>
                <SelectItem value="중3">중3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 본문: 좌측 단원 선택 / 우측 선택 단원 */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* 좌측: 단원 선택 트리 */}
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-sky-600">단원 선택</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              {unitTreeData.map((unit) => (
                <UnitTreeItem
                  key={unit.id}
                  unit={unit}
                  selectedItems={selectedProblems}
                  onToggleItem={toggleProblem}
                  onProblemDetail={handleProblemDetail}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 우측: 선택 단원 */}
        <div className="space-y-4 h-[600px] flex flex-col">
          <Card className="flex-1 flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-sky-600">선택 단원</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {selectedProblemList.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">선택된 문제가 없습니다.</p>
                    <p className="text-xs mt-1">
                      좌측에서 문제를 선택해주세요.
                    </p>
                  </div>
                ) : (
                  selectedProblemList.map((group) => (
                    <div key={group.detailName} className="space-y-2">
                      {/* 소단원 헤더 */}
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <span className="text-sm font-medium text-gray-700">
                          {group.detailName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {group.problems.length}개 선택
                        </Badge>
                      </div>

                      {/* 해당 소단원의 문제들 */}
                      {group.problems.map((problem) => (
                        <div
                          key={problem.id}
                          className="flex items-center justify-between gap-2 rounded-md border p-3 ml-4"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Checkbox
                              checked={selectedProblems.has(problem.id)}
                              onCheckedChange={() => toggleProblem(problem.id)}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                {findProblemInTree(problem.id)?.type ===
                                "objective" ? (
                                  <Circle className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <Square className="h-3 w-3 text-green-500" />
                                )}
                                <Label className="text-sm font-medium truncate">
                                  {problem.name}
                                </Label>
                              </div>
                              {problem.hierarchy && (
                                <p className="text-xs text-gray-500 mt-1">
                                  문제 ID: {problem.id}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleProblemDetail(problem.id)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeProblem(problem.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full h-12 text-lg font-semibold flex-shrink-0"
            onClick={handleCreateExam}
            disabled={selectedProblems.size === 0 || !examName.trim()}
          >
            시험 작성
          </Button>
        </div>
      </div>

      {/* 문제 상세보기 모달 */}
      <ProblemDetailModal
        isOpen={isProblemDetailModalOpen}
        onClose={handleCloseProblemDetail}
        problem={selectedProblemForDetail}
      />
    </div>
  );
}

// 단원 트리 아이템 컴포넌트
function UnitTreeItem({
  unit,
  level = 0,
  selectedItems,
  onToggleItem,
  onProblemDetail,
}: {
  unit: any;
  level?: number;
  selectedItems: Set<string>;
  onToggleItem: (id: string) => void;
  onProblemDetail: (problemId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = unit.children && unit.children.length > 0;

  // 체크박스 상태 계산 (문제인 경우에만)
  const getCheckboxState = () => {
    if (unit.name.includes("문제 내용") || unit.id.startsWith("problem")) {
      return selectedItems.has(unit.id);
    }
    return false;
  };

  const checkboxState = getCheckboxState();

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div style={{ marginLeft: `${level * 16}px` }} />
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
            />
          </Button>
        )}
        {!hasChildren && <div className="w-4" />}

        {(unit.name.includes("문제 내용") || unit.id.startsWith("problem")) && (
          <Checkbox
            checked={checkboxState === true}
            onCheckedChange={() => onToggleItem(unit.id)}
          />
        )}
        <div
          className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            if (
              unit.name.includes("문제 내용") ||
              unit.id.startsWith("problem")
            ) {
              onToggleItem(unit.id);
            }
          }}
        >
          <span
            className={`text-sm truncate ${unit.name.includes("문제 내용") || unit.id.startsWith("problem") ? "font-medium" : ""}`}
          >
            {(unit.name.includes("문제 내용") ||
              unit.id.startsWith("problem")) && (
              <Badge
                variant={unit.type === "objective" ? "default" : "secondary"}
                className={`text-xs mr-2 ${
                  unit.type === "objective"
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {unit.type === "objective" ? "객관식" : "주관식"}
              </Badge>
            )}
            {unit.name.replace(/ \(객관식\)| \(주관식\)/g, "")}
          </span>
        </div>

        {(unit.name.includes("문제 내용") || unit.id.startsWith("problem")) && (
          <div className="flex items-center gap-1 ml-auto">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Eye className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onProblemDetail(unit.id)}
            >
              상세 보기
            </Button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div className="space-y-1">
          {unit.children.map((child: any) => (
            <UnitTreeItem
              key={child.id}
              unit={child}
              level={level + 1}
              selectedItems={selectedItems}
              onToggleItem={onToggleItem}
              onProblemDetail={onProblemDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}

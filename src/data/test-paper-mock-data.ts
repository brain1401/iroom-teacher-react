/**
 * 문제지 관련 가데이터
 * @description 문제지 등록, 문제 선택 등에 사용되는 목업 데이터
 */

/**
 * 단원 트리 노드 타입
 */
export type UnitTreeNode = {
  id: string;
  name: string;
  type?: "objective" | "subjective";
  children?: UnitTreeNode[];
};

/**
 * 문제 데이터 타입
 */
export type MockProblem = {
  id: string;
  title: string;
  content: string;
  type: "objective" | "subjective";
  unitName: string;
  difficulty: "low" | "medium" | "high";
  points: number;
  options?: string[];
  imageUrl?: string;
};

/**
 * 단원 트리 데이터
 * @description 계층적 단원 구조와 문제들을 포함한 완전한 데이터
 */
export const unitTreeData: UnitTreeNode[] = [
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

/**
 * 문제 상세 데이터 맵
 * @description 문제 ID에 따른 상세 문제 정보
 */
export const problemDetailMap: Record<string, MockProblem> = {
  problem1: {
    id: "problem1",
    title: "정수의 덧셈",
    content: "다음 중 계산 결과가 가장 큰 것은?\n\n① (-5) + 3\n② (-2) + (-1)\n③ 4 + (-6)\n④ (-3) + 7",
    type: "objective",
    unitName: "정수의 덧셈과 뺄셈",
    difficulty: "low",
    points: 5,
    options: ["(-5) + 3", "(-2) + (-1)", "4 + (-6)", "(-3) + 7"],
  },
  problem2: {
    id: "problem2",
    title: "정수의 뺄셈",
    content: "(-8) - (-3)의 값은?\n\n① -11\n② -5\n③ -3\n④ 5",
    type: "objective",
    unitName: "정수의 덧셈과 뺄셈",
    difficulty: "medium",
    points: 5,
    options: ["-11", "-5", "-3", "5"],
  },
  problem3: {
    id: "problem3",
    title: "정수의 곱셈",
    content: "(-4) × 6의 값은?\n\n① -24\n② -10\n③ 10\n④ 24",
    type: "objective",
    unitName: "정수의 곱셈과 나눗셈",
    difficulty: "low",
    points: 5,
    options: ["-24", "-10", "10", "24"],
  },
  problem4: {
    id: "problem4",
    title: "유리수의 덧셈",
    content: "다음 중 계산 결과가 올바른 것은?\n\n① 1/2 + 1/3 = 2/5\n② 2/3 + 1/6 = 5/6\n③ 3/4 + 1/8 = 4/12\n④ 1/5 + 2/5 = 3/10",
    type: "objective",
    unitName: "유리수의 덧셈과 뺄셈",
    difficulty: "medium",
    points: 5,
    options: ["1/2 + 1/3 = 2/5", "2/3 + 1/6 = 5/6", "3/4 + 1/8 = 4/12", "1/5 + 2/5 = 3/10"],
  },
  problem5: {
    id: "problem5",
    title: "문자의 사용",
    content: "어떤 수에 3을 더한 후 2를 곱하면 10이 된다. 이 수를 구하시오.",
    type: "subjective",
    unitName: "문자의 사용",
    difficulty: "medium",
    points: 10,
  },
  problem6: {
    id: "problem6",
    title: "식의 계산",
    content: "다음 식을 간단히 하시오.\n\n2x + 3y - x + 2y",
    type: "subjective",
    unitName: "식의 계산",
    difficulty: "low",
    points: 8,
  },
  problem7: {
    id: "problem7",
    title: "다각형의 성질",
    content: "정사각형의 대각선의 길이가 6√2cm일 때, 정사각형의 넓이는 몇 cm²인가?",
    type: "subjective",
    unitName: "다각형",
    difficulty: "high",
    points: 10,
  },
  problem8: {
    id: "problem8",
    title: "원의 성질",
    content: "반지름이 5cm인 원의 넓이는 몇 cm²인가? (π = 3.14)",
    type: "subjective",
    unitName: "원과 부채꼴",
    difficulty: "medium",
    points: 8,
  },
  problem9: {
    id: "problem9",
    title: "기둥의 부피",
    content: "밑면이 정사각형이고 높이가 8cm인 정사각기둥의 부피가 200cm³일 때, 밑면의 한 변의 길이는 몇 cm인가?",
    type: "subjective",
    unitName: "기둥과 뿔",
    difficulty: "high",
    points: 12,
  },
  problem10: {
    id: "problem10",
    title: "확률 계산",
    content: "주사위를 한 번 던질 때, 짝수의 눈이 나올 확률은?\n\n① 1/6\n② 1/3\n③ 1/2\n④ 2/3",
    type: "objective",
    unitName: "확률의 뜻과 성질",
    difficulty: "low",
    points: 5,
    options: ["1/6", "1/3", "1/2", "2/3"],
  },
  problem11: {
    id: "problem11",
    title: "문자의 사용",
    content: "x + 2y = 10일 때, y = 3이면 x의 값은?",
    type: "subjective",
    unitName: "문자의 사용",
    difficulty: "medium",
    points: 8,
  },
  problem12: {
    id: "problem12",
    title: "식의 계산",
    content: "3x - 2y + x + 4y를 간단히 하시오.",
    type: "subjective",
    unitName: "식의 계산",
    difficulty: "low",
    points: 6,
  },
  problem13: {
    id: "problem13",
    title: "식의 계산",
    content: "2x + 3y - x + 2y를 간단히 하시오.",
    type: "subjective",
    unitName: "식의 계산",
    difficulty: "low",
    points: 6,
  },
  problem14: {
    id: "problem14",
    title: "다각형의 성질",
    content: "정삼각형의 한 변의 길이가 6cm일 때, 정삼각형의 넓이는 몇 cm²인가?",
    type: "subjective",
    unitName: "다각형",
    difficulty: "medium",
    points: 8,
  },
  problem15: {
    id: "problem15",
    title: "원의 성질",
    content: "지름이 10cm인 원의 둘레는 몇 cm인가? (π = 3.14)",
    type: "subjective",
    unitName: "원과 부채꼴",
    difficulty: "medium",
    points: 6,
  },
  problem16: {
    id: "problem16",
    title: "다각형의 성질",
    content: "정사각형의 대각선의 길이가 6√2cm일 때, 정사각형의 넓이는 몇 cm²인가?",
    type: "subjective",
    unitName: "다각형",
    difficulty: "high",
    points: 10,
  },
  problem17: {
    id: "problem17",
    title: "다각형의 성질",
    content: "정육각형의 한 변의 길이가 4cm일 때, 정육각형의 둘레는 몇 cm인가?",
    type: "subjective",
    unitName: "다각형",
    difficulty: "medium",
    points: 8,
  },
  problem18: {
    id: "problem18",
    title: "다각형의 성질",
    content: "정오각형의 한 내각의 크기는 몇 도인가?",
    type: "subjective",
    unitName: "다각형",
    difficulty: "medium",
    points: 8,
  },
  problem19: {
    id: "problem19",
    title: "다각형의 성질",
    content: "정팔각형의 한 외각의 크기는 몇 도인가?",
    type: "subjective",
    unitName: "다각형",
    difficulty: "medium",
    points: 8,
  },
  problem20: {
    id: "problem20",
    title: "원의 성질",
    content: "반지름이 5cm인 원의 넓이는 몇 cm²인가? (π = 3.14)",
    type: "subjective",
    unitName: "원과 부채꼴",
    difficulty: "medium",
    points: 8,
  },
  problem21: {
    id: "problem21",
    title: "원의 성질",
    content: "지름이 12cm인 원의 둘레는 몇 cm인가? (π = 3.14)",
    type: "subjective",
    unitName: "원과 부채꼴",
    difficulty: "medium",
    points: 8,
  },
  problem22: {
    id: "problem22",
    title: "부채꼴의 성질",
    content: "반지름이 6cm이고 중심각이 60°인 부채꼴의 호의 길이는 몇 cm인가? (π = 3.14)",
    type: "subjective",
    unitName: "원과 부채꼴",
    difficulty: "high",
    points: 10,
  },
  problem23: {
    id: "problem23",
    title: "기둥의 부피",
    content: "밑면이 정사각형이고 높이가 8cm인 정사각기둥의 부피가 200cm³일 때, 밑면의 한 변의 길이는 몇 cm인가?",
    type: "subjective",
    unitName: "기둥과 뿔",
    difficulty: "high",
    points: 12,
  },
  problem24: {
    id: "problem24",
    title: "뿔의 부피",
    content: "밑면이 정사각형이고 높이가 6cm인 정사각뿔의 부피가 72cm³일 때, 밑면의 한 변의 길이는 몇 cm인가?",
    type: "subjective",
    unitName: "기둥과 뿔",
    difficulty: "high",
    points: 12,
  },
  problem25: {
    id: "problem25",
    title: "확률 계산",
    content: "주사위를 한 번 던질 때, 짝수의 눈이 나올 확률은?\n\n① 1/6\n② 1/3\n③ 1/2\n④ 2/3",
    type: "objective",
    unitName: "확률의 뜻과 성질",
    difficulty: "low",
    points: 5,
    options: ["1/6", "1/3", "1/2", "2/3"],
  },
  problem26: {
    id: "problem26",
    title: "확률 계산",
    content: "동전을 두 번 던질 때, 앞면이 한 번 나올 확률은?\n\n① 1/4\n② 1/2\n③ 3/4\n④ 1",
    type: "objective",
    unitName: "확률의 뜻과 성질",
    difficulty: "medium",
    points: 5,
    options: ["1/4", "1/2", "3/4", "1"],
  },
  problem27: {
    id: "problem27",
    title: "확률 계산",
    content: "1부터 10까지의 자연수 중에서 3의 배수를 뽑을 확률은?\n\n① 1/10\n② 3/10\n③ 1/3\n④ 3/5",
    type: "objective",
    unitName: "확률의 뜻과 성질",
    difficulty: "medium",
    points: 5,
    options: ["1/10", "3/10", "1/3", "3/5"],
  },
};

/**
 * 문제 계층 정보 타입
 */
export type ProblemHierarchy = {
  unit: string;
  subunit: string;
  detail: string;
  count: number;
};

/**
 * 문제 ID로부터 계층적 정보를 찾는 함수
 * @param problemId 문제 ID
 * @returns 계층 정보 또는 null
 */
export function findProblemHierarchy(problemId: string): ProblemHierarchy | null {
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
}

/**
 * 트리에서 문제를 찾는 함수
 * @param problemId 문제 ID
 * @returns 문제 노드 또는 null
 */
export function findProblemInTree(problemId: string): UnitTreeNode | null {
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
}

/**
 * 모든 문제 ID를 가져오는 함수
 * @param unit 단원 노드
 * @returns 문제 ID 배열
 */
export function getAllProblemIds(unit: UnitTreeNode): string[] {
  const ids: string[] = [];
  if (unit.children) {
    unit.children.forEach((child) => {
      if (child.id.startsWith("problem")) {
        ids.push(child.id);
      } else {
        ids.push(...getAllProblemIds(child));
      }
    });
  }
  return ids;
}

/**
 * 문제 ID에 따른 상세 문제 데이터를 생성하는 함수
 * @param problemId 문제 ID
 * @returns Problem 객체 또는 null
 */
export function generateProblemData(problemId: string): MockProblem | null {
  const problemData = problemDetailMap[problemId];
  
  if (!problemData) {
    // 기본 문제 데이터 (문제 ID가 매핑되지 않은 경우)
    return {
      id: problemId,
      title: `문제 ${problemId.replace("problem", "")}`,
      content: "이 문제의 상세 내용은 준비 중입니다.",
      type: "objective",
      unitName: "기본 단원",
      difficulty: "low",
      points: 5,
      options: ["보기 1", "보기 2", "보기 3", "보기 4"],
    };
  }

  return problemData;
}

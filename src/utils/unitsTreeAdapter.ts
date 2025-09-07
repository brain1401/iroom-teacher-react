/**
 * 단원 트리 데이터 어댑터 유틸리티
 * @description API에서 받은 단원 트리 데이터를 UnitTreeItem 컴포넌트가 사용할 수 있는 형태로 변환
 *
 * 주요 기능:
 * - 백엔드 응답을 프론트엔드 타입으로 변환
 * - CategoryNode, SubcategoryNode, UnitNode, ProblemNode를 UnitTreeNode로 변환
 * - 재귀적 children 구조로 평면화
 * - 문제 유형과 난이도 정보 매핑
 * - 컴포넌트에서 사용하기 쉬운 단일 타입으로 통일
 */

import type {
  CategoryNode,
  SubcategoryNode,
  UnitNode,
  UnitsTreeResponse,
} from "@/types/units-tree";
import type { Problem } from "@/types/exam-sheet";
import type { Grade } from "@/types/grade";
import type {
  BackendTreeNode,
  BackendQuestion,
  BackendApiResponse,
  BackendUnitsTreeResponse,
} from "@/types/units-tree-backend";

/**
 * UnitTreeItem 컴포넌트에서 사용하는 단원 트리 노드 타입
 */
export type UnitTreeNode = {
  /** 고유 식별자 */
  id: string;
  /** 표시될 이름 */
  name: string;
  /** 하위 노드들 */
  children?: UnitTreeNode[];
  /** 문제 유형 (문제 노드인 경우에만) */
  type?: "objective" | "subjective";
  /** 난이도 (문제 노드인 경우에만) */
  difficulty?: string;
  /** 원본 노드 타입 */
  originalType?: "category" | "subcategory" | "unit" | "problem";
};

/**
 * 문제 노드를 UnitTreeNode로 변환
 * @param problem 문제 노드 데이터
 * @returns 변환된 UnitTreeNode
 */
function convertProblemToTreeNode(problem: Problem): UnitTreeNode {
  return {
    id: problem.id,
    name: problem.title,
    type: problem.type,
    difficulty: problem.difficulty,
    originalType: "problem",
  };
}

/**
 * 단원 노드를 UnitTreeNode로 변환
 * @param unit 단원 노드 데이터
 * @returns 변환된 UnitTreeNode
 */
function convertUnitToTreeNode(unit: UnitNode): UnitTreeNode {
  return {
    id: unit.id,
    name: unit.name,
    originalType: "unit",
    children: unit.problems?.map(convertProblemToTreeNode) || [],
  };
}

/**
 * 중분류 노드를 UnitTreeNode로 변환
 * @param subcategory 중분류 노드 데이터
 * @returns 변환된 UnitTreeNode
 */
function convertSubcategoryToTreeNode(subcategory: SubcategoryNode): UnitTreeNode {
  return {
    id: subcategory.id,
    name: subcategory.name,
    originalType: "subcategory",
    children: subcategory.children.map(convertUnitToTreeNode),
  };
}

/**
 * 대분류 노드를 UnitTreeNode로 변환
 * @param category 대분류 노드 데이터
 * @returns 변환된 UnitTreeNode
 */
function convertCategoryToTreeNode(category: CategoryNode): UnitTreeNode {
  return {
    id: category.id,
    name: category.name,
    originalType: "category",
    children: category.children.map(convertSubcategoryToTreeNode),
  };
}

/**
 * API 단원 트리 응답을 UnitTreeItem에서 사용 가능한 형태로 변환
 * @param categories API에서 받은 대분류 노드 배열
 * @returns UnitTreeItem에서 사용 가능한 트리 노드 배열
 */
export function convertUnitsTreeForComponent(categories: CategoryNode[]): UnitTreeNode[] {
  return categories.map(convertCategoryToTreeNode);
}

/**
 * 트리에서 특정 문제 노드 찾기
 * @param treeNodes 트리 노드 배열
 * @param problemId 찾을 문제 ID
 * @returns 찾은 문제 노드 (없으면 undefined)
 */
export function findProblemInTree(
  treeNodes: UnitTreeNode[], 
  problemId: string
): UnitTreeNode | undefined {
  for (const node of treeNodes) {
    if (node.id === problemId && node.originalType === "problem") {
      return node;
    }
    
    if (node.children) {
      const found = findProblemInTree(node.children, problemId);
      if (found) return found;
    }
  }
  
  return undefined;
}

/**
 * 트리에서 특정 문제의 계층 경로 찾기
 * @param treeNodes 트리 노드 배열
 * @param problemId 찾을 문제 ID
 * @param path 현재까지의 경로
 * @returns 문제의 계층 경로 배열 (없으면 빈 배열)
 */
export function findProblemPath(
  treeNodes: UnitTreeNode[], 
  problemId: string, 
  path: string[] = []
): string[] {
  for (const node of treeNodes) {
    const currentPath = [...path, node.name];
    
    if (node.id === problemId && node.originalType === "problem") {
      return currentPath;
    }
    
    if (node.children) {
      const found = findProblemPath(node.children, problemId, currentPath);
      if (found.length > 0) return found;
    }
  }
  
  return [];
}

/**
 * 트리에서 선택된 문제들을 계층별로 그룹화
 * @param treeNodes 트리 노드 배열
 * @param selectedProblemIds 선택된 문제 ID Set
 * @returns 단원별로 그룹화된 선택된 문제들
 */
export function groupSelectedProblemsByUnit(
  treeNodes: UnitTreeNode[],
  selectedProblemIds: Set<string>
): Array<{
  unitId: string;
  unitName: string;
  problems: Array<{
    id: string;
    name: string;
    type: "objective" | "subjective";
    difficulty: string;
    path: string[];
  }>;
}> {
  const groups: Array<{
    unitId: string;
    unitName: string;
    problems: Array<{
      id: string;
      name: string;
      type: "objective" | "subjective";
      difficulty: string;
      path: string[];
    }>;
  }> = [];

  // 재귀적으로 트리를 순회하면서 선택된 문제들 찾기
  function traverseTree(nodes: UnitTreeNode[], parentPath: string[] = []) {
    for (const node of nodes) {
      const currentPath = [...parentPath, node.name];
      
      if (node.originalType === "unit" && node.children) {
        // 단원 레벨에서 선택된 문제들 수집
        const unitProblems = node.children
          .filter(child => child.originalType === "problem" && selectedProblemIds.has(child.id))
          .map(problem => ({
            id: problem.id,
            name: problem.name,
            type: problem.type || "objective" as const,
            difficulty: problem.difficulty || "medium",
            path: [...currentPath, problem.name],
          }));

        if (unitProblems.length > 0) {
          groups.push({
            unitId: node.id,
            unitName: node.name,
            problems: unitProblems,
          });
        }
      }
      
      if (node.children) {
        traverseTree(node.children, currentPath);
      }
    }
  }

  traverseTree(treeNodes);
  return groups;
}

/**
 * 백엔드 문제를 프론트엔드 문제 타입으로 변환
 */
function convertBackendQuestionToProblem(question: BackendQuestion, index: number = 0): Problem {
  return {
    id: question.id,
    number: index + 1, // 문제 번호 추가
    title: question.questionPreview,
    content: question.questionPreview, // 미리보기를 내용으로 사용
    type: question.questionType === "MULTIPLE_CHOICE" ? "objective" : "subjective",
    difficulty: question.difficulty === "하" ? "low" : 
                question.difficulty === "중" ? "medium" : "high",
    points: question.points,
    unitName: "", // 상위 단원에서 설정 필요
    // 선택적 필드들
    createdAt: new Date().toISOString(),
  };
}

/**
 * 백엔드 단원 트리 노드를 프론트엔드 타입으로 변환
 * @description 재귀적으로 백엔드 트리 구조를 프론트엔드 타입으로 변환
 */
function convertBackendNodeToFrontend(
  node: BackendTreeNode,
  parentId?: string
): CategoryNode | SubcategoryNode | UnitNode | null {
  const baseNode = {
    id: node.id,
    name: node.name,
    displayOrder: node.displayOrder,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  switch (node.type) {
    case "CATEGORY":
      return {
        ...baseNode,
        type: "category" as const,
        description: node.description || undefined,
        children: node.children
          .map(child => convertBackendNodeToFrontend(child, node.id))
          .filter((child): child is SubcategoryNode => 
            child !== null && child.type === "subcategory"
          ),
      } as CategoryNode;

    case "SUBCATEGORY":
      return {
        ...baseNode,
        type: "subcategory" as const,
        parentCategoryId: parentId || "",
        description: node.description || undefined,
        children: node.children
          .map(child => convertBackendNodeToFrontend(child, node.id))
          .filter((child): child is UnitNode => 
            child !== null && child.type === "unit"
          ),
      } as SubcategoryNode;

    case "UNIT":
      return {
        ...baseNode,
        type: "unit" as const,
        parentSubcategoryId: parentId || "",
        unitCode: node.unitCode || `UNIT_${node.id}`,
        grade: (node.grade?.toString() || "1") as Grade,
        description: node.description || undefined,
        problems: node.questions?.map((q, idx) => {
          const problem = convertBackendQuestionToProblem(q, idx);
          problem.unitName = node.name; // 단원명 설정
          return problem;
        }),
        children: [],
      } as UnitNode;

    default:
      console.warn(`Unknown node type: ${node.type}`);
      return null;
  }
}

/**
 * 백엔드 API 응답을 프론트엔드 UnitsTreeResponse로 변환
 * @description 백엔드의 평면적인 구조를 계층적인 프론트엔드 타입으로 변환
 */
/**
 * 백엔드 API 응답을 프론트엔드 UnitsTreeResponse로 변환
 * @description 백엔드의 평면적인 구조를 계층적인 프론트엔드 타입으로 변환
 */
export function convertBackendResponseToUnitsTree(
  backendData: BackendUnitsTreeResponse | { result: string; message: string; data: BackendUnitsTreeResponse },
  grade?: Grade,
  includeQuestions: boolean = false
): UnitsTreeResponse {
  // 백엔드 응답이 래핑된 경우와 아닌 경우를 모두 처리
  let treeData: BackendUnitsTreeResponse;
  
  // 응답이 { result, message, data } 형태인지 확인
  if (backendData && typeof backendData === 'object' && 'result' in backendData && 'data' in backendData) {
    // 래핑된 응답에서 data 추출
    treeData = (backendData as any).data;
    console.log('백엔드 응답 래핑 감지, data 추출:', { result: (backendData as any).result, hasData: !!treeData });
  } else if (Array.isArray(backendData)) {
    // 이미 배열 형태인 경우
    treeData = backendData;
  } else {
    // 예상치 못한 형태인 경우
    console.error('예상치 못한 백엔드 응답 형태:', backendData);
    throw new Error('잘못된 백엔드 응답 형태입니다.');
  }

  // 배열이 아닌 경우 에러 처리
  if (!Array.isArray(treeData)) {
    console.error('treeData가 배열이 아닙니다:', treeData);
    throw new Error('단원 트리 데이터는 배열 형태여야 합니다.');
  }

  // 백엔드 응답에서 최상위 카테고리 노드들만 추출 (type === "CATEGORY")
  const categoryNodes = treeData.filter(node => node.type === "CATEGORY");
  
  // 각 카테고리 노드를 프론트엔드 타입으로 변환
  const categories = categoryNodes
    .map(node => convertBackendNodeToFrontend(node))
    .filter((node): node is CategoryNode => 
      node !== null && node.type === "category"
    )
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 통계 계산
  let categoryCount = 0;
  let subcategoryCount = 0;
  let unitCount = 0;
  let totalProblemsCount = 0;

  function countNodes(nodes: (CategoryNode | SubcategoryNode | UnitNode)[]) {
    for (const node of nodes) {
      if (node.type === "category") {
        categoryCount++;
        countNodes(node.children);
      } else if (node.type === "subcategory") {
        subcategoryCount++;
        countNodes(node.children);
      } else if (node.type === "unit") {
        unitCount++;
        if (node.problems) {
          totalProblemsCount += node.problems.length;
        }
      }
    }
  }

  countNodes(categories);

  return {
    categories,
    grade,
    includeQuestions,
    stats: {
      categoryCount,
      subcategoryCount,
      unitCount,
      totalProblemsCount: includeQuestions ? totalProblemsCount : undefined,
    },
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * 백엔드 API 응답 래퍼를 벗겨내고 데이터 추출
 * @description ApiResponse<T> 형태의 백엔드 응답에서 data 부분만 추출
 */
export function extractBackendResponseData(
  response: BackendApiResponse<BackendUnitsTreeResponse>
): BackendUnitsTreeResponse {
  if (response.result !== "SUCCESS") {
    throw new Error(`API 응답 실패: ${response.message}`);
  }
  return response.data;
}
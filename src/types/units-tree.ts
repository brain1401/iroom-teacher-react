/**
 * 단원 트리 구조 타입 정의
 * @description 교육과정의 계층적 단원 구조를 나타내는 타입들
 *
 * 계층 구조: 대분류 → 중분류 → 세부단원 → 문제 목록
 *
 * 사용 예시:
 * - 대분류: "수와 연산", "문자와 식", "함수", "기하", "통계와 확률"
 * - 중분류: "정수와 유리수", "일차방정식", "이차방정식"
 * - 세부단원: "정수의 덧셈", "일차방정식의 해"
 * - 문제: 각 세부단원에 속한 구체적인 문제들
 */

import type { Grade } from "./grade";
import type { Problem } from "./exam-sheet";

export type { Problem } from "./exam-sheet";

/**
 * 단원 트리 노드의 기본 타입
 * @description 모든 트리 노드가 공통으로 가지는 속성들
 */
export type BaseTreeNode = {
  /** 노드 고유 ID */
  id: string;
  /** 노드 이름 */
  name: string;
  /** 표시 순서 (오름차순 정렬) */
  displayOrder: number;
  /** 생성일시 */
  createdAt: string;
  /** 수정일시 */
  updatedAt: string;
};

/**
 * 대분류 (Category) 타입
 * @description 교육과정의 최상위 분류 (수와 연산, 문자와 식 등)
 */
export type CategoryNode = BaseTreeNode & {
  /** 노드 타입 식별자 */
  type: "category";
  /** 대분류 설명 */
  description?: string;
  /** 하위 중분류 목록 */
  children: SubcategoryNode[];
};

/**
 * 중분류 (Subcategory) 타입
 * @description 대분류 하위의 중간 분류 (정수와 유리수, 일차방정식 등)
 */
export type SubcategoryNode = BaseTreeNode & {
  /** 노드 타입 식별자 */
  type: "subcategory";
  /** 상위 대분류 ID */
  parentCategoryId: string;
  /** 중분류 설명 */
  description?: string;
  /** 하위 세부단원 목록 */
  children: UnitNode[];
};

/**
 * 세부단원 (Unit) 타입
 * @description 실제 문제가 속하는 최하위 단원 (정수의 덧셈, 일차방정식의 해 등)
 */
export type UnitNode = BaseTreeNode & {
  /** 노드 타입 식별자 */
  type: "unit";
  /** 상위 중분류 ID */
  parentSubcategoryId: string;
  /** 단원 코드 (예: MATH_1_1_1) */
  unitCode: string;
  /** 대상 학년 */
  grade: Grade;
  /** 단원 설명 */
  description?: string;
  /** 학습 목표 */
  learningObjectives?: string[];
  /** 해당 단원의 문제 목록 (includeQuestions=true인 경우만) */
  problems?: Problem[];
  /** 하위 노드 없음 (리프 노드) */
  children: [];
};

/**
 * 단원 트리 노드의 유니온 타입
 * @description 모든 종류의 트리 노드를 포괄하는 타입
 */
export type UnitTreeNode = CategoryNode | SubcategoryNode | UnitNode;

/**
 * 단원 트리 전체 응답 타입
 * @description API에서 반환하는 전체 단원 트리 구조
 */
export type UnitsTreeResponse = {
  /** 대분류 노드들의 배열 (최상위 노드) */
  categories: CategoryNode[];
  /** 조회 기준 학년 */
  grade?: Grade;
  /** 문제 포함 여부 */
  includeQuestions: boolean;
  /** 전체 노드 개수 통계 */
  stats: {
    /** 대분류 개수 */
    categoryCount: number;
    /** 중분류 개수 */
    subcategoryCount: number;
    /** 세부단원 개수 */
    unitCount: number;
    /** 총 문제 개수 (includeQuestions=true인 경우) */
    totalProblemsCount?: number;
  };
  /** 조회일시 */
  fetchedAt: string;
};

/**
 * 단원 트리 조회 요청 파라미터 타입
 * @description API 호출 시 사용하는 쿼리 파라미터
 */
export type UnitsTreeQueryParams = {
  /** 특정 학년으로 필터링 (선택사항) */
  grade?: Grade;
  /** 문제 목록 포함 여부 (기본값: false) */
  includeQuestions?: boolean;
};

/**
 * 단원 트리 플래튼 아이템 타입
 * @description 트리 구조를 평면 리스트로 변환할 때 사용하는 타입
 */
export type FlattenedUnitTreeItem = {
  /** 노드 정보 */
  node: UnitTreeNode;
  /** 트리에서의 깊이 (0: 대분류, 1: 중분류, 2: 세부단원) */
  depth: number;
  /** 상위 노드들의 경로 */
  path: string[];
  /** 전체 경로 문자열 (예: "수와 연산 > 정수와 유리수 > 정수의 덧셈") */
  fullPath: string;
  /** 하위 노드 개수 */
  childrenCount: number;
  /** 해당 노드 이하의 총 문제 개수 */
  totalProblemsCount: number;
};

/**
 * 단원 선택 상태 타입
 * @description 사용자가 선택한 단원들을 추적하기 위한 타입
 */
export type UnitSelectionState = {
  /** 선택된 세부단원 ID들 */
  selectedUnitIds: Set<string>;
  /** 선택된 문제 ID들 */
  selectedProblemIds: Set<string>;
  /** 확장된 노드 ID들 (트리 UI에서 펼쳐진 노드) */
  expandedNodeIds: Set<string>;
  /** 검색어 */
  searchKeyword?: string;
  /** 필터링된 학년 */
  filteredGrade?: Grade;
};

/**
 * 단원 트리 검색 결과 타입
 * @description 검색 기능 사용 시 반환되는 결과
 */
export type UnitsTreeSearchResult = {
  /** 검색어 */
  keyword: string;
  /** 매칭된 노드들 */
  matchedNodes: Array<{
    node: UnitTreeNode;
    /** 매칭된 부분 (하이라이트용) */
    matchType: "name" | "description" | "unitCode";
    /** 매칭 위치 정보 */
    matchPosition: {
      start: number;
      end: number;
    };
  }>;
  /** 총 매칭 개수 */
  totalMatches: number;
};

/**
 * 단원 트리 로딩 상태 타입
 * @description CSR 방식으로 로딩할 때 사용하는 상태 타입
 */
export type UnitsTreeLoadingState = {
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 에러 정보 */
  error: Error | null;
  /** 데이터 */
  data: UnitsTreeResponse | null;
  /** 마지막 업데이트 시간 */
  lastUpdated: string | null;
  /** 재시도 횟수 */
  retryCount: number;
};

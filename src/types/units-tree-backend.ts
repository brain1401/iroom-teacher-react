/**
 * 백엔드 단원 트리 API 응답 타입 정의
 * @description 백엔드에서 실제로 반환하는 단원 트리 응답 타입
 */

/**
 * 백엔드 API 표준 응답 래퍼
 */
export type BackendApiResponse<T> = {
  result: string;
  message: string;
  data: T;
};

/**
 * 백엔드 단원 트리 노드 타입
 * @description 백엔드에서 반환하는 재귀적 트리 노드 구조
 */
export type BackendTreeNode = {
  id: string;
  name: string;
  type: BackendNodeType;
  grade: number | null;
  displayOrder: number;
  description: string;
  unitCode: string | null;
  children: BackendTreeNode[];
  questions: BackendQuestion[] | null;
};

/**
 * 백엔드 노드 타입 (대문자)
 */
export type BackendNodeType = "CATEGORY" | "SUBCATEGORY" | "UNIT";

/**
 * 백엔드 문제 타입
 */
export type BackendQuestion = {
  id: string;
  questionType: BackendQuestionType;
  difficulty: BackendDifficulty;
  points: number;
  questionPreview: string;
  questionTypeDisplayName: BackendQuestionTypeDisplayName;
  difficultyDisplayName: BackendDifficulty;
};

/**
 * 백엔드 문제 유형
 */
export type BackendQuestionType = "SUBJECTIVE" | "MULTIPLE_CHOICE";

/**
 * 백엔드 문제 유형 표시명
 */
export type BackendQuestionTypeDisplayName = "주관식" | "객관식";

/**
 * 백엔드 난이도
 */
export type BackendDifficulty = "하" | "중" | "상";

/**
 * 백엔드 단원 트리 전체 응답 타입 (data 배열)
 */
export type BackendUnitsTreeResponse = BackendTreeNode[];
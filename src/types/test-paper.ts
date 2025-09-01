/**
 * 문제지 데이터 타입
 * @description 문제지의 기본 정보를 담는 타입
 */
export type TestPaper = {
  /** 문제지 고유 ID */
  id: string;
  /** 단원명 */
  unitName: string;
  /** 문제지명 */
  testName: string;
  /** 문항 수 */
  questionCount: number;
  /** 생성일시 */
  createdAt?: string;
};

/**
 * 문제 데이터 타입
 * @description 문제지에 포함될 문제의 상세 정보
 */
export type Problem = {
  /** 문제 고유 ID */
  id: string;
  /** 문제 번호 */
  number: number;
  /** 문제 제목 */
  title: string;
  /** 문제 내용 */
  content: string;
  /** 문제 유형 */
  type: "objective" | "subjective";
  /** 단원명 */
  unitName: string;
  /** 난이도 */
  difficulty: "low" | "medium" | "high";
  /** 배점 */
  points: number;
  /** 객관식 보기 (객관식인 경우만) */
  options?: string[];
  /** 문제 이미지 URL */
  imageUrl?: string;
  /** 생성일시 */
  createdAt?: string;
};

/**
 * 문제지 생성 요청 타입
 * @description 문제지 생성에 필요한 정보
 */
export type TestPaperCreateRequest = {
  /** 문제지명 */
  testName: string;
  /** 총 문항수 */
  totalQuestions: number;
  /** 객관식 문항수 */
  objectiveCount: number;
  /** 주관식 문항수 */
  subjectiveCount: number;
  /** 학년 */
  grade: string;
  /** 선택된 문제 ID 목록 */
  selectedProblemIds: string[];
};
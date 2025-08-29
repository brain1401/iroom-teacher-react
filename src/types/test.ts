/**
 * 시험지 관련 타입 정의
 * @description 시험지 목록, 상세 정보, 등록 등에 사용되는 타입들
 *
 * 주요 타입:
 * - Test: 기본 시험지 정보
 * - TestDetail: 시험지 상세 정보
 * - TestQuestion: 시험 문항 정보
 * - TestSubmission: 시험 제출 현황
 * - TestLevel: 시험 난이도 구분
 * - TestStatus: 시험 상태 구분
 */

/**
 * 기본 시험지 정보 타입
 * @description 시험지 목록에서 사용되는 핵심 정보
 */
export type Test = {
  /** 시험지 고유 ID */
  id: string;
  /** 단원명 */
  unitName: string;
  /** 시험명 */
  testName: string;
  /** 문항 수 */
  questionCount: number;
  /** 시험 난이도 */
  questionLevel: TestLevel;
  /** 시험 상태 */
  status: TestStatus;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
};

/**
 * 시험지 상세 정보 타입
 * @description 시험지 상세 페이지에서 사용되는 확장 정보
 */
export type TestDetail = Test & {
  /** 시험 설명 */
  description?: string;
  /** 시험 시간 (분) */
  timeLimit?: number;
  /** 총점 */
  totalScore: number;
  /** 문항 목록 */
  questions: TestQuestion[];
  /** 시험 제출 현황 */
  submissions: TestSubmission[];
};
export type StudentTestSubmission = {
  studentId: string;
  studentName: string;
  testName: string;
  submittedAt: string; // 제출일자
  totalScore: number; // 총점
  answers: QuestionAnswer[]; // 문제별 답안 배열
};

export type QuestionAnswer = {
  questionId: string;
  questionText: string; // 문제 내용
  studentAnswer: string; // 학생 답안
  correctAnswer: string; // 정답
  isCorrect: boolean; // 정답 여부
  score: number; // 배점
  earnedScore: number; // 획득 점수
};
/**
 * 시험 문항 정보 타입
 * @description 개별 문항의 상세 정보
 */
export type TestQuestion = {
  /** 문항 번호 */
  number: number;
  /** 문항 유형 */
  type: "객관식" | "주관식" | "서술형";
  /** 문항 내용 */
  content: string;
  /** 배점 */
  score: number;
  /** 정답 */
  answer?: string;
  /** 보기 (객관식인 경우) */
  options?: string[];
};

/**
 * 시험 제출 현황 타입
 * @description 학생들의 시험 제출 상태 정보
 */
export type TestSubmission = {
  /** 학생 ID */
  studentId: string;
  /** 학생 이름 */
  studentName: string;
  /** 학생 전화번호 */
  phoneNumber: string;
  /** 시험명 */
  testName: string;
  /** 제출 상태 */
  status: "미제출" | "제출" | "제출완료";
  /** 제출 일시 */
  submittedAt?: string;
  /** 제출한 답안 */
  submittedAnswer?: string;
};

export type TestSubmitStatus = "미제출" | "제출" | "제출완료";

/**
 * 시험 난이도 구분 타입
 * @description 시험의 난이도 수준
 */
export type TestLevel = "기초" | "보통" | "심화" | "최고급";

/**
 * 시험 상태 구분 타입
 * @description 시험지의 현재 상태
 */
export type TestStatus =
  | "작성중"
  | "검토중"
  | "승인완료"
  | "배포중"
  | "시험중"
  | "종료";

/**
 * 시험지 생성 요청 타입
 * @description 새로운 시험지 등록 시 사용
 */
export type CreateTestRequest = {
  /** 단원명 */
  unitName: string;
  /** 시험명 */
  testName: string;
  /** 시험 설명 */
  description?: string;
  /** 시험 시간 (분) */
  timeLimit?: number;
  /** 시험 난이도 */
  level: TestLevel;
  /** 문항 목록 */
  questions: Omit<TestQuestion, "number">[];
};

/**
 * 시험지 수정 요청 타입
 * @description 기존 시험지 수정 시 사용
 */
export type UpdateTestRequest = Partial<CreateTestRequest> & {
  /** 수정할 시험지 ID */
  id: string;
};

/**
 * 시험지 검색 필터 타입
 * @description 시험지 목록 검색 시 사용
 */
export type TestSearchFilter = {
  /** 단원명 검색 */
  unitName?: string;
  /** 시험명 검색 */
  testName?: string;
  /** 난이도 필터 */
  level?: TestLevel;
  /** 상태 필터 */
  status?: TestStatus;
  /** 생성일 범위 */
  dateRange?: {
    start: string;
    end: string;
  };
};

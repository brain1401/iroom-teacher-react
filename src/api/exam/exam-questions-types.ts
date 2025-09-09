/**
 * 시험 문제 관련 타입 정의
 * @description 시험 인쇄 및 문제 조회에 사용되는 타입들
 */

/**
 * 문제 타입 열거형
 * @description 객관식, 주관식, 서술형 등 문제 유형
 */
export type QuestionType = "MULTIPLE_CHOICE" | "SHORT_ANSWER" | "ESSAY";

/**
 * 객관식 선택지 타입
 * @description 객관식 문제의 선택지 정보
 */
export type MultipleChoiceOption = {
  /** 선택지 번호 (1, 2, 3, 4, 5) */
  optionNumber: number;
  /** 선택지 내용 */
  content: string;
  /** 정답 여부 */
  isCorrect: boolean;
};

/**
 * 시험 문제 타입
 * @description 개별 문제의 상세 정보
 */
export type ExamQuestion = {
  /** 문제 ID */
  questionId: string;
  /** 문제 내용 (HTML 포함 가능) */
  questionText: string;
  /** 문제 타입 */
  questionType: QuestionType;
  /** 배점 */
  points: number;
  /** 객관식 선택지 (객관식 문제인 경우) */
  options?: MultipleChoiceOption[];
  /** 정답 (주관식/서술형 문제인 경우) */
  correctAnswer?: string;
  /** 해설 */
  explanation?: string;
  /** 단원 ID */
  unitId?: string;
  /** 단원명 */
  unitName?: string;
  /** 난이도 (1-5) */
  difficulty?: number;
  /** 문제 순서 */
  order: number;
};

/**
 * 시험 인쇄용 데이터 타입
 * @description 시험지 인쇄에 필요한 모든 정보를 포함
 */
export type ExamPrintData = {
  /** 시험 ID */
  examId: string;
  /** 시험 이름 */
  examName: string;
  /** 학년 */
  grade: number;
  /** 시험 내용/설명 */
  content?: string;
  /** 문제 목록 */
  questions: ExamQuestion[];
  /** 총 문제 수 */
  totalQuestions: number;
  /** 총 배점 */
  totalPoints: number;
  /** 객관식 문제 수 */
  objectiveCount?: number;
  /** 주관식 문제 수 */
  subjectiveCount?: number;
  /** 생성일시 */
  createdAt?: string;
  /** QR 코드 URL */
  qrCodeUrl?: string;
};

/**
 * 시험 문제 조회 응답 타입
 * @description API에서 반환하는 시험 문제 데이터
 */
export type ExamQuestionsResponse = {
  /** 시험 기본 정보 */
  examInfo: {
    examId: string;
    examName: string;
    grade: number;
    content?: string;
    createdAt?: string;
    qrCodeUrl?: string;
  };
  /** 문제 목록 */
  questions: ExamQuestion[];
  /** 통계 정보 */
  statistics: {
    totalQuestions: number;
    totalPoints: number;
    objectiveCount: number;
    subjectiveCount: number;
  };
};

/**
 * 인쇄 옵션 타입
 * @description 시험지 인쇄 시 선택할 수 있는 옵션들
 */
export type PrintOptions = {
  /** 인쇄 타입 */
  printType: "problem" | "answer" | "studentAnswer";
  /** 페이지당 문제 수 */
  questionsPerPage?: number;
  /** 답안 표시 여부 */
  showAnswers?: boolean;
  /** QR 코드 표시 여부 */
  showQrCode?: boolean;
  /** 해설 표시 여부 */
  showExplanations?: boolean;
};

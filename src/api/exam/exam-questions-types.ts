/**
 * 시험 문제 조회 API 타입 정의
 * @description GET /api/exams/{examId}/questions 응답 타입
 */

/**
 * 문제 유형
 */
export type QuestionType = "MULTIPLE_CHOICE" | "SUBJECTIVE";

/**
 * 문제 난이도
 */
export type Difficulty = "하" | "중" | "상";

/**
 * 선택 방법
 */
export type SelectionMethod = "RANDOM" | "FIXED";

/**
 * 시험 문제 정보
 */
export type ExamQuestion = {
  /** 문제 고유 ID */
  questionId: string;
  /** 문제 순서 */
  seqNo: number;
  /** 문제 유형 */
  questionType: QuestionType;
  /** 문제 내용 (HTML 형식, LaTeX 포함 가능) */
  questionText: string;
  /** 배점 */
  points: number;
  /** 난이도 */
  difficulty: Difficulty;
  /** 선택지 객체 (객관식인 경우) */
  choices: Record<string, any>;
  /** 이미지 URL 목록 */
  imageUrls: string[];
  /** 이미지 보유 여부 */
  hasImage: boolean;
  /** 선택 방법 */
  selectionMethod: SelectionMethod;
  /** 랜덤 선택 여부 */
  randomlySelected: boolean;
  /** 객관식 여부 */
  multipleChoice: boolean;
  /** 주관식 여부 */
  subjective: boolean;
};

/**
 * 시험 문제 조회 응답 데이터
 */
export type ExamQuestionsData = {
  /** 시험 ID */
  examId: string;
  /** 시험명 */
  examName: string;
  /** 학년 */
  grade: number;
  /** 총 문제 수 */
  totalQuestions: number;
  /** 객관식 문제 수 */
  multipleChoiceCount: number;
  /** 주관식 문제 수 */
  subjectiveCount: number;
  /** 총 배점 */
  totalPoints: number;
  /** 문제 목록 */
  questions: ExamQuestion[];
};

/**
 * 시험 문제 조회 API 응답
 */
export type ExamQuestionsResponse = {
  result: "SUCCESS";
  message: string;
  data: ExamQuestionsData;
};
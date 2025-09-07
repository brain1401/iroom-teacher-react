/**
 * 서버 API 응답 타입 정의
 * @description 실제 백엔드 API 응답 구조에 맞춘 타입 정의
 *
 * API 엔드포인트:
 * - GET /exams: 시험 목록 조회 (페이지네이션, 필터링)
 * - GET /exams/{examId}: 시험 상세 정보
 * - GET /exams/{examId}/submission-status: 제출 현황 상세
 * - GET /exams/statistics?type=by-grade: 시험 통계
 */

import type { ApiResponse } from "@/api/client";

/**
 * 시험지 정보 타입 (서버)
 */
export type ServerExamSheetInfo = {
  /** 시험지 고유 ID */
  id?: string;
  /** 시험지명 */
  examName?: string;
  /** 총 문항 수 */
  totalQuestions: number;
  /** 객관식 문항 수 */
  objectiveCount?: number;
  /** 주관식 문항 수 */
  subjectiveCount?: number;
  /** 총 배점 */
  totalPoints: number;
  /** 선택된 문제 상세 (UI용) */
  selectedProblems?: any;
  /** 생성일시 */
  createdAt?: string;
};

/**
 * 서버 시험 기본 정보 타입
 */
export type ServerExam = {
  /** 시험 고유 ID */
  id: string;
  /** 시험명 */
  examName: string;
  /** 학년 */
  grade: number;
  /** 시험 설명 */
  content: string;
  /** QR 코드 URL (nullable) */
  qrCodeUrl: string | null;
  /** 생성일시 */
  createdAt: string;
  /** 연관된 시험지 정보 (nullable) */
  examSheetInfo: ServerExamSheetInfo | null;
};

/**
 * Spring Pageable 구조 타입
 */
export type Pageable = {
  /** 페이지 번호 (0부터 시작) */
  pageNumber: number;
  /** 페이지 크기 */
  pageSize: number;
  /** 정렬 정보 */
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  /** 오프셋 */
  offset: number;
  /** 페이징 여부 */
  paged: boolean;
  /** 페이징 없음 여부 */
  unpaged: boolean;
};

/**
 * Spring Page 응답 구조 타입
 */
export type PageResponse<T> = {
  /** 현재 페이지 데이터 */
  content: T[];
  /** 페이지네이션 정보 */
  pageable: Pageable;
  /** 마지막 페이지 여부 */
  last: boolean;
  /** 전체 요소 개수 */
  totalElements: number;
  /** 전체 페이지 개수 */
  totalPages: number;
  /** 첫 번째 페이지 여부 */
  first: boolean;
  /** 현재 페이지 크기 */
  size: number;
  /** 현재 페이지 번호 */
  number: number;
  /** 정렬 정보 */
  sort: {
    sorted: boolean;
    empty: boolean;
    unsorted: boolean;
  };
  /** 현재 페이지 요소 개수 */
  numberOfElements: number;
  /** 비어있는 페이지 여부 */
  empty: boolean;
};

/**
 * 시험 목록 응답 타입
 */
export type ServerExamListResponse = ApiResponse<PageResponse<ServerExam>>;

/**
 * 시험 상세 응답 타입
 */
export type ServerExamDetailResponse = ApiResponse<ServerExam>;

/**
 * 제출 통계 정보 타입
 */
export type ServerSubmissionStats = {
  /** 실제 제출 수 */
  actualSubmissions: number;
  /** 최대 학생 수 */
  maxStudent: number;
  /** 미제출 수 */
  notSubmitted: number;
  /** 제출률 (백분율) */
  submissionRate: number;
  /** 통계 생성 시간 */
  statsGeneratedAt: string;
};

/**
 * 최근 제출 정보 타입
 */
export type ServerRecentSubmission = {
  /** 제출 ID */
  submissionId: string;
  /** 학생 ID */
  studentId: number;
  /** 학생명 */
  studentName: string;
  /** 제출 시간 */
  submittedAt: string;
};

/**
 * 시간별 제출 통계 타입
 */
export type ServerHourlyStats = {
  /** 시간 (YYYY-MM-DD HH:mm:ss 형식) */
  hour: string;
  /** 해당 시간의 제출 수 */
  submissionCount: number;
};

/**
 * 제출 현황 상세 정보 타입
 */
export type ServerSubmissionStatus = {
  /** 시험 기본 정보 */
  examInfo: ServerExam;
  /** 제출 통계 */
  submissionStats: ServerSubmissionStats;
  /** 최근 제출 목록 */
  recentSubmissions: ServerRecentSubmission[];
  /** 시간별 제출 통계 */
  hourlyStats: ServerHourlyStats[];
};

/**
 * 제출 현황 응답 타입
 */
export type ServerSubmissionStatusResponse =
  ApiResponse<ServerSubmissionStatus>;

/**
 * 시험 통계 정보 타입
 */
export type ServerExamStatistics = {
  /** 전체 시험 개수 */
  total: number;
  /** 학년별 백분율 */
  percentages: {
    /** 3학년 백분율 */
    grade3Percentage: number;
    /** 2학년 백분율 */
    grade2Percentage: number;
    /** 1학년 백분율 */
    grade1Percentage: number;
  };
  /** 3학년 시험 개수 */
  grade3: number;
  /** 2학년 시험 개수 */
  grade2: number;
  /** 1학년 시험 개수 */
  grade1: number;
};

/**
 * 시험 통계 응답 타입
 */
export type ServerExamStatisticsResponse = ApiResponse<ServerExamStatistics>;

/**
 * 시험 목록 API 필터 파라미터 타입
 */
export type ExamListFilters = {
  /** 학년 필터 (1, 2, 3) */
  grade?: number;
  /** 검색어 (시험명 부분 일치) */
  search?: string;
  /** 최근 시험만 조회 */
  recent?: boolean;
  /** 단원 정보 포함 여부 */
  includeUnits?: boolean;
  /** 페이지 번호 (0부터 시작) */
  page?: number;
  /** 페이지 크기 */
  size?: number;
  /** 정렬 (예: 'createdAt,desc') */
  sort?: string;
};

/**
 * 통계 조회 파라미터 타입
 */
export type ExamStatisticsParams = {
  /** 통계 타입 */
  type: "by-grade";
};

/**
 * 서버 학생 답안 상세 정보 - 문항별 답안 타입
 */
export type ServerQuestionAnswer = {
  /** 문항 고유 ID */
  questionId: string;
  /** 문항 번호 */
  questionNumber: number;
  /** 문항 내용 */
  questionText: string;
  /** 문항 유형 (객관식/주관식) */
  questionType: "MULTIPLE_CHOICE" | "SUBJECTIVE";
  /** 학생이 제출한 답안 */
  studentAnswer: string;
  /** 정답 */
  correctAnswer: string;
  /** 정답 여부 */
  isCorrect: boolean;
  /** 문항 배점 */
  maxScore: number;
  /** 학생이 획득한 점수 */
  obtainedScore: number;
  /** 문항 난이도 */
  difficulty?: "상" | "중" | "하";
  /** 채점 시간 */
  gradedAt?: string;
};

/**
 * 서버 학생 답안 상세 정보 메인 타입
 */
export type ServerStudentAnswerDetail = {
  /** 제출 ID */
  submissionId: string;

  /** 학생 정보 */
  studentInfo: {
    /** 학생 ID */
    studentId: number;
    /** 학생 이름 */
    studentName: string;
    /** 전화번호 */
    phoneNumber: string;
  };

  /** 시험 정보 */
  examInfo: {
    /** 시험 ID */
    examId: string;
    /** 시험명 */
    examName: string;
    /** 학년 */
    grade: number;
    /** 생성일시 */
    createdAt: string;
  };

  /** 제출 일시 */
  submittedAt: string;

  /** 전체 문제 수 */
  totalQuestions: number;

  /** 답변한 문제 수 */
  answeredQuestions: number;

  /** 문항별 답안 */
  questionAnswers: Array<{
    /** 문제 번호 */
    questionNumber: number;
    /** 문제 ID */
    questionId: string;
    /** 문제 유형 */
    questionType: "SUBJECTIVE" | "MULTIPLE_CHOICE";
    /** 문제 텍스트 */
    questionText: string;
    /** 객관식 선택지 (객관식인 경우) */
    choices?: string[] | null;
    /** 학생 답안 */
    studentAnswer: string;
    /** 정답 */
    correctAnswer: string;
    /** 답변 여부 */
    isAnswered: boolean;
    /** 최대 점수 */
    maxScore: number;
    /** 단원 정보 */
    unitInfo: {
      /** 단원 ID */
      unitId: string;
      /** 단원명 */
      unitName: string;
      /** 단원 코드 */
      unitCode: string;
    };
  }>;
};

/**
 * 학생 답안 상세 조회 응답 타입
 */
export type ServerStudentAnswerDetailResponse =
  ApiResponse<ServerStudentAnswerDetail>;

/**
 * 학생 답안 상세 조회 파라미터 타입
 */
export type StudentAnswerDetailParams = {
  /** 시험 ID */
  examId: string;
  /** 학생 ID */
  studentId: number;
};

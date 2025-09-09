/**
 * 시험 API 서버 응답 타입 정의
 * @description 실제 백엔드 API 응답 구조에 완전히 일치하는 TypeScript 타입
 *
 * 주요 특징:
 * - 서버 응답 구조와 100% 일치 (절대 데이터 변환 없음)
 * - Spring Boot Page 구조 포함
 * - ISO 8601 날짜 형식 사용
 * - camelCase 네이밍 적용
 */

/**
 * Spring Boot Pageable 정보 타입
 * @description 서버의 Pageable 객체와 동일
 */
export type ServerPageable = {
  /** 페이지 번호 (0부터 시작) */
  pageNumber: number;
  /** 페이지 크기 */
  pageSize: number;
  /** 정렬 정보 */
  sort: {
    /** 정렬 적용 여부 */
    sorted: boolean;
    /** 정렬 없음 여부 */
    empty: boolean;
    /** 정렬 미적용 여부 */
    unsorted: boolean;
  };
  /** 오프셋 */
  offset: number;
  /** 페이지 적용 여부 */
  paged: boolean;
  /** 페이지 미적용 여부 */
  unpaged: boolean;
};

/**
 * 시험지 정보 타입
 * @description 서버의 ExamSheetInfo와 동일
 */
export type ServerExamSheetInfo = {
  /** 시험지 ID */
  id?: string;
  /** 시험지 이름 */
  examName?: string;
  /** 총 문제 수 */
  totalQuestions: number;
  /** 객관식 문항 수 */
  objectiveCount?: number;
  /** 주관식 문항 수 */
  subjectiveCount?: number;
  /** 총 점수 */
  totalPoints: number;
  /** 선택된 문제 상세 (UI용) */
  selectedProblems?: any;
  /** 생성일시 (ISO 8601) */
  createdAt?: string;
};

/**
 * 시험 기본 정보 타입
 * @description 서버의 Exam 엔티티와 동일
 */
/**
 * 단원 정보 타입
 * @description 서버의 Unit 엔티티와 동일
 */
export type ServerUnit = {
  /** 단원 ID */
  id: string;
  /** 단원명 */
  unitName: string;
};

/**
 * 단원별 문항 수 정보 타입
 * @description 서버의 UnitQuestionCount와 동일
 */
export type ServerUnitQuestionCount = {
  /** 단원 ID */
  unitId: string;
  /** 단원명 */
  unitName: string;
  /** 문항 수 */
  questionCount: number;
  /** 총점 */
  totalPoints: number;
};

/**
 * 참여 현황 정보 타입
 * @description 서버의 AttendanceInfo와 동일
 */
export type ServerAttendanceInfo = {
  /** 실제 참여자 수 */
  actualAttendees: number;
  /** 총 배정 학생 수 */
  totalAssigned: number;
  /** 참여율 (%) */
  attendanceRate: number;
  /** 표시용 텍스트 (예: "24/40") */
  displayText: string;
};

export type ServerExam = {
  /** 시험 ID */
  id: string;
  /** 시험 이름 */
  examName: string;
  /** 학년 */
  grade: number;
  /** 시험 내용 */
  content: string;
  /** QR 코드 URL */
  qrCodeUrl: string | null;
  /** 생성일시 (ISO 8601) */
  createdAt: string;
  /** 시험지 정보 (없을 수 있음) */
  examSheetInfo: ServerExamSheetInfo | null;
  /** 참여 현황 정보 (includeUnits=true 시 포함) */
  attendanceInfo?: ServerAttendanceInfo;
  /** 단원 목록 (includeUnits=true 시 포함) */
  units?: ServerUnit[];
  /** 단원별 문항 수 정보 (includeUnits=true 시 포함) */
  unitQuestionCounts?: ServerUnitQuestionCount[];
  /** 총 문항 수 (includeUnits=true 시 포함) */
  totalQuestions?: number;
  /** 단원 개수 (includeUnits=true 시 포함) */
  unitCount?: number;
  /** 총점 (includeUnits=true 시 포함) */
  totalPoints?: number;
};

/**
 * 시험 목록 응답 타입
 * @description 서버의 Page<Exam> 응답 구조와 동일
 */
export type ServerExamListResponse = {
  /** 시험 목록 */
  content: ServerExam[];
  /** 페이지 정보 */
  pageable: ServerPageable;
  /** 마지막 페이지 여부 */
  last: boolean;
  /** 총 요소 수 */
  totalElements: number;
  /** 총 페이지 수 */
  totalPages: number;
  /** 첫 페이지 여부 */
  first: boolean;
  /** 현재 페이지 크기 */
  size: number;
  /** 현재 페이지 번호 */
  number: number;
  /** 정렬 정보 */
  sort: {
    /** 정렬 적용 여부 */
    sorted: boolean;
    /** 정렬 없음 여부 */
    empty: boolean;
    /** 정렬 미적용 여부 */
    unsorted: boolean;
  };
  /** 현재 페이지 요소 수 */
  numberOfElements: number;
  /** 빈 페이지 여부 */
  empty: boolean;
};

/**
 * 최근 제출 정보 타입
 * @description 서버의 RecentSubmission과 동일
 */
export type ServerRecentSubmission = {
  /** 제출 ID */
  submissionId: string;
  /** 학생 ID */
  studentId: number;
  /** 학생 이름 */
  studentName: string;
  /** 제출일시 (ISO 8601) */
  submittedAt: string;
};

/**
 * 제출 통계 정보 타입
 * @description 서버의 SubmissionStats와 동일
 */
export type ServerSubmissionStats = {
  /** 총 예상 학생 수 */
  totalExpectedStudents: number;
  /** 실제 제출 수 */
  actualSubmissions: number;
  /** 미제출 수 */
  notSubmitted: number;
  /** 제출률 (%) */
  submissionRate: number;
  /** 통계 생성일시 (ISO 8601) */
  statsGeneratedAt: string;
};

/**
 * 시간별 제출 통계 타입
 * @description 서버의 HourlyStats와 동일
 */
export type ServerHourlyStats = {
  /** 시간 (yyyy-MM-dd HH:mm:ss) */
  hour: string;
  /** 해당 시간 제출 수 */
  submissionCount: number;
};

/**
 * 시험 제출 현황 상세 응답 타입
 * @description 서버의 SubmissionStatusResponse와 동일
 */
export type ServerExamSubmissionStatusResponse = {
  /** 시험 정보 */
  examInfo: ServerExam;
  /** 제출 통계 */
  submissionStats: ServerSubmissionStats;
  /** 최근 제출 목록 */
  recentSubmissions: ServerRecentSubmission[];
  /** 시간별 제출 통계 */
  hourlyStats: ServerHourlyStats[];
};

/**
 * 시험 통계 응답 타입
 * @description 서버의 ExamStatistics와 동일
 */
export type ServerExamStatisticsResponse = {
  /** 총 시험 수 */
  total: number;
  /** 학년별 백분율 */
  percentages: {
    /** 1학년 백분율 */
    grade1Percentage: number;
    /** 2학년 백분율 */
    grade2Percentage: number;
    /** 3학년 백분율 */
    grade3Percentage: number;
  };
  /** 1학년 시험 수 */
  grade1: number;
  /** 2학년 시험 수 */
  grade2: number;
  /** 3학년 시험 수 */
  grade3: number;
};

/**
 * 시험 목록 조회 필터 파라미터 타입
 * @description API 요청 시 사용하는 쿼리 파라미터
 */
export type ServerExamListParams = {
  /** 학년 (1, 2, 3) */
  grade?: number;
  /** 검색 키워드 */
  search?: string;
  /** 최근 시험 필터 */
  recent?: boolean;
  /** 단원 정보 포함 여부 */
  includeUnits?: boolean;
  /** 페이지 번호 (0부터 시작) */
  page?: number;
  /** 페이지 크기 (기본 20) */
  size?: number;
  /** 정렬 기준 (기본 createdAt,desc) */
  sort?: string;
};

/**
 * 시험 통계 조회 파라미터 타입
 * @description 통계 API 요청 시 사용하는 쿼리 파라미터
 */
export type ServerExamStatisticsParams = {
  /** 통계 타입 (기본 by-grade) */
  type?: "by-grade";
};

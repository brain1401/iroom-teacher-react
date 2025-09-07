/**
 * 시험 관련 타입 정의
 * @description 서버 API와 일치하는 시험 관리 타입들 및 UI 전용 타입들
 *
 * 주요 특징:
 * - 서버 타입은 @/api/exam에서 import
 * - UI 전용 타입만 여기에 정의
 * - 기존 가데이터 타입 완전 제거
 */

// 서버 타입들 re-export (API 응답과 100% 일치)
export type {
  ServerExam as Exam,
  ServerExamListResponse as ExamListResponse,
  ServerSubmissionStatusResponse as ExamSubmissionStatusResponse,
  ServerExamStatisticsResponse as ExamStatisticsResponse,
  ServerExamSheetInfo as ExamSheetInfo,
  ServerRecentSubmission as RecentSubmission,
  ServerSubmissionStats as SubmissionStats,
  ServerHourlyStats as HourlyStats,
  Pageable,
} from "@/types/server-exam";

export type { ExamListFilters as ServerExamListParams } from "@/types/server-exam";

/**
 * UI 전용 검색 범위 타입
 * @description 프론트엔드 검색 UI에서 사용하는 범위 설정
 */
export type SearchScope = "all" | "examName" | "content";

/**
 * UI 전용 시험 목록 필터 타입
 * @description 프론트엔드 필터 컴포넌트에서 사용하는 필터 상태
 *
 * 서버 파라미터와 매핑:
 * - searchKeyword → search (API 파라미터)
 * - selectedGrade → grade (API 파라미터)
 * - searchScope → UI에서만 사용 (내부 처리)
 */
export type ExamListFilters = {
  /** 검색 키워드 */
  searchKeyword: string;
  /** 검색 범위 (UI에서만 사용) */
  searchScope: SearchScope;
  /** 선택된 학년 (1, 2, 3 또는 빈 문자열) */
  selectedGrade: string;
};

/**
 * UI 전용 학년 옵션 타입
 * @description 학년 선택 드롭다운에서 사용
 */
export type GradeOption = {
  /** 표시 라벨 */
  label: string;
  /** 실제 값 (빈 문자열은 전체) */
  value: string;
  /** 학년 번호 (API 파라미터용, undefined는 전체) */
  grade?: number;
};

/**
 * 기본 학년 옵션 상수
 */
export const GRADE_OPTIONS: GradeOption[] = [
  { label: "전체", value: "", grade: undefined },
  { label: "1학년", value: "1", grade: 1 },
  { label: "2학년", value: "2", grade: 2 },
  { label: "3학년", value: "3", grade: 3 },
];

/**
 * UI 전용 검색 범위 옵션 타입
 */
export type SearchScopeOption = {
  /** 표시 라벨 */
  label: string;
  /** 실제 값 */
  value: SearchScope;
};

/**
 * 기본 검색 범위 옵션 상수
 */
export const SEARCH_SCOPE_OPTIONS: SearchScopeOption[] = [
  { label: "전체", value: "all" },
  { label: "시험명", value: "examName" },
  { label: "내용", value: "content" },
];

/**
 * 필터를 서버 파라미터로 변환하는 유틸리티 타입
 * @description ExamListFilters를 ServerExamListParams로 변환
 */
export type FilterToServerParams = (filters: ExamListFilters) => {
  search?: string;
  grade?: number;
  page?: number;
  size?: number;
};

/**
 * 필터 변환 유틸리티 함수
 */
export const convertFiltersToServerParams: FilterToServerParams = (filters) => {
  const params: ReturnType<FilterToServerParams> = {};

  // 검색어 처리
  if (filters.searchKeyword && filters.searchKeyword.trim()) {
    params.search = filters.searchKeyword.trim();
  }

  // 학년 처리
  if (filters.selectedGrade && filters.selectedGrade !== "") {
    const gradeNumber = parseInt(filters.selectedGrade, 10);
    if (!isNaN(gradeNumber) && gradeNumber >= 1 && gradeNumber <= 3) {
      params.grade = gradeNumber;
    }
  }

  return params;
};

/**
 * UI 전용 시험 상태 타입
 * @description 프론트엔드에서 시험 상태를 관리할 때 사용하는 타입
 */
export type ExamStatus = "승인대기" | "승인완료" | "거절" | "진행중" | "완료";

/**
 * UI 전용 시험 제출 상태 상세 타입
 * @description 시험 제출 상태의 상세 정보를 나타내는 UI 전용 타입
 */
export type ExamSubmitStatusDetail = {
  /** 제출 상태 ID */
  id: string;
  /** 학생 정보 */
  student: {
    /** 학생 ID */
    id: string;
    /** 학생명 */
    name: string;
  };
  /** 시험명 */
  examName: string;
  /** 제출 날짜 */
  submissionDate: string;
  /** 제출 시간 */
  submittedAt: string;
  /** 점수 (nullable) */
  score: number | null;
  /** 총점 */
  totalScore: number;
  /** 제출 상태 */
  status: "submitted" | "not_submitted" | "late";
  /** 제출 상태 (문자열) */
  submissionStatus: string;
  /** 정답 개수 */
  correctAnswerCount: number;
  /** 오답 개수 */
  wrongAnswerCount: number;
};

/**
 * 대시보드 시험 제출 현황 UI 타입
 * @description 대시보드에서 시험 제출 현황을 표시할 때 사용하는 UI 전용 타입
 *
 * 특징:
 * - 서버 ExamSubmissionInfo에서 UI에 필요한 형태로 변환된 타입
 * - 제출률 계산 및 상태 판정 포함
 * - 대시보드 테이블 및 카드 컴포넌트에서 사용
 */
export type DashboardExamSubmission = {
  /** 시험 고유 ID */
  id: string;
  /** 시험 제목 */
  examTitle: string;
  /** 단원명 (UI에서 자동 생성) */
  unitName: string;
  /** 생성 일시 */
  createdAt: string;
  /** 제출한 학생 수 */
  submissionCount: number;
  /** 전체 학생 수 */
  totalStudents: number;
  /** 제출률 (0-100, 소수점 첫째 자리까지) */
  submissionRate: number;
  /** 시험 상태 */
  status: ExamStatus;
};

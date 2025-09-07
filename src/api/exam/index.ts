/**
 * 시험 API 모듈 통합 export
 * @description 시험 관련 API의 모든 기능을 한 곳에서 export
 */

// API 클라이언트 함수들
export {
  fetchExamList,
  fetchExamDetail,
  fetchSubmissionStatus,
  fetchExamStatistics,
} from "./api";

// TanStack Query 옵션들
export {
  examKeys,
  examListQueryOptions,
  examDetailQueryOptions,
  submissionStatusQueryOptions,
  examStatisticsQueryOptions,
  defaultExamStatisticsQueryOptions,
  examQueryInvalidation,
  examPreloadQueries,
} from "./query";

// 서버 응답 타입들은 src/types/server-exam.ts에서 re-export
export type {
  ServerExam,
  ServerExamSheetInfo,
  ServerSubmissionStatus,
  ServerSubmissionStats,
  ServerRecentSubmission,
  ServerHourlyStats,
  ServerExamStatistics,
  PageResponse,
  ExamListFilters,
  ExamStatisticsParams,
} from "@/types/server-exam";

// API 전용 타입들
export type { ServerExamListParams } from "./types";
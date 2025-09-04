/**
 * Dashboard API 모듈
 * @description 대시보드 관련 API 함수들과 React Query 옵션들을 통합 export
 */

// API 함수들
export { fetchRecentExamsStatus, fetchScoreDistribution } from "./api";

// React Query 옵션들
export {
  recentExamsStatusQueryOptions,
  scoreDistributionQueryOptions,
  dashboardKeys,
} from "./query";

// 타입 정의들
export type {
  // 서버 응답 타입
  RecentExamsStatusResponse,
  ScoreDistributionResponse,
  ExamSubmissionInfo,
  ScoreDistribution,
  ScoreStatistics,
  
  // 요청 파라미터 타입
  RecentExamsStatusParams,
  ScoreDistributionParams,
} from "./types";
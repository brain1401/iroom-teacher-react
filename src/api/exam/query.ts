/**
 * 시험 관리 TanStack Query 옵션 정의
 * @description Jotai atomWithQuery와 TanStack Start loader에서 사용할 쿼리 옵션들
 * 
 * 패턴:
 * - queryKey 팩토리로 키 관리
 * - queryFn에서 API 함수 호출
 * - 적절한 staleTime, gcTime 설정
 * - 에러 핸들링 및 재시도 로직
 */

import { queryOptions } from "@tanstack/react-query";
import {
  fetchExamList,
  fetchExamDetail,
  fetchSubmissionStatus,
  fetchExamStatistics,
} from "./api";
import type { ExamListFilters, ExamStatisticsParams } from "@/types/server-exam";

/**
 * 시험 관련 쿼리 키 팩토리
 * @description 계층적 쿼리 키 구조로 효율적인 캐시 무효화 지원
 */
export const examKeys = {
  /** 모든 시험 관련 쿼리 */
  all: ["exam"] as const,
  
  /** 시험 목록 쿼리들 */
  lists: () => [...examKeys.all, "list"] as const,
  /** 특정 필터 조건의 시험 목록 */
  list: (filters: ExamListFilters) => [...examKeys.lists(), filters] as const,
  
  /** 시험 상세 정보 쿼리들 */
  details: () => [...examKeys.all, "detail"] as const,
  /** 특정 시험의 상세 정보 */
  detail: (examId: string) => [...examKeys.details(), examId] as const,
  
  /** 제출 현황 쿼리들 */
  submissions: () => [...examKeys.all, "submission"] as const,
  /** 특정 시험의 제출 현황 */
  submission: (examId: string) => [...examKeys.submissions(), examId] as const,
  
  /** 통계 쿼리들 */
  statistics: () => [...examKeys.all, "statistics"] as const,
  /** 특정 타입의 통계 */
  statistic: (params: ExamStatisticsParams) => [...examKeys.statistics(), params] as const,
};

/**
 * 시험 목록 쿼리 옵션
 * @description 페이지네이션과 필터링을 지원하는 시험 목록 쿼리
 * 
 * 캐시 전략:
 * - staleTime: 5분 (목록 데이터는 자주 변경되지 않음)
 * - gcTime: 10분 (메모리에서 제거되기까지의 시간)
 * - 재시도: 3회 (네트워크 오류 대응)
 */
export const examListQueryOptions = (filters: ExamListFilters = {}) => 
  queryOptions({
    queryKey: examKeys.list(filters),
    queryFn: () => fetchExamList(filters),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 3, // 실패 시 3회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 지수 백오프
  });

/**
 * 시험 상세 정보 쿼리 옵션
 * @description 특정 시험의 상세 정보 및 시험지 정보 쿼리
 * 
 * 캐시 전략:
 * - staleTime: 10분 (상세 정보는 자주 변경되지 않음)
 * - gcTime: 30분 (상세 정보는 오래 보관)
 * - 재시도: 2회 (404 에러 등을 고려)
 */
export const examDetailQueryOptions = (examId: string) =>
  queryOptions({
    queryKey: examKeys.detail(examId),
    queryFn: () => fetchExamDetail(examId),
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    retry: 2, // 실패 시 2회 재시도
    enabled: !!examId, // examId가 있을 때만 쿼리 실행
  });

/**
 * 시험 제출 현황 쿼리 옵션
 * @description 특정 시험의 제출 현황, 통계, 최근 제출 목록 쿼리
 * 
 * 캐시 전략:
 * - staleTime: 2분 (제출 현황은 실시간성이 중요)
 * - gcTime: 5분 (짧은 캐시 유지)
 * - 재시도: 3회 (통계 데이터 안정성)
 */
export const submissionStatusQueryOptions = (examId: string) =>
  queryOptions({
    queryKey: examKeys.submission(examId),
    queryFn: () => fetchSubmissionStatus(examId),
    staleTime: 2 * 60 * 1000, // 2분간 fresh 상태 유지 (실시간성 중요)
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    retry: 3, // 실패 시 3회 재시도
    enabled: !!examId, // examId가 있을 때만 쿼리 실행
  });

/**
 * 시험 통계 쿼리 옵션
 * @description 학년별 시험 분포 등의 통계 정보 쿼리
 * 
 * 캐시 전략:
 * - staleTime: 15분 (통계는 자주 변경되지 않음)
 * - gcTime: 30분 (통계 정보는 오래 보관)
 * - 재시도: 2회 (통계 계산 안정성)
 */
export const examStatisticsQueryOptions = (params: ExamStatisticsParams) =>
  queryOptions({
    queryKey: examKeys.statistic(params),
    queryFn: () => fetchExamStatistics(params),
    staleTime: 15 * 60 * 1000, // 15분간 fresh 상태 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    retry: 2, // 실패 시 2회 재시도
  });

/**
 * 기본 학년별 통계 쿼리 옵션
 * @description 가장 자주 사용되는 학년별 통계 쿼리의 편의 함수
 */
export const defaultExamStatisticsQueryOptions = () =>
  examStatisticsQueryOptions({ type: "by-grade" });

/**
 * 쿼리 무효화 헬퍼 함수들
 * @description 데이터 변경 시 관련 쿼리들을 무효화하는 헬퍼 함수들
 */
export const examQueryInvalidation = {
  /** 모든 시험 관련 쿼리 무효화 */
  all: () => examKeys.all,
  
  /** 시험 목록 쿼리들 무효화 */
  lists: () => examKeys.lists(),
  
  /** 특정 시험의 모든 관련 쿼리 무효화 */
  examRelated: (examId: string) => [
    examKeys.detail(examId),
    examKeys.submission(examId),
  ],
  
  /** 통계 관련 쿼리들 무효화 */
  statistics: () => examKeys.statistics(),
};

/**
 * 미리 로드할 쿼리 조합 (SSR 최적화용)
 * @description TanStack Start loader에서 사용할 쿼리 조합들
 */
export const examPreloadQueries = {
  /** 메인 목록 페이지 미리 로드 */
  mainPage: (filters: ExamListFilters = {}) => [
    examListQueryOptions(filters),
    defaultExamStatisticsQueryOptions(),
  ],
  
  /** 시험 상세 페이지 미리 로드 */
  detailPage: (examId: string) => [
    examDetailQueryOptions(examId),
    submissionStatusQueryOptions(examId),
  ],
};
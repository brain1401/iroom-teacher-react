/**
 * 통계 관련 React Query 옵션들
 * @description TanStack Query를 위한 쿼리 키와 옵션 정의
 */

import { queryOptions } from "@tanstack/react-query";
import { fetchUnitWrongAnswerRates, fetchScoreDistribution } from "./api";
import type {
  UnitWrongAnswerRatesResponse,
  ScoreDistributionResponse,
  StatisticsParams,
} from "./types";

/**
 * 통계 쿼리 키 팩토리
 * @description 일관된 쿼리 키 생성을 위한 헬퍼 객체
 */
export const statisticsKeys = {
  /** 모든 통계 관련 쿼리 */
  all: ["statistics"] as const,

  /** 단원별 오답률 관련 쿼리들 */
  unitWrongAnswers: () =>
    [...statisticsKeys.all, "unit-wrong-answers"] as const,
  unitWrongAnswer: (params: StatisticsParams) =>
    [...statisticsKeys.unitWrongAnswers(), params] as const,

  /** 성적 분포 관련 쿼리들 */
  scoreDistributions: () =>
    [...statisticsKeys.all, "score-distributions"] as const,
  scoreDistribution: (params: StatisticsParams) =>
    [...statisticsKeys.scoreDistributions(), params] as const,
};

/**
 * 단원별 오답률 쿼리 옵션
 * @description 단원별 오답률 데이터를 위한 React Query 설정
 *
 * @param params 쿼리 파라미터
 * @returns TanStack Query 옵션 객체
 */
export const unitWrongAnswerRatesQueryOptions = (params: StatisticsParams) =>
  queryOptions({
    queryKey: statisticsKeys.unitWrongAnswer(params),
    queryFn: () => fetchUnitWrongAnswerRates(params),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 2, // 2회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

/**
 * 성적 분포도 쿼리 옵션
 * @description 성적 분포 데이터를 위한 React Query 설정
 *
 * @param params 쿼리 파라미터
 * @returns TanStack Query 옵션 객체
 */
export const scoreDistributionQueryOptions = (params: StatisticsParams) =>
  queryOptions({
    queryKey: statisticsKeys.scoreDistribution(params),
    queryFn: () => fetchScoreDistribution(params),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 2, // 2회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

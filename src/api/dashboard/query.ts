import { queryOptions } from "@tanstack/react-query";
import { ApiError } from "@/api/client";
import { fetchRecentExamsStatus, fetchScoreDistribution } from "./api";
import type {
  RecentExamsStatusResponse,
  RecentExamsStatusParams,
  ScoreDistributionResponse,
  ScoreDistributionParams,
} from "./types";

/**
 * Dashboard 쿼리 키 관리 객체
 * @description React Query에서 사용하는 대시보드 관련 캐시 키들을 체계적으로 관리
 */
export const dashboardKeys = {
  /** 모든 대시보드 관련 쿼리의 기본 키 */
  all: ["dashboard"] as const,
  /** 시험 제출 현황 쿼리들의 기본 키 */
  recentExams: () => [...dashboardKeys.all, "recent-exams"] as const,
  /** 특정 조건의 시험 제출 현황 쿼리 키 */
  recentExamsStatus: (params: RecentExamsStatusParams) =>
    [...dashboardKeys.recentExams(), params] as const,
  /** 성적 분포도 쿼리들의 기본 키 */
  scoreDistributions: () => [...dashboardKeys.all, "score-distribution"] as const,
  /** 특정 학년의 성적 분포도 쿼리 키 */
  scoreDistribution: (params: ScoreDistributionParams) =>
    [...dashboardKeys.scoreDistributions(), params] as const,
} as const;

/**
 * 최근 시험 제출 현황 조회를 위한 React Query 옵션 생성 함수
 * @description useQuery 훅에서 사용할 수 있는 쿼리 옵션을 생성
 *
 * 주요 기능:
 * - 학년별 최근 시험 제출 현황 조회
 * - 자동 캐싱 및 재시도 처리
 * - 에러 상태 관리
 * - 백그라운드 업데이트
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @param params.limit 조회할 최근 시험 개수 (기본값: 10)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data, isLoading, error } = useQuery(
 *   recentExamsStatusQueryOptions({ grade: 2, limit: 5 })
 * );
 *
 * // Jotai atomWithQuery와 함께 사용
 * const recentExamsAtom = atomWithQuery((get) => 
 *   recentExamsStatusQueryOptions({ grade: get(gradeAtom) })
 * );
 * ```
 */
export const recentExamsStatusQueryOptions = (
  params: RecentExamsStatusParams
) => {
  return queryOptions({
    queryKey: dashboardKeys.recentExamsStatus(params),
    queryFn: async ({ signal }): Promise<RecentExamsStatusResponse> => {
      return await fetchRecentExamsStatus(params);
    },
    staleTime: 3 * 60 * 1000, // 3분간 데이터를 신선하다고 간주 (대시보드 데이터는 자주 업데이트)
    gcTime: 10 * 60 * 1000, // 10분간 캐시에 보관
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음 (존재하지 않는 학년)
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      // 401 에러는 재시도하지 않음 (인증 실패)
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      // 다른 에러는 최대 2번까지 재시도
      return failureCount < 2;
    },
    // 학년이 유효한 경우에만 쿼리 실행
    enabled: params.grade >= 1 && params.grade <= 3,
    // 5분마다 백그라운드에서 자동 갱신
    refetchInterval: 5 * 60 * 1000,
  });
};

/**
 * 성적 분포도 조회를 위한 React Query 옵션 생성 함수
 * @description 학년별 성적 분포도 데이터를 가져오는 쿼리 옵션을 생성
 *
 * 주요 기능:
 * - 점수 구간별 학생 분포 조회
 * - 통계 정보 (평균, 중앙값, 표준편차) 제공
 * - 합격률, 우수율 계산
 * - 캐싱을 통한 성능 최적화
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data: scoreData, isLoading, error } = useQuery(
 *   scoreDistributionQueryOptions({ grade: 1 })
 * );
 *
 * // 성적 분포 차트에서 사용
 * const chartData = scoreData?.distributions.map(dist => ({
 *   range: dist.scoreRange,
 *   count: dist.studentCount,
 *   percentage: dist.percentage
 * }));
 * ```
 */
export const scoreDistributionQueryOptions = (
  params: ScoreDistributionParams
) => {
  return queryOptions({
    queryKey: dashboardKeys.scoreDistribution(params),
    queryFn: async ({ signal }): Promise<ScoreDistributionResponse> => {
      return await fetchScoreDistribution(params);
    },
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 신선하다고 간주 (성적 데이터는 상대적으로 안정적)
    gcTime: 15 * 60 * 1000, // 15분간 캐시에 보관 (성적 분포는 더 오래 캐시)
    retry: (failureCount, error) => {
      // 404 에러는 재시도하지 않음 (존재하지 않는 학년)
      if (error instanceof ApiError && error.status === 404) {
        return false;
      }
      // 401 에러는 재시도하지 않음 (인증 실패)
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }
      // 다른 에러는 최대 2번까지 재시도
      return failureCount < 2;
    },
    // 학년이 유효한 경우에만 쿼리 실행
    enabled: params.grade >= 1 && params.grade <= 3,
    // 성적 분포는 자주 변하지 않으므로 자동 갱신 비활성화
    refetchOnWindowFocus: false,
  });
};
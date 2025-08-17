import { queryOptions } from "@tanstack/react-query";
import { fetchHealthCheck } from "./api";
import type { HealthCheckResponse } from "./types";

/**
 * 헬스체크 쿼리 키 관리 객체
 * @description React Query에서 사용하는 캐시 키들을 체계적으로 관리
 */
export const healthCheckKeys = {
  /** 모든 헬스체크 관련 쿼리의 기본 키 */
  all: ["health-check"] as const,
  /** 헬스체크 쿼리들의 기본 키 */
  health: () => [...healthCheckKeys.all, "health"] as const,
  /** 헬스체크 쿼리 키 */
  healthCheck: () => [...healthCheckKeys.health(), "check"] as const,
} as const;

/**
 * 백엔드 서버 헬스체크를 위한 React Query 옵션 생성 함수
 * @description 백엔드 서버의 상태를 정기적으로 확인하는 쿼리 옵션을 생성
 *
 * 헬스체크 특징:
 * - 개발 환경에서만 활성화
 * - 30초마다 자동으로 상태 확인
 * - 에러 발생 시에도 계속 재시도
 * - 빠른 타임아웃과 짧은 캐시 시간
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data: health, isLoading, error } = useQuery(healthCheckQueryOptions());
 *
 * // Jotai atomWithQuery와 함께 사용
 * const healthAtom = atomWithQuery(() => healthCheckQueryOptions());
 * ```
 *
 * @param options 추가 옵션
 * @param options.enabled 쿼리 활성화 여부 (기본값: 개발 환경에서만 true)
 * @param options.refetchInterval 자동 재요청 간격 (기본값: 30초)
 * @returns React Query에서 사용할 쿼리 옵션 객체
 */
export const healthCheckQueryOptions = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) => {
  // 개발 환경 체크 (Vite에서는 import.meta.env.DEV 사용)
  const isDevelopment = import.meta.env.DEV;

  return queryOptions({
    queryKey: healthCheckKeys.healthCheck(),
    queryFn: async ({ signal }): Promise<HealthCheckResponse> => {
      return await fetchHealthCheck({ signal });
    },

    // 캐시 설정: 상태 지속성을 위한 최적화
    staleTime: 5 * 1000, // 5초간 fresh 상태 유지하여 탭 전환 시 불필요한 refetch 방지
    gcTime: 1 * 60 * 1000, // 1분간만 캐시 보관 (헬스체크는 실시간성이 중요)

    // 이전 데이터 유지: 탭 전환 시 깜빡임 방지
    placeholderData: (previousData) => previousData, // 이전 상태를 유지하면서 백그라운드에서 업데이트

    // 재시도 설정: 연결 실패 시 즉시 오류 상태 표시
    retry: false, // 헬스체크는 즉시 에러 상태로 표시하여 사용자가 서버 상태를 빠르게 파악할 수 있도록 함

    // 활성화 조건
    enabled: options?.enabled ?? isDevelopment, // 개발 환경에서만 기본 활성화

    // 자동 재요청 설정: 사용자 경험 최적화
    refetchInterval: options?.refetchInterval ?? 30000, // 30초마다 자동 재요청
    refetchIntervalInBackground: true, // 백그라운드에서도 재요청 계속
    refetchOnWindowFocus: (query) => {
      // 데이터가 stale일 때만 window focus 시 refetch (깜빡임 방지)
      return query.isStale();
    },
    refetchOnReconnect: true, // 네트워크 재연결 시 재요청

    // 네트워크 설정
    networkMode: "online", // 온라인일 때만 요청
  });
};

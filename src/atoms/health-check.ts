import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import { healthCheckQueryOptions } from "@/api/health-check/query";

/**
 * 헬스체크 관련 전역 상태 관리
 * @description Jotai를 사용하여 백엔드 서버 헬스체크 상태를 전역에서 관리
 */

// 편의를 위한 재Export
export {
  healthCheckKeys,
  healthCheckQueryOptions,
} from "@/api/health-check/query";

export type {
  HealthStatus,
  HealthCheckResponse,
  HealthCheckError,
} from "@/api/health-check/types";

/**
 * 헬스체크 활성화 여부를 관리하는 atom
 * @description 사용자가 헬스체크 표시를 끄고 켤 수 있도록 하는 설정
 * localStorage에 저장되어 브라우저 재시작 후에도 설정 유지
 */
export const healthCheckEnabledAtom = atomWithStorage(
  "health-check-enabled",
  true, // 기본값: 활성화
);

/**
 * 헬스체크 자동 새로고침 간격을 관리하는 atom
 * @description 헬스체크 요청 간격을 사용자가 설정할 수 있도록 관리
 * localStorage에 저장되어 설정이 영구적으로 보존됨
 *
 * 간격 옵션:
 * - 10000 (10초): 빠른 모니터링
 * - 30000 (30초): 기본값
 * - 60000 (1분): 느린 모니터링
 * - 0: 자동 새로고침 비활성화
 */
export const healthCheckIntervalAtom = atomWithStorage(
  "health-check-interval",
  30000, // 기본값: 30초
);

/**
 * 개발 환경 여부를 확인하는 derived atom
 * @description Vite의 개발 환경 변수를 atom으로 변환하여 다른 atom에서 사용 가능하도록 함
 */
export const isDevelopmentAtom = atom(() => {
  return import.meta.env.DEV;
});

/**
 * 백엔드 서버 헬스체크 상태를 관리하는 쿼리 atom
 * @description React Query + Jotai를 조합하여 헬스체크 상태를 전역에서 관리
 *
 * 작동 방식:
 * 1. 개발 환경에서만 자동으로 활성화
 * 2. healthCheckEnabledAtom이 true일 때만 실행
 * 3. healthCheckIntervalAtom에 설정된 간격으로 자동 재요청
 * 4. 에러 발생 시에도 계속 재시도하여 서버 복구 감지
 * 5. 로딩, 에러, 데이터 상태를 모든 컴포넌트에서 공유
 *
 * 헬스체크 특징:
 * - 실시간 모니터링: 30초마다 자동 확인
 * - 개발 전용: 프로덕션에서는 실행되지 않음
 * - 에러 복구: 서버 장애 후 복구 상태 자동 감지
 * - 사용자 제어: 사용자가 활성화/비활성화 가능
 *
 * 사용 예시:
 * ```typescript
 * const [{ data: health, isPending, isError }] = useAtom(healthCheckQueryAtom);
 *
 * if (isPending) return <div>연결 확인 중...</div>;
 * if (isError) return <div>서버 연결 실패</div>;
 * if (health?.status === 'healthy') return <div>서버 정상</div>;
 * ```
 */
export const healthCheckQueryAtom = atomWithQuery((get) => {
  const isDevelopment = get(isDevelopmentAtom);
  const enabled = get(healthCheckEnabledAtom);
  const interval = get(healthCheckIntervalAtom);

  // 개발 환경이 아니거나 비활성화된 경우 쿼리 비활성화
  const shouldEnable = isDevelopment && enabled;

  return healthCheckQueryOptions({
    enabled: shouldEnable,
    refetchInterval: shouldEnable && interval > 0 ? interval : undefined,
  });
});

/**
 * 간소화된 헬스체크 상태를 제공하는 derived atom
 * @description UI에서 사용하기 쉽도록 헬스체크 상태를 단순화한 정보 제공
 *
 * 반환값:
 * - status: 'healthy' | 'unhealthy' | 'checking' | 'disabled'
 * - message: 사용자에게 보여줄 메시지
 * - color: UI 색상 힌트
 * - lastChecked: 마지막 확인 시간
 *
 * 사용 예시:
 * ```typescript
 * const [healthSummary] = useAtom(healthCheckSummaryAtom);
 *
 * return (
 *   <div style={{ color: healthSummary.color }}>
 *     {healthSummary.status === 'healthy' ? '✅' : '❌'} {healthSummary.message}
 *   </div>
 * );
 * ```
 */
export const healthCheckSummaryAtom = atom((get) => {
  const isDevelopment = get(isDevelopmentAtom);
  const enabled = get(healthCheckEnabledAtom);
  const { data, isPending, isError, error } = get(healthCheckQueryAtom);

  // 개발 환경이 아닌 경우
  if (!isDevelopment) {
    return {
      status: "disabled" as const,
      message: "프로덕션 환경",
      color: "#6b7280", // gray-500
      lastChecked: null,
    };
  }

  // 헬스체크가 비활성화된 경우
  if (!enabled) {
    return {
      status: "disabled" as const,
      message: "모니터링 비활성화",
      color: "#6b7280", // gray-500
      lastChecked: null,
    };
  }

  // 로딩 중
  if (isPending) {
    return {
      status: "checking" as const,
      message: "서버 상태 확인 중...",
      color: "#f59e0b", // amber-500
      lastChecked: null,
    };
  }

  // 에러 발생
  if (isError) {
    return {
      status: "unhealthy" as const,
      message: error.message.includes("헬스체크 실패")
        ? "서버 연결 실패"
        : "알 수 없는 오류",
      color: "#ef4444", // red-500
      lastChecked: new Date(),
    };
  }

  // 정상 응답
  return {
    status: data.status,
    message: data.status === "healthy" ? "서버 정상 동작" : "서버 상태 이상",
    color:
      data.status === "healthy"
        ? "#10b981" // green-500
        : "#ef4444", // red-500
    lastChecked: new Date(data.timestamp),
    responseTime: data.responseTime,
  };
});

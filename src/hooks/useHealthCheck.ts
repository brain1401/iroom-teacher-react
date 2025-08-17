import {
  healthCheckQueryAtom,
  healthCheckSummaryAtom,
} from "@/atoms/health-check";
import { useAtomValue, useAtom } from "jotai";

/**
 * 헬스체크 상태 관리 커스텀 훅
 * @description 헬스체크 관련 상태와 액션을 제공하는 커스텀 훅
 *
 * 제공하는 기능:
 * - 현재 헬스체크 상태
 * - 수동 새로고침 함수
 * - 컴포넌트 표시 여부 판단
 */
export const useHealthCheck = () => {
  const healthSummary = useAtomValue(healthCheckSummaryAtom);
  const [{ refetch }] = useAtom(healthCheckQueryAtom);

  /**
   * 수동으로 헬스체크를 새로고침하는 함수
   * @description atomWithQuery에서 제공하는 refetch 함수 사용
   */
  const refreshHealthCheck = () => {
    refetch();
  };

  /**
   * 헬스체크 컴포넌트를 표시할지 여부를 판단
   * @description disabled 상태일 때는 컴포넌트를 렌더링하지 않음
   */
  const shouldRender = healthSummary.status !== "disabled";

  /**
   * 현재 새로고침 중인지 여부
   */
  const isRefreshing = healthSummary.status === "checking";

  return {
    // 상태
    healthSummary,
    shouldRender,
    isRefreshing,

    // 액션
    refreshHealthCheck,
  };
};

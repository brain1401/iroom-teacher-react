import { useAtomValue, useAtom } from "jotai";
import {
  healthCheckSummaryAtom,
  healthCheckQueryAtom,
} from "@/atoms/health-check";

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
  /**
   * 📌 useAtomValue 사용 이유: 값만 읽기 (read-only)
   * - healthCheckSummaryAtom의 계산된 상태 정보만 필요하고 변경할 필요 없음
   * - useAtom 대신 useAtomValue 사용으로 불필요한 setter 함수 제거
   * - 데이터 안전성: derived atom을 실수로 변경하는 것을 방지
   */
  const healthSummary = useAtomValue(healthCheckSummaryAtom);

  /**
   * 📌 useAtom 사용 이유: refetch 함수 필요 (특수한 경우)
   * - healthCheckQueryAtom에서 refetch 함수를 가져오기 위해 useAtom 필요
   * - atomWithQuery에서 제공하는 refetch는 쿼리 객체의 메서드이므로 전체 객체 구독 필요
   * - data는 사용하지 않고 refetch만 destructuring으로 추출하여 사용
   * - 이 경우는 useSetAtom으로 최적화할 수 없는 예외 상황
   */
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

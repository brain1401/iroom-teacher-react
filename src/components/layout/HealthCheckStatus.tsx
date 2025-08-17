import { Button } from "@/components/ui/button";
import { useHealthCheck } from "@/hooks/useHealthCheck";
import {
  HealthCheckIcon,
  HealthCheckBadge,
  HealthCheckTooltip,
} from "@/components/health-check";

/**
 * 헬스체크 상태 표시 컴포넌트
 * @description NavigationBar에서 사용되는 백엔드 서버 상태 모니터링 컴포넌트
 * 
 * 리팩터링된 구조:
 * - useHealthCheck: 상태 관리와 비즈니스 로직
 * - HealthCheckTooltip: 툴팁 UI
 * - HealthCheckIcon: 상태 아이콘
 * - HealthCheckBadge: 상태 배지
 * - 메인 컴포넌트: 조합과 레이아웃만 담당
 * 
 * 주요 개선사항:
 * - 관심사 분리로 가독성 향상
 * - 개별 컴포넌트 재사용 가능
 * - 순수 함수로 테스트 용이성 증대
 * - 유지보수성 향상
 */
export default function HealthCheckStatus() {
  const {
    healthSummary,
    shouldRender,
    isRefreshing,
    refreshHealthCheck,
  } = useHealthCheck();

  // 개발 환경이 아니거나 비활성화된 경우 렌더링하지 않음
  if (!shouldRender) {
    return null;
  }

  return (
    <HealthCheckTooltip
      message={healthSummary.message}
      lastChecked={healthSummary.lastChecked}
      responseTime={healthSummary.responseTime}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={refreshHealthCheck}
        disabled={isRefreshing}
        className="h-8 px-2 gap-1.5 text-xs"
        aria-label={`서버 상태: ${healthSummary.message}`}
      >
        <HealthCheckIcon 
          status={healthSummary.status} 
          className="text-sm"
        />
        <HealthCheckBadge 
          status={healthSummary.status}
          text="서버"
          className="text-xs px-1.5 py-0.5 h-5"
        />
      </Button>
    </HealthCheckTooltip>
  );
}
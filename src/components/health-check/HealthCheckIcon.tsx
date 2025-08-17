import { getHealthStatusIcon } from "@/utils/health-check-ui";
import type { HealthStatus } from "@/api/health-check/types";

/**
 * 헬스체크 상태 아이콘 컴포넌트
 * @description 상태에 따른 이모지 아이콘을 표시하는 순수 컴포넌트
 */
interface HealthCheckIconProps {
  status: HealthStatus | 'checking' | 'disabled';
  className?: string;
}

export default function HealthCheckIcon({ status, className = "text-sm" }: HealthCheckIconProps) {
  return (
    <span className={className}>
      {getHealthStatusIcon(status)}
    </span>
  );
}
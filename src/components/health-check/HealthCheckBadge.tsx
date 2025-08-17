import { Badge } from "@/components/ui/badge";
import { getHealthStatusBadgeVariant } from "@/utils/health-check-ui";
import type { HealthStatus } from "@/api/health-check/types";

/**
 * 헬스체크 상태 배지 컴포넌트
 * @description 상태에 따른 색상의 배지를 표시하는 순수 컴포넌트
 */
interface HealthCheckBadgeProps {
  status: HealthStatus | 'checking' | 'disabled';
  text?: string;
  className?: string;
}

export default function HealthCheckBadge({ 
  status, 
  text = "서버",
  className = "text-xs px-1.5 py-0.5 h-5"
}: HealthCheckBadgeProps) {
  return (
    <Badge 
      variant={getHealthStatusBadgeVariant(status)}
      className={className}
    >
      {text}
    </Badge>
  );
}
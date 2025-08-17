import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { createHealthCheckTooltipContent } from "@/utils/health-check-ui";
import type { ReactNode } from "react";

/**
 * 헬스체크 툴팁 컴포넌트
 * @description 헬스체크 상세 정보를 툴팁으로 표시하는 컴포넌트
 */
interface HealthCheckTooltipProps {
  children: ReactNode;
  message: string;
  lastChecked?: Date | null;
  responseTime?: number;
}

export default function HealthCheckTooltip({
  children,
  message,
  lastChecked,
  responseTime,
}: HealthCheckTooltipProps) {
  const tooltipContent = createHealthCheckTooltipContent({
    message,
    lastChecked,
    responseTime,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        
        <TooltipContent 
          side="bottom" 
          align="end"
          className="max-w-xs whitespace-pre-line text-sm"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { createHealthCheckTooltipContent } from "@/utils/health-check-ui";
import type { ReactNode } from "react";
import type {
  HealthStatus,
  FrontendServiceInfo,
} from "@/api/health-check/types";

/**
 * 헬스체크 툴팁 컴포넌트
 * @description 헬스체크 상세 정보를 툴팁으로 표시하는 컴포넌트
 *
 * 주요 개선사항:
 * - 오직 hover 시에만 상세 정보 표시 (영구 표시 문제 해결)
 * - 서비스별 상태 정보 활용 (어떤 서버가 다운되었는지 구체적 표시)
 * - 에러 상태일 때 상세 피드백과 재시도 기능 제공
 */
interface HealthCheckTooltipProps {
  children: ReactNode;
  message: string;
  lastChecked?: Date | null;
  responseTime?: number;
  status?: HealthStatus | "checking" | "disabled";
  services?: FrontendServiceInfo[];
  onRetry?: () => void;
  isRetrying?: boolean;
}

export default function HealthCheckTooltip({
  children,
  message,
  lastChecked,
  responseTime,
  status = "unknown",
  services = [],
  onRetry,
  isRetrying = false,
}: HealthCheckTooltipProps) {
  // 에러 상태인 경우 상세 피드백 표시, 아니면 기본 툴팁
  const isError = status === "unhealthy";

  if (isError) {
    // 에러 상태일 때 상세 정보가 포함된 큰 툴팁 표시
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{children}</TooltipTrigger>

          <TooltipContent
            side="bottom"
            align="end"
            className="max-w-sm p-4 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
          >
            <div className="space-y-3">
              {/* 에러 제목 */}
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-red-900 dark:text-red-100 text-sm">
                  🔌 서버 연결 실패
                </h4>
                {onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetry}
                    disabled={isRetrying}
                    className="h-6 px-2 text-xs border-red-300 hover:bg-red-100 dark:border-red-700 dark:hover:bg-red-900"
                  >
                    {isRetrying ? "재시도 중..." : "재시도"}
                  </Button>
                )}
              </div>

              {/* 기본 메시지 */}
              <p className="text-red-800 dark:text-red-200 text-sm">
                {message}
              </p>

              {/* 서비스별 상태 정보 */}
              {services.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-red-900 dark:text-red-100">
                    📊 서비스별 상태:
                  </div>
                  <div className="space-y-1">
                    {services.map((service) => (
                      <div
                        key={service.name}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-red-800 dark:text-red-200">
                          {service.name}
                        </span>
                        <span
                          className={`font-medium ${
                            service.status === "healthy"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {service.status === "healthy" ? "✅ 정상" : "❌ 오류"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 시간 정보 */}
              {(lastChecked || responseTime) && (
                <div className="text-xs space-y-1 text-red-800/80 dark:text-red-200/80 pt-2 border-t border-red-200 dark:border-red-800">
                  {lastChecked && (
                    <div>
                      마지막 확인: {lastChecked.toLocaleTimeString("ko-KR")}
                    </div>
                  )}
                  {responseTime && (
                    <div>
                      응답 시간:{" "}
                      {responseTime < 1000
                        ? `${responseTime}ms`
                        : `${(responseTime / 1000).toFixed(2)}s`}
                    </div>
                  )}
                </div>
              )}

              {/* 해결 방법 제안 */}
              <div className="space-y-2 pt-2 border-t border-red-200 dark:border-red-800">
                <div className="text-xs font-medium text-red-900 dark:text-red-100">
                  💡 해결 방법:
                </div>
                <ul className="text-xs space-y-1 text-red-800 dark:text-red-200">
                  <li>• 개발 서버가 정상적으로 실행 중인지 확인</li>
                  <li>• 터미널에서 'npm run dev' 명령어로 서버 실행</li>
                  <li>• 방화벽이나 보안 프로그램 차단 여부 확인</li>
                </ul>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // 정상 상태일 때는 기본 툴팁 표시
  const tooltipContent = createHealthCheckTooltipContent({
    message,
    lastChecked,
    responseTime,
  });

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>

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

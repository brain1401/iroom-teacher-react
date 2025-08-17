import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getHealthCheckErrorDetails,
  getErrorSeverityClasses,
} from "@/utils/health-check-ui";
import type { HealthStatus } from "@/api/health-check/types";

/**
 * 헬스체크 에러 피드백 컴포넌트
 * @description 헬스체크 실패 시 사용자에게 명확한 피드백과 해결 방안을 제공
 *
 * 주요 기능:
 * - 에러 타입별 구체적인 메시지 제공
 * - 사용자 액션 가이드 (재시도, 문제 해결 방법)
 * - 시각적 강조 효과 (애니메이션, 색상)
 * - 접근성 고려 (role="alert", 스크린 리더 지원)
 *
 * @example
 * ```tsx
 * <HealthCheckErrorFeedback
 *   status="unhealthy"
 *   message="서버 연결 실패"
 *   onRetry={handleRetry}
 *   className="mb-4"
 * />
 * ```
 */

type HealthCheckErrorFeedbackProps = {
  /** 헬스체크 상태 */
  status: HealthStatus | "checking" | "disabled";
  /** 에러 메시지 */
  message: string;
  /** 마지막 확인 시간 */
  lastChecked?: Date | null;
  /** 응답 시간 */
  responseTime?: number;
  /** 재시도 함수 */
  onRetry?: () => void;
  /** 재시도 중 여부 */
  isRetrying?: boolean;
  /** 추가 CSS 클래스 */
  className?: string;
};

// 코드 간소화: 유틸리티 함수 사용으로 중복 제거

export default function HealthCheckErrorFeedback({
  status,
  message,
  lastChecked,
  responseTime,
  onRetry,
  isRetrying = false,
  className,
}: HealthCheckErrorFeedbackProps) {
  // 에러 상태가 아닌 경우 렌더링하지 않음
  if (status !== "unhealthy") {
    return null;
  }

  const errorDetails = getHealthCheckErrorDetails(message);
  const severityStyles = getErrorSeverityClasses(errorDetails.severity);

  return (
    <Alert
      className={cn(
        "transition-all duration-300",
        severityStyles.alertClass,
        severityStyles.pulseClass,
        className,
      )}
    >
      <AlertTitle className="flex items-center justify-between">
        <span>{errorDetails.title}</span>
        {onRetry && (
          <Button
            variant={severityStyles.buttonVariant}
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-6 px-2 text-xs"
          >
            {isRetrying ? "재시도 중..." : "재시도"}
          </Button>
        )}
      </AlertTitle>

      <AlertDescription className="space-y-3">
        <p className="text-sm leading-relaxed">{errorDetails.description}</p>

        {/* 상세 정보 */}
        {(lastChecked || responseTime) && (
          <div className="text-xs space-y-1 text-current/80">
            {lastChecked && (
              <div>마지막 확인: {lastChecked.toLocaleTimeString("ko-KR")}</div>
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
        <div className="space-y-2">
          <div className="text-xs font-medium text-current/90">
            💡 해결 방법:
          </div>
          <ul className="text-xs space-y-1 ml-4">
            {errorDetails.suggestions.map((suggestion, index) => (
              <li
                key={index}
                className="relative before:content-['•'] before:absolute before:-left-3 before:text-current/70"
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>

        {/* 개발 환경 안내 */}
        <div className="text-xs text-current/75 pt-2 border-t border-current/20">
          💻 개발 환경에서만 표시되는 정보입니다.
        </div>
      </AlertDescription>
    </Alert>
  );
}

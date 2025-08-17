import type { HealthStatus } from "@/api/health-check/types";

/**
 * 헬스체크 UI 관련 유틸리티 함수들
 * @description 순수 함수로 구성되어 테스트하기 쉽고 재사용 가능
 */

/**
 * 헬스체크 상태별 아이콘 매핑
 */
export const getHealthStatusIcon = (
  status: HealthStatus | "checking" | "disabled",
): string => {
  switch (status) {
    case "healthy":
      return "✅";
    case "unhealthy":
      return "❌";
    case "checking":
      return "🔄";
    case "disabled":
      return "⚪";
    default:
      return "❓";
  }
};

/**
 * 헬스체크 상태별 Badge variant 매핑
 */
export const getHealthStatusBadgeVariant = (
  status: HealthStatus | "checking" | "disabled",
): "default" | "destructive" | "secondary" | "outline" => {
  switch (status) {
    case "healthy":
      return "default"; // 녹색
    case "unhealthy":
      return "destructive"; // 빨강
    case "checking":
      return "secondary"; // 노랑/회색
    case "disabled":
      return "outline"; // 회색 테두리
    default:
      return "outline";
  }
};

/**
 * 헬스체크 상태별 색상 매핑
 */
export const getHealthStatusColor = (
  status: HealthStatus | "checking" | "disabled",
): string => {
  switch (status) {
    case "healthy":
      return "#10b981"; // green-500
    case "unhealthy":
      return "#ef4444"; // red-500
    case "checking":
      return "#f59e0b"; // amber-500
    case "disabled":
      return "#6b7280"; // gray-500
    default:
      return "#6b7280"; // gray-500
  }
};

/**
 * 시간을 한국 시간 형식으로 포맷팅
 */
export const formatTimeToKorean = (date: Date): string => {
  return date.toLocaleTimeString("ko-KR");
};

/**
 * 응답 시간을 읽기 쉬운 형식으로 포맷팅
 */
export const formatResponseTime = (responseTime: number): string => {
  if (responseTime < 1000) {
    return `${responseTime}ms`;
  } else {
    return `${(responseTime / 1000).toFixed(2)}s`;
  }
};

/**
 * 헬스체크 툴팁 내용 생성
 */
export const createHealthCheckTooltipContent = (params: {
  message: string;
  lastChecked?: Date | null;
  responseTime?: number;
}): string => {
  const { message, lastChecked, responseTime } = params;

  let content = message;

  if (lastChecked) {
    const timeStr = formatTimeToKorean(lastChecked);
    content += `\n마지막 확인: ${timeStr}`;
  }

  if (responseTime !== undefined) {
    const formattedTime = formatResponseTime(responseTime);
    content += `\n응답 시간: ${formattedTime}`;
  }

  content += "\n\n클릭하여 새로고침";

  return content;
};

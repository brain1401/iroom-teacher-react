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

/**
 * 에러 타입 정의
 */
export type HealthCheckErrorType =
  | "connection"
  | "timeout"
  | "server"
  | "cancelled"
  | "unknown";

/**
 * 에러 심각도 정의
 */
export type HealthCheckErrorSeverity = "low" | "medium" | "high";

/**
 * 에러 상세 정보 타입
 */
export type HealthCheckErrorDetails = {
  /** 에러 제목 (이모지 포함) */
  title: string;
  /** 에러 설명 */
  description: string;
  /** 해결 방법 제안 배열 */
  suggestions: string[];
  /** 에러 심각도 */
  severity: HealthCheckErrorSeverity;
  /** 에러 타입 */
  type: HealthCheckErrorType;
};

/**
 * 에러 메시지를 분석하여 에러 타입을 결정
 */
export const analyzeErrorType = (message: string): HealthCheckErrorType => {
  const lowerMessage = message.toLowerCase();

  if (
    lowerMessage.includes("연결 불가") ||
    lowerMessage.includes("연결할 수 없습니다") ||
    lowerMessage.includes("connection")
  ) {
    return "connection";
  }

  if (lowerMessage.includes("시간 초과") || lowerMessage.includes("timeout")) {
    return "timeout";
  }

  if (
    lowerMessage.includes("내부 오류") ||
    lowerMessage.includes("server error") ||
    lowerMessage.includes("서버 오류")
  ) {
    return "server";
  }

  if (
    lowerMessage.includes("취소") ||
    lowerMessage.includes("cancelled") ||
    lowerMessage.includes("aborted")
  ) {
    return "cancelled";
  }

  return "unknown";
};

/**
 * 에러 타입별 상세 정보를 반환
 */
export const getHealthCheckErrorDetails = (
  message: string,
): HealthCheckErrorDetails => {
  const errorType = analyzeErrorType(message);

  switch (errorType) {
    case "connection":
      return {
        title: "🔌 서버 연결 실패",
        description:
          "개발 서버가 실행되지 않았거나 네트워크에 문제가 있습니다.",
        suggestions: [
          "개발 서버가 정상적으로 실행 중인지 확인해주세요",
          "포트 3012가 사용 가능한지 확인해주세요",
          "방화벽이나 보안 프로그램이 차단하고 있지 않은지 확인해주세요",
          "터미널에서 'npm run dev' 명령어로 서버를 실행해주세요",
        ],
        severity: "high",
        type: "connection",
      };

    case "timeout":
      return {
        title: "⏱️ 응답 시간 초과",
        description: "서버가 응답하는데 시간이 너무 오래 걸리고 있습니다.",
        suggestions: [
          "잠시 후 다시 시도해주세요",
          "서버 성능이나 네트워크 상태를 확인해주세요",
          "다른 애플리케이션이 시스템 리소스를 과도하게 사용하고 있지 않은지 확인해주세요",
          "개발 서버를 재시작해보세요",
        ],
        severity: "medium",
        type: "timeout",
      };

    case "server":
      return {
        title: "⚠️ 서버 내부 오류",
        description: "서버에서 예상치 못한 오류가 발생했습니다.",
        suggestions: [
          "서버 콘솔에서 에러 로그를 확인해주세요",
          "최근 코드 변경사항이 있었다면 되돌려보세요",
          "서버를 재시작해보세요",
          "환경 변수나 설정 파일을 확인해주세요",
        ],
        severity: "high",
        type: "server",
      };

    case "cancelled":
      return {
        title: "🔄 요청 취소됨",
        description: "헬스체크 요청이 취소되었습니다.",
        suggestions: [
          "다시 시도해주세요",
          "네트워크 연결 상태를 확인해주세요",
          "브라우저를 새로고침해보세요",
        ],
        severity: "low",
        type: "cancelled",
      };

    case "unknown":
    default:
      return {
        title: "❌ 서버 상태 확인 실패",
        description: "서버 상태를 확인하는 중 알 수 없는 문제가 발생했습니다.",
        suggestions: [
          "잠시 후 다시 시도해주세요",
          "개발 서버 상태를 확인해주세요",
          "네트워크 연결을 확인해주세요",
          "브라우저 콘솔에서 추가 오류 정보를 확인해주세요",
        ],
        severity: "medium",
        type: "unknown",
      };
  }
};

/**
 * 에러 심각도별 CSS 클래스를 반환
 * @description 깜빡거리는 애니메이션 대신 시각적 강조를 위한 정적 스타일 사용
 *
 * 접근성 개선사항:
 * - animate-pulse 제거로 텍스트 가독성 향상
 * - 시각적 피로감 감소
 * - 정적 강조 효과로 주의 집중 유도
 */
export const getErrorSeverityClasses = (severity: HealthCheckErrorSeverity) => {
  switch (severity) {
    case "high":
      return {
        alertClass:
          "border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100 border-2 shadow-md",
        pulseClass: "", // 깜빡거림 제거, 대신 굵은 테두리와 그림자로 강조
        buttonVariant: "destructive" as const,
      };
    case "medium":
      return {
        alertClass:
          "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100 border-2",
        pulseClass: "", // 깜빡거림 제거, 대신 굵은 테두리로 강조
        buttonVariant: "outline" as const,
      };
    case "low":
      return {
        alertClass:
          "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
        pulseClass: "", // 낮은 심각도는 기본 스타일 유지
        buttonVariant: "secondary" as const,
      };
  }
};

/**
 * 에러 메시지를 사용자 친화적인 형태로 변환
 */
export const formatErrorMessage = (message: string): string => {
  const errorDetails = getHealthCheckErrorDetails(message);
  return `${errorDetails.title}\n${errorDetails.description}`;
};

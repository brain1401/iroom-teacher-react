import { ApiError } from "@/api/client";

/**
 * 에러 메시지 추출 유틸리티
 * @description 다양한 에러 타입에서 사용자 친화적인 메시지를 추출
 * @param error 발생한 에러 객체
 * @returns 사용자에게 표시할 메시지
 */
export function getErrorMessage(error: unknown): string {
  // ApiError 인스턴스인 경우
  if (error instanceof ApiError) {
    // 상태 코드별 메시지 처리
    switch (error.status) {
      case 401:
        return "인증이 필요합니다. 로그인을 확인해주세요.";
      case 403:
        return "접근 권한이 없습니다.";
      case 404:
        return "요청하신 데이터를 찾을 수 없습니다.";
      case 429:
        return "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";
      case 500:
        return "서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
      default:
        // ApiError의 메시지 사용
        return error.message || "알 수 없는 오류가 발생했습니다.";
    }
  }

  // 표준 Error 인스턴스인 경우
  if (error instanceof Error) {
    // 네트워크 에러 패턴 확인
    if (error.message.toLowerCase().includes("network")) {
      return "네트워크 연결을 확인해주세요.";
    }
    if (error.message.toLowerCase().includes("timeout")) {
      return "요청 시간이 초과되었습니다. 다시 시도해주세요.";
    }
    return error.message;
  }

  // 문자열 에러인 경우
  if (typeof error === "string") {
    return error;
  }

  // 객체 형태의 에러인 경우
  if (error && typeof error === "object") {
    const errorObj = error as Record<string, unknown>;
    if (errorObj.message && typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  // 기본 메시지
  return "알 수 없는 오류가 발생했습니다.";
}

/**
 * 에러 심각도 분류
 * @description 에러의 심각도를 분류하여 UI 스타일 결정에 활용
 * @param error 발생한 에러 객체
 * @returns 에러 심각도 레벨
 */
export function getErrorSeverity(
  error: unknown,
): "info" | "warning" | "error" | "critical" {
  if (error instanceof ApiError) {
    if (error.status === 401 || error.status === 403) {
      return "warning"; // 권한 문제
    }
    if (error.status === 404) {
      return "info"; // 데이터 없음
    }
    if (error.status === 429) {
      return "warning"; // 요청 제한
    }
    if (error.status && error.status >= 500) {
      return "critical"; // 서버 오류
    }
    return "error"; // 기타 클라이언트 오류
  }

  if (error instanceof Error) {
    if (error.message.toLowerCase().includes("network")) {
      return "warning"; // 네트워크 문제
    }
    if (error.message.toLowerCase().includes("timeout")) {
      return "warning"; // 타임아웃
    }
  }

  return "error"; // 기본 에러 레벨
}

/**
 * 재시도 가능한 에러인지 확인
 * @description 에러가 재시도 가능한 종류인지 판단
 * @param error 발생한 에러 객체
 * @returns 재시도 가능 여부
 */
export function isRetriableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // 4xx 클라이언트 에러는 재시도하지 않음 (401, 403, 404 등)
    if (error.status && error.status >= 400 && error.status < 500) {
      // 예외: 429 (Too Many Requests)는 재시도 가능
      return error.status === 429;
    }
    // 5xx 서버 에러는 재시도 가능
    if (error.status && error.status >= 500) {
      return true;
    }
    // 네트워크 에러 (상태 코드 없음)는 재시도 가능
    if (!error.status) {
      return true;
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // 네트워크 관련 에러는 재시도 가능
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * 에러 로깅 유틸리티
 * @description 에러를 적절한 수준으로 로깅
 * @param error 발생한 에러 객체
 * @param context 에러가 발생한 컨텍스트 정보
 */
export function logError(error: unknown, context?: string): void {
  const severity = getErrorSeverity(error);
  const message = getErrorMessage(error);
  const logPrefix = context ? `[${context}]` : "[Error]";

  switch (severity) {
    case "critical":
      console.error(`${logPrefix} CRITICAL:`, message, error);
      break;
    case "error":
      console.error(`${logPrefix} ERROR:`, message, error);
      break;
    case "warning":
      console.warn(`${logPrefix} WARNING:`, message, error);
      break;
    case "info":
      console.info(`${logPrefix} INFO:`, message, error);
      break;
  }
}

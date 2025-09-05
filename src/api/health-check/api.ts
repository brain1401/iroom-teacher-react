import type { AxiosRequestConfig } from "axios";
import { baseApiClient } from "@/api/client";
import type {
  HealthCheckResponse,
  HealthCheckData,
  HealthStatus,
  FrontendServiceInfo,
  ServiceHealthInfo,
} from "./types";

/**
 * 백엔드 서버의 기본 URL을 환경 변수에서 가져오기
 * @description Vite 환경에서 VITE_ 접두사가 있는 환경 변수만 클라이언트에서 접근 가능
 */
const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3055";

/**
 * 헬스체크 전용 API 클라이언트
 * @description 기본 API 클라이언트를 확장하여 백엔드 헬스체크 API 전용으로 설정
 */
const healthCheckApiClient = baseApiClient.create({
  baseURL: BACKEND_API_URL,
  timeout: 5000, // 헬스체크는 빠른 응답이 중요하므로 타임아웃 설정
  // 요청 인터셉터: 에러 로깅 및 디버깅 정보 추가
  transformRequest: [
    (data) => {
      // 개발 환경에서 헬스체크 요청 로깅
      if (import.meta.env.DEV) {
        console.log("🔍 헬스체크 요청 시작:", new Date().toISOString());
      }
      return data;
    },
  ],
  // 응답 인터셉터: 응답 시간 측정 및 에러 분석
  validateStatus: (status) => {
    // 200-299 범위는 성공으로 처리
    // 400-599 범위는 에러로 처리하되 구체적인 에러 메시지 제공
    return status >= 200 && status < 300;
  },
});

/**
 * 헬스체크 API 공통 요청 함수
 * @description 모든 헬스체크 API 호출에서 공통으로 사용하는 요청 처리 함수
 * @template T API 응답 데이터 타입
 * @param config Axios 요청 설정 객체
 * @returns API 응답 데이터
 */
async function healthCheckApiRequest<T>(
  config: AxiosRequestConfig,
): Promise<T> {
  const response = await healthCheckApiClient.request<T>(config);
  return response.data;
}

/**
 * 백엔드 상태를 프론트엔드 상태로 변환
 * @description Spring Boot Actuator 형식을 우리 형식으로 변환
 */
function mapBackendStatusToHealthStatus(backendStatus: string): HealthStatus {
  switch (backendStatus) {
    case "UP":
      return "healthy";
    case "DOWN":
    case "OUT_OF_SERVICE":
      return "unhealthy";
    case "UNKNOWN":
    default:
      return "unknown";
  }
}

/**
 * 서비스명을 한국어로 변환
 * @description 서비스 키를 사용자 친화적인 한국어 이름으로 변환
 */
function getServiceDisplayName(serviceKey: string): string {
  switch (serviceKey) {
    case "database":
      return "데이터베이스";
    case "application":
      return "애플리케이션";
    case "aiServer":
      return "AI 서버";
    default:
      return serviceKey;
  }
}

/**
 * 개별 서비스 정보를 프론트엔드 형식으로 변환
 * @description ServiceHealthInfo를 FrontendServiceInfo로 변환
 */
function transformServiceInfo(
  serviceKey: string,
  serviceInfo: ServiceHealthInfo,
): FrontendServiceInfo {
  return {
    name: getServiceDisplayName(serviceKey),
    status: mapBackendStatusToHealthStatus(serviceInfo.status),
    message: serviceInfo.message,
    responseTime: serviceInfo.responseTimeMs,
  };
}

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 * @description HealthCheckData를 HealthCheckResponse로 변환
 */
function transformBackendResponse(
  healthCheckData: HealthCheckData,
  responseTime: number,
): HealthCheckResponse {
  const data = healthCheckData;

  // 서비스별 상태 정보 변환
  const services: FrontendServiceInfo[] = Object.entries(data.services).map(
    ([serviceKey, serviceInfo]) =>
      transformServiceInfo(serviceKey, serviceInfo),
  );

  return {
    status: mapBackendStatusToHealthStatus(data.status),
    timestamp: data.timestamp,
    message: data.message,
    responseTime,
    services,
  };
}

/**
 * 백엔드 서버 헬스체크를 수행하는 함수
 * @description 백엔드 서버의 상태를 확인하여 정상 동작 여부를 반환
 * @example
 * ```typescript
 * // 기본 사용법
 * const healthStatus = await fetchHealthCheck();
 *
 * // 요청 취소 기능 포함
 * const controller = new AbortController();
 * const status = await fetchHealthCheck({ signal: controller.signal });
 * ```
 * @param options 추가 옵션
 * @param options.signal 요청 취소를 위한 AbortSignal
 * @returns 서버 헬스체크 결과
 * @throws {Error} 서버가 응답하지 않거나 에러가 발생한 경우
 */
/**
 * 에러 타입을 구별하여 적절한 에러 메시지 생성
 * @description 다양한 에러 상황에 대해 사용자 친화적인 메시지 제공
 */
function createErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // 개발 환경에서 상세 에러 로깅
    if (import.meta.env.DEV) {
      console.error("🚨 헬스체크 에러 발생:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
    }

    // 요청 취소 (AbortController)
    if (error.name === "AbortError") {
      return "헬스체크 요청이 취소되었습니다";
    }

    // 네트워크 타임아웃
    if (error.message.includes("timeout") || error.name === "ECONNABORTED") {
      return "서버 응답 시간 초과 (5초)";
    }

    // 네트워크 연결 실패
    if (
      error.message.includes("Network Error") ||
      error.message.includes("fetch") ||
      error.name === "ECONNREFUSED" ||
      error.name === "ENOTFOUND"
    ) {
      return "서버에 연결할 수 없습니다";
    }

    // 서버 응답 에러 (4xx, 5xx)
    if (error.message.includes("Request failed with status code")) {
      const statusMatch = error.message.match(/status code (\d+)/);
      const status = statusMatch ? statusMatch[1] : "알 수 없음";

      if (status.startsWith("4")) {
        return `클라이언트 에러 (${status})`;
      } else if (status.startsWith("5")) {
        return `서버 내부 에러 (${status})`;
      }

      return `서버에서 에러가 발생했습니다 (${status})`;
    }

    // CORS 에러
    if (
      error.message.includes("CORS") ||
      error.message.includes("Access-Control-Allow-Origin")
    ) {
      return "서버 접근 권한 에러 (CORS)";
    }

    // 기타 에러
    return `헬스체크 실패: ${error.message}`;
  }

  return "알 수 없는 헬스체크 오류가 발생했습니다";
}

export async function fetchHealthCheck(options?: {
  signal?: AbortSignal;
}): Promise<HealthCheckResponse> {
  try {
    const startTime = Date.now();

    // 백엔드 표준 ApiResponse 형식으로 요청
    // 인터셉터가 자동으로 SUCCESS인 경우 data를 추출하여 반환
    // ERROR인 경우 ApiResponseError 발생
    const healthCheckData = await healthCheckApiRequest<HealthCheckData>({
      method: "GET",
      url: "/api/system/health",
      signal: options?.signal,
    });

    const responseTime = Date.now() - startTime;

    // 인터셉터에 의해 이미 처리되었으므로 직접 변환
    return transformBackendResponse(healthCheckData, responseTime);
  } catch (error) {
    // 구체적인 에러 메시지 생성하여 다시 throw
    throw new Error(createErrorMessage(error));
  }
}

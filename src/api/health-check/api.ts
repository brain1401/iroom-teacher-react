import type { AxiosRequestConfig } from "axios";
import { baseApiClient } from "@/api/client";
import type { 
  HealthCheckResponse, 
  BackendHealthCheckResponse,
  HealthStatus 
} from "./types";

/**
 * 백엔드 서버의 기본 URL을 환경 변수에서 가져오기
 * @description Vite 환경에서 VITE_ 접두사가 있는 환경 변수만 클라이언트에서 접근 가능
 */
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3055';

/**
 * 헬스체크 전용 API 클라이언트
 * @description 기본 API 클라이언트를 확장하여 백엔드 헬스체크 API 전용으로 설정
 */
const healthCheckApiClient = baseApiClient.create({
  baseURL: BACKEND_API_URL,
  timeout: 5000, // 헬스체크는 빠른 응답이 중요하므로 타임아웃 설정
});

/**
 * 헬스체크 API 공통 요청 함수
 * @description 모든 헬스체크 API 호출에서 공통으로 사용하는 요청 처리 함수
 * @template T API 응답 데이터 타입
 * @param config Axios 요청 설정 객체
 * @returns API 응답 데이터
 */
async function healthCheckApiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await healthCheckApiClient.request<T>(config);
  return response.data;
}

/**
 * 백엔드 상태를 프론트엔드 상태로 변환
 * @description Spring Boot Actuator 형식을 우리 형식으로 변환
 */
function mapBackendStatusToHealthStatus(backendStatus: string): HealthStatus {
  switch (backendStatus) {
    case 'UP':
      return 'healthy';
    case 'DOWN':
    case 'OUT_OF_SERVICE':
      return 'unhealthy';
    case 'UNKNOWN':
    default:
      return 'unknown';
  }
}

/**
 * 백엔드 응답을 프론트엔드 형식으로 변환
 * @description BackendHealthCheckResponse를 HealthCheckResponse로 변환
 */
function transformBackendResponse(
  backendResponse: BackendHealthCheckResponse,
  responseTime: number
): HealthCheckResponse {
  const { data } = backendResponse;
  
  return {
    status: mapBackendStatusToHealthStatus(data.status),
    timestamp: data.timestamp,
    message: data.message,
    responseTime,
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
export async function fetchHealthCheck(
  options?: { signal?: AbortSignal }
): Promise<HealthCheckResponse> {
  try {
    const startTime = Date.now();
    
    // 백엔드 원본 응답 형식으로 요청
    const backendResponse = await healthCheckApiRequest<BackendHealthCheckResponse>({
      method: "GET",
      url: "/api/system/health",
      signal: options?.signal,
    });

    const responseTime = Date.now() - startTime;
    
    // 백엔드 응답을 프론트엔드 형식으로 변환
    return transformBackendResponse(backendResponse, responseTime);
  } catch (error) {
    // 에러 발생 시 unhealthy 상태로 반환
    throw new Error(
      error instanceof Error 
        ? `헬스체크 실패: ${error.message}`
        : '알 수 없는 헬스체크 오류'
    );
  }
}
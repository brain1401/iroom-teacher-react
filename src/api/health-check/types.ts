import type { ApiResponse } from "@/api/client/types";

/**
 * 헬스체크 관련 타입 정의
 */

/**
 * 헬스체크 상태 타입
 */
export type HealthStatus = "healthy" | "unhealthy" | "unknown";

/**
 * 개별 서비스 상태 정보 타입
 * @description 각 서비스(database, application, aiServer 등)의 상태 정보
 */
export type ServiceHealthInfo = {
  /** 서비스 상태 */
  status: "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";
  /** 서비스 상태 메시지 */
  message: string;
  /** 서비스 응답 시간 (밀리초) */
  responseTimeMs: number;
};

/**
 * 백엔드 헬스체크 데이터 타입
 * @description 백엔드에서 반환하는 헬스체크 실제 데이터 부분
 */
export type HealthCheckData = {
  /** 서버 상태 (Spring Boot Actuator 형식) */
  status: "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";
  /** 응답 시간 */
  timestamp: string;
  /** 전체 상태 메시지 */
  message: string;
  /** 각 서비스별 상세 상태 정보 */
  services: {
    /** 데이터베이스 서비스 상태 */
    database: ServiceHealthInfo;
    /** Spring Boot 애플리케이션 상태 */
    application: ServiceHealthInfo;
    /** AI 서버 상태 */
    aiServer: ServiceHealthInfo;
  };
};

/**
 * 백엔드 헬스체크 API 응답 타입
 * @description 백엔드 표준 ApiResponse<T> 형식으로 래핑된 헬스체크 응답
 *
 * 인터셉터에 의해 자동 처리:
 * - SUCCESS인 경우: HealthCheckData만 추출하여 반환
 * - ERROR인 경우: ApiResponseError 발생
 *
 * @example
 * ```typescript
 * // 백엔드 원본 응답 형식
 * const backendResponse: HealthCheckApiResponse = {
 *   result: "SUCCESS",
 *   message: "헬스체크 조회 성공",
 *   data: {
 *     status: "UP",
 *     timestamp: "2023-01-01T00:00:00Z",
 *     message: "모든 서비스가 정상입니다",
 *     services: { ... }
 *   }
 * };
 *
 * // 인터셉터 처리 후 API 함수에서 받는 형태: HealthCheckData
 * ```
 */
export type HealthCheckApiResponse = ApiResponse<HealthCheckData>;

/**
 * 백엔드 서버 원본 응답 타입 (레거시)
 * @deprecated 표준 HealthCheckApiResponse 사용 권장
 * @description 기존 코드와의 호환성을 위해 유지되는 타입
 */
export type BackendHealthCheckResponse = HealthCheckApiResponse;

/**
 * 프론트엔드용 서비스 상태 정보 타입
 * @description 개별 서비스 상태를 프론트엔드 형식으로 변환한 타입
 */
export type FrontendServiceInfo = {
  /** 서비스명 */
  name: string;
  /** 서비스 상태 */
  status: HealthStatus;
  /** 서비스 상태 메시지 */
  message: string;
  /** 서비스 응답 시간 (밀리초) */
  responseTime: number;
};

/**
 * 프론트엔드용 헬스체크 응답 데이터 타입
 * @description 백엔드 응답을 변환한 프론트엔드 전용 형식
 */
export type HealthCheckResponse = {
  /** 전체 헬스체크 상태 */
  status: HealthStatus;
  /** 응답 시간 */
  timestamp: string;
  /** 전체 상태 메시지 */
  message?: string;
  /** 전체 응답 시간 (밀리초) */
  responseTime?: number;
  /** 각 서비스별 상태 정보 (선택사항) */
  services?: FrontendServiceInfo[];
};

/**
 * 헬스체크 에러 타입
 */
export type HealthCheckError = {
  /** 에러 메시지 */
  message: string;
  /** 에러 코드 (선택사항) */
  code?: string;
  /** 발생 시간 */
  timestamp: string;
};

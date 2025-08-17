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
 * 백엔드 서버 원본 응답 타입
 * @description 실제 백엔드에서 반환하는 응답 형식
 */
export type BackendHealthCheckResponse = {
  /** API 호출 결과 */
  result: "SUCCESS" | "FAILURE";
  /** 응답 메시지 */
  message: string;
  /** 실제 헬스체크 데이터 */
  data: {
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
};

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

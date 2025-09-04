/**
 * Health Check API Zod 검증 스키마 정의
 * @description 헬스체크 관련 모든 API 응답에 대한 런타임 검증 스키마
 *
 * 주요 특징:
 * - Spring Boot Actuator 형식 지원
 * - 서비스별 상태 정보 검증 (database, application, aiServer)
 * - ISO 8601 타임스탬프 검증
 * - 응답 시간 범위 검증
 * - 상세한 에러 메시지로 디버깅 효율성 향상
 *
 * @example
 * ```typescript
 * import { HealthCheckApiResponseSchema } from "@/api/health-check/schemas";
 * import { validateApiResponse } from "@/api/client/validation";
 * 
 * const result = validateApiResponse(
 *   responseData,
 *   HealthCheckApiResponseSchema,
 *   "/api/health",
 *   "GET"
 * );
 * ```
 */

import { z } from "zod";
import { createApiResponseSchema } from "@/api/client/validation";

/**
 * ISO 8601 날짜 형식 검증 스키마
 * @description "2024-01-15T10:30:00.000Z" 형식의 날짜 검증
 */
const ISODateTimeSchema = z.string().datetime({
  message: "ISO 8601 형식의 날짜시간이어야 합니다 (예: 2024-01-15T10:30:00.000Z)"
});

/**
 * Spring Boot Actuator 서비스 상태 스키마
 * @description Spring Boot의 표준 헬스 상태값
 */
const ActuatorServiceStatusSchema = z.enum([
  "UP",
  "DOWN", 
  "OUT_OF_SERVICE",
  "UNKNOWN"
], {
  message: "서비스 상태는 'UP', 'DOWN', 'OUT_OF_SERVICE', 'UNKNOWN' 중 하나여야 합니다"
});

/**
 * 프론트엔드용 헬스 상태 스키마
 * @description 사용자 친화적인 상태값
 */
const HealthStatusSchema = z.enum([
  "healthy",
  "unhealthy", 
  "unknown"
], {
  message: "헬스 상태는 'healthy', 'unhealthy', 'unknown' 중 하나여야 합니다"
});

/**
 * 응답 시간 검증 스키마
 * @description 0 이상 60초 이하의 응답 시간 (밀리초)
 */
const ResponseTimeSchema = z.number()
  .min(0, "응답 시간은 0 이상이어야 합니다")
  .max(60000, "응답 시간은 60초(60,000ms)를 초과할 수 없습니다")
  .refine((time) => Number.isFinite(time), {
    message: "응답 시간은 유효한 숫자여야 합니다"
  });

/**
 * 개별 서비스 상태 정보 Zod 스키마
 * @description 각 서비스(database, application, aiServer 등)의 상태 정보
 */
const ServiceHealthInfoSchema = z.object({
  /** 서비스 상태 */
  status: ActuatorServiceStatusSchema,
  /** 서비스 상태 메시지 */
  message: z.string({
    message: "서비스 상태 메시지는 문자열이어야 합니다"
  }),
  /** 서비스 응답 시간 (밀리초) */
  responseTimeMs: ResponseTimeSchema,
});

/**
 * 백엔드 헬스체크 데이터 Zod 스키마
 * @description 백엔드에서 반환하는 헬스체크 실제 데이터 부분
 */
const HealthCheckDataSchema = z.object({
  /** 서버 상태 (Spring Boot Actuator 형식) */
  status: ActuatorServiceStatusSchema,
  /** 응답 시간 */
  timestamp: ISODateTimeSchema,
  /** 전체 상태 메시지 */
  message: z.string({
    message: "전체 상태 메시지는 문자열이어야 합니다"
  }),
  /** 각 서비스별 상세 상태 정보 */
  services: z.object({
    /** 데이터베이스 서비스 상태 */
    database: ServiceHealthInfoSchema,
    /** Spring Boot 애플리케이션 상태 */
    application: ServiceHealthInfoSchema,
    /** AI 서버 상태 */
    aiServer: ServiceHealthInfoSchema,
  }),
}).refine((data) => {
  // 전체 상태가 UP인 경우 모든 서비스가 UP이어야 함
  if (data.status === "UP") {
    const allServicesUp = Object.values(data.services).every(service => service.status === "UP");
    return allServicesUp;
  }
  return true;
}, {
  message: "전체 상태가 UP인 경우 모든 서비스 상태도 UP이어야 합니다",
  path: ["status"],
});

/**
 * 프론트엔드용 서비스 상태 정보 Zod 스키마
 * @description 개별 서비스 상태를 프론트엔드 형식으로 변환한 타입
 */
const FrontendServiceInfoSchema = z.object({
  /** 서비스명 */
  name: z.string().min(1, "서비스명은 비어있을 수 없습니다"),
  /** 서비스 상태 */
  status: HealthStatusSchema,
  /** 서비스 상태 메시지 */
  message: z.string(),
  /** 서비스 응답 시간 (밀리초) */
  responseTime: ResponseTimeSchema,
});

/**
 * 프론트엔드용 헬스체크 응답 데이터 Zod 스키마
 * @description 백엔드 응답을 변환한 프론트엔드 전용 형식
 */
const HealthCheckResponseSchema = z.object({
  /** 전체 헬스체크 상태 */
  status: HealthStatusSchema,
  /** 응답 시간 */
  timestamp: ISODateTimeSchema,
  /** 전체 상태 메시지 */
  message: z.string().optional(),
  /** 전체 응답 시간 (밀리초) */
  responseTime: ResponseTimeSchema.optional(),
  /** 각 서비스별 상태 정보 (선택사항) */
  services: z.array(FrontendServiceInfoSchema).optional(),
});

/**
 * 헬스체크 에러 Zod 스키마
 * @description 헬스체크 실패 시 에러 정보
 */
const HealthCheckErrorSchema = z.object({
  /** 에러 메시지 */
  message: z.string().min(1, "에러 메시지는 비어있을 수 없습니다"),
  /** 에러 코드 (선택사항) */
  code: z.string().optional(),
  /** 발생 시간 */
  timestamp: ISODateTimeSchema,
});

// ===== ApiResponse로 래핑된 최종 스키마들 =====

/**
 * 백엔드 헬스체크 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/health 응답 검증용
 *
 * 백엔드 표준 ApiResponse<T> 형식:
 * - result: "SUCCESS" | "ERROR"
 * - message: string
 * - data: HealthCheckData
 *
 * 인터셉터에 의해 자동 처리:
 * - SUCCESS인 경우: data(HealthCheckData)만 추출하여 반환
 * - ERROR인 경우: ApiResponseError 발생
 */
export const HealthCheckApiResponseSchema = createApiResponseSchema(HealthCheckDataSchema);

/**
 * 프론트엔드용 헬스체크 응답 스키마 (ApiResponse 래핑)
 * @description 변환된 프론트엔드 데이터 응답 검증용
 */
export const FrontendHealthCheckApiResponseSchema = createApiResponseSchema(HealthCheckResponseSchema);

/**
 * 헬스체크 에러 응답 스키마 (ApiResponse 래핑)
 * @description 헬스체크 실패 시 에러 응답 검증용
 */
export const HealthCheckErrorApiResponseSchema = createApiResponseSchema(HealthCheckErrorSchema);

/**
 * 단순한 서버 상태 체크 응답 스키마
 * @description GET /api/health/status 같은 간단한 상태 체크용
 */
export const SimpleHealthStatusApiResponseSchema = createApiResponseSchema(
  z.object({
    status: ActuatorServiceStatusSchema,
    timestamp: ISODateTimeSchema,
    uptime: z.number().nonnegative().optional(),
  })
);

// ===== 요청 파라미터 검증 스키마들 =====

/**
 * 헬스체크 조회 파라미터 검증 스키마
 * @description API 요청 시 사용하는 쿼리 파라미터 검증 (일반적으로 파라미터 없음)
 */
export const HealthCheckParamsSchema = z.object({
  /** 상세 정보 포함 여부 */
  detailed: z.boolean().optional(),
  /** 서비스 필터링 (선택적) */
  services: z.array(z.enum(["database", "application", "aiServer"])).optional(),
  /** 타임아웃 설정 (밀리초) */
  timeout: z.number().int().positive().max(30000).optional(),
});

/**
 * 개별 서비스 헬스체크 파라미터 검증 스키마
 * @description GET /api/health/service/{serviceName} 요청 검증용
 */
export const ServiceHealthCheckParamsSchema = z.object({
  /** 서비스명 */
  serviceName: z.enum(["database", "application", "aiServer"], {
    message: "서비스명은 'database', 'application', 'aiServer' 중 하나여야 합니다"
  }),
  /** 헬스체크 타임아웃 (밀리초) */
  timeout: z.number().int().positive().max(10000).optional(),
});

// ===== 개별 스키마 export (필요한 경우) =====

export {
  ServiceHealthInfoSchema,
  HealthCheckDataSchema,
  FrontendServiceInfoSchema,
  HealthCheckResponseSchema,
  HealthCheckErrorSchema,
  ActuatorServiceStatusSchema,
  HealthStatusSchema,
};

// ===== 타입 추론 헬퍼들 =====

/**
 * Zod 스키마에서 TypeScript 타입 추론
 * @description 검증된 데이터의 TypeScript 타입
 */
export type ValidatedServiceHealthInfo = z.infer<typeof ServiceHealthInfoSchema>;
export type ValidatedHealthCheckData = z.infer<typeof HealthCheckDataSchema>;
export type ValidatedFrontendServiceInfo = z.infer<typeof FrontendServiceInfoSchema>;
export type ValidatedHealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;
export type ValidatedHealthCheckError = z.infer<typeof HealthCheckErrorSchema>;
export type ValidatedHealthCheckParams = z.infer<typeof HealthCheckParamsSchema>;
export type ValidatedServiceHealthCheckParams = z.infer<typeof ServiceHealthCheckParamsSchema>;
/**
 * API 응답 Zod 검증 시스템
 * @description 모든 API 응답에 대해 Zod 스키마 검증을 수행하는 통합 시스템
 *
 * 주요 기능:
 * - 백엔드 ApiResponse<T> 구조 완벽 지원
 * - 검증 실패 시 상세 로깅과 fallback 처리
 * - 타입 안전성과 런타임 검증의 완벽한 통합
 * - 개발/프로덕션 환경별 차별화된 에러 처리
 *
 * @example
 * ```typescript
 * import { validateApiResponse, createApiResponseSchema } from "@/api/client/validation";
 * 
 * const PokemonSchema = z.object({ name: z.string() });
 * const responseSchema = createApiResponseSchema(PokemonSchema);
 * 
 * const validatedData = validateApiResponse(
 *   responseData,
 *   responseSchema,
 *   "/api/pokemon/25",
 *   "GET"
 * );
 * ```
 */

import { z } from "zod";
import type { ApiResponse, ResultStatus } from "./types";
import { logApiValidationFailure, logApiValidationSuccess, debugLogger } from "@/utils/logger";

/**
 * ResultStatus Zod 스키마
 * @description 백엔드 결과 상태에 대한 검증
 */
export const ResultStatusSchema = z.enum(["SUCCESS", "ERROR"], {
  message: "결과 상태는 'SUCCESS' 또는 'ERROR'여야 합니다",
});

/**
 * 기본 ApiResponse<T> Zod 스키마 생성 함수
 * @description 백엔드 표준 응답 구조에 맞는 Zod 스키마 생성
 *
 * @param dataSchema 실제 데이터에 대한 Zod 스키마
 * @returns ApiResponse<T> 검증을 위한 Zod 스키마
 *
 * @example
 * ```typescript
 * const UserSchema = z.object({ id: z.number(), name: z.string() });
 * const UserResponseSchema = createApiResponseSchema(UserSchema);
 * ```
 */
export function createApiResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T,
): z.ZodType<ApiResponse<z.infer<T>>> {
  return z.object({
    result: ResultStatusSchema,
    message: z.string({
      message: "응답 메시지는 문자열이어야 합니다",
    }),
    data: dataSchema,
  }) as unknown as z.ZodType<ApiResponse<z.infer<T>>>;
}

/**
 * nullable 데이터를 허용하는 ApiResponse 스키마 생성 함수
 * @description 데이터가 null일 수 있는 API 응답 검증용
 *
 * @param dataSchema 데이터 스키마 (nullable)
 * @returns 널 허용 ApiResponse 검증 스키마
 */
export function createNullableApiResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T,
): z.ZodType<ApiResponse<z.infer<T> | null>> {
  return z.object({
    result: ResultStatusSchema,
    message: z.string(),
    data: dataSchema.nullable(),
  }) as unknown as z.ZodType<ApiResponse<z.infer<T> | null>>;
}

/**
 * 배열 데이터 ApiResponse 스키마 생성 함수
 * @description 배열 형태의 데이터 응답 검증용
 *
 * @param itemSchema 배열 아이템의 스키마
 * @returns 배열 데이터 ApiResponse 검증 스키마
 */
export function createArrayApiResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T,
): z.ZodType<ApiResponse<Array<z.infer<T>>>> {
  return createApiResponseSchema(z.array(itemSchema));
}

/**
 * 페이지네이션 응답용 ApiResponse 스키마 생성 함수
 * @description Spring Boot Page 구조를 포함한 응답 검증용
 *
 * @param contentSchema 페이지 내용의 스키마
 * @returns 페이지네이션 ApiResponse 검증 스키마
 */
export function createPagedApiResponseSchema<T extends z.ZodTypeAny>(
  contentSchema: T,
): z.ZodType<ApiResponse<{
  content: Array<z.infer<T>>;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}>> {
  const pagedDataSchema = z.object({
    content: z.array(contentSchema),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    number: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
    // Spring Boot Page 추가 필드들 (선택적)
    numberOfElements: z.number().int().nonnegative().optional(),
    pageable: z.object({
      pageNumber: z.number().int().nonnegative(),
      pageSize: z.number().int().positive(),
      offset: z.number().int().nonnegative(),
      paged: z.boolean(),
      unpaged: z.boolean(),
      sort: z.object({
        sorted: z.boolean(),
        empty: z.boolean(),
        unsorted: z.boolean(),
      }),
    }).optional(),
    sort: z.object({
      sorted: z.boolean(),
      empty: z.boolean(),
      unsorted: z.boolean(),
    }).optional(),
  });

  return createApiResponseSchema(pagedDataSchema);
}

/**
 * API 응답 검증 결과 타입
 * @description 검증 성공/실패 정보와 처리된 데이터
 */
export type ValidationResult<T> = {
  /** 검증 성공 여부 */
  isValid: boolean;
  /** 검증된 데이터 (성공 시) */
  data?: T;
  /** 검증 에러 정보 (실패 시) */
  errors?: z.ZodError;
  /** 원본 데이터 (fallback용) */
  originalData: unknown;
};

/**
 * API 응답 데이터 검증 함수
 * @description Zod 스키마를 사용해 API 응답을 검증하고 로깅
 *
 * 검증 실패 시 동작:
 * - 상세한 에러 로깅 (tslog 활용)
 * - 개발 환경: 콘솔에 상세 정보 출력
 * - 프로덕션 환경: 구조화된 로그만 기록
 * - 원본 데이터는 보존하여 fallback 처리 가능
 *
 * @param data 검증할 응답 데이터
 * @param schema Zod 검증 스키마
 * @param endpoint API 엔드포인트 (로깅용)
 * @param method HTTP 메서드 (로깅용)
 * @param requestId 요청 추적 ID (선택적)
 * @returns 검증 결과 객체
 *
 * @example
 * ```typescript
 * const result = validateApiResponse(
 *   responseData,
 *   PokemonListResponseSchema,
 *   "/api/pokemon",
 *   "GET"
 * );
 * 
 * if (result.isValid) {
 *   // 검증된 데이터 사용
 *   return result.data;
 * } else {
 *   // fallback 처리 또는 에러 핸들링
 *   console.warn("검증 실패, 원본 데이터 사용");
 *   return result.originalData;
 * }
 * ```
 */
export function validateApiResponse<T>(
  data: unknown,
  schema: z.ZodType<T>,
  endpoint: string,
  method: string,
  requestId?: string,
): ValidationResult<T> {
  try {
    // Zod 스키마로 검증 시도
    const validatedData = schema.parse(data);
    
    // 검증 성공 로깅 (개발 환경에서만)
    logApiValidationSuccess(
      `API 응답 검증 성공: ${method} ${endpoint}`,
      {
        endpoint,
        method,
        expectedSchema: (schema as any)._zod?.def?.type || "Unknown",
      }
    );

    debugLogger.debug("API 응답 검증 성공", {
      endpoint,
      method,
      schemaType: (schema as any)._zod?.def?.type || "Unknown",
      dataKeys: typeof validatedData === "object" && validatedData !== null 
        ? Object.keys(validatedData) 
        : [],
    });

    return {
      isValid: true,
      data: validatedData,
      originalData: data,
    };
  } catch (error) {
    // 검증 실패 처리
    const zodError = error instanceof z.ZodError ? error : null;
    
    // 상세 검증 실패 로깅
    logApiValidationFailure(
      `API 응답 검증 실패: ${method} ${endpoint}`,
      {
        endpoint,
        method,
        expectedSchema: (schema as any)._zod?.def?.type || "Unknown",
        validationErrors: zodError?.issues || error,
        receivedData: data,
        requestId,
      }
    );

    // 개발 환경에서는 콘솔에도 상세 정보 출력
    if (import.meta.env.DEV) {
      console.group(`🔥 API 검증 실패: ${method} ${endpoint}`);
      console.error("검증 에러:", zodError?.issues || error);
      console.log("받은 데이터:", data);
      console.log("예상 스키마:", (schema as any)._zod?.def?.type || "Unknown");
      console.groupEnd();
    }

    return {
      isValid: false,
      errors: zodError || undefined,
      originalData: data,
    };
  }
}

/**
 * 안전한 API 응답 검증 함수
 * @description 검증 실패 시 타입 변환 없이 원본 데이터 반환
 *
 * 용도:
 * - 검증은 하되 실패해도 동작을 멈추지 않아야 하는 경우
 * - 점진적 타입 도입 시 기존 코드 호환성 유지
 * - 검증 실패 통계 수집용
 *
 * @param data 검증할 데이터
 * @param schema Zod 검증 스키마
 * @param endpoint API 엔드포인트
 * @param method HTTP 메서드
 * @returns 검증된 데이터 (실패 시 원본 데이터)
 */
export function safeValidateApiResponse<T>(
  data: unknown,
  schema: z.ZodType<T>,
  endpoint: string,
  method: string,
): T {
  const result = validateApiResponse(data, schema, endpoint, method);
  
  if (result.isValid && result.data) {
    return result.data;
  }

  // 검증 실패 시 원본 데이터를 타입 단언하여 반환
  // 주의: 런타임에서는 안전하지 않을 수 있음
  return data as T;
}

/**
 * 배치 API 응답 검증 함수
 * @description 여러 API 응답을 한 번에 검증
 *
 * @param responses 검증할 응답 데이터 배열
 * @param schemas 각 응답에 대응하는 스키마 배열
 * @param endpoints 각 응답의 엔드포인트 정보
 * @returns 각 응답의 검증 결과 배열
 */
export function validateMultipleApiResponses<T extends readonly z.ZodTypeAny[]>(
  responses: unknown[],
  schemas: T,
  endpoints: Array<{ endpoint: string; method: string }>,
): Array<ValidationResult<z.infer<T[number]>>> {
  if (responses.length !== schemas.length || responses.length !== endpoints.length) {
    throw new Error("응답, 스키마, 엔드포인트 배열의 길이가 일치하지 않습니다");
  }

  return responses.map((response, index) => {
    const schema = schemas[index];
    const endpointInfo = endpoints[index];
    
    return validateApiResponse(
      response,
      schema,
      endpointInfo.endpoint,
      endpointInfo.method,
      `batch-${index}`,
    );
  }) as Array<ValidationResult<z.infer<T[number]>>>;
}

/**
 * 자주 사용되는 기본 스키마들
 * @description 공통적으로 사용되는 기본 검증 스키마 모음
 */
export const CommonSchemas = {
  /** 문자열 응답 */
  StringResponse: createApiResponseSchema(z.string()),
  
  /** 숫자 응답 */
  NumberResponse: createApiResponseSchema(z.number()),
  
  /** 불린 응답 */
  BooleanResponse: createApiResponseSchema(z.boolean()),
  
  /** 빈 응답 (data: null) */
  EmptyResponse: createNullableApiResponseSchema(z.null()),
  
  /** 간단한 메시지 응답 */
  MessageResponse: createApiResponseSchema(
    z.object({
      message: z.string(),
    })
  ),
  
  /** 성공/실패만 표시하는 응답 */
  StatusResponse: createApiResponseSchema(
    z.object({
      success: z.boolean(),
    })
  ),

  /** ID만 반환하는 응답 */
  IdResponse: createApiResponseSchema(
    z.object({
      id: z.union([z.string(), z.number()]),
    })
  ),
} as const;

export type CommonSchemaTypes = {
  [K in keyof typeof CommonSchemas]: z.infer<typeof CommonSchemas[K]>;
};

/**
 * 엔드포인트별 스키마 매핑 및 검증 함수
 * @description URL 패턴에 따라 적절한 Zod 스키마를 선택하고 검증
 * @param data 검증할 데이터
 * @param endpoint API 엔드포인트 URL
 * @param method HTTP 메서드
 * @param requestId 요청 ID (선택적)
 * @returns 검증 결과
 */
export function validateEndpointResponse(
  data: unknown,
  endpoint: string,
  method: string,
  requestId?: string,
): ValidationResult<unknown> {
  // 도메인별 스키마 매핑
  const schemaMapping = getSchemaForEndpoint(endpoint, method);
  
  if (!schemaMapping) {
    // 스키마가 정의되지 않은 엔드포인트는 검증 건너뛰기
    return {
      isValid: true,
      data,
      originalData: data,
    };
  }

  const { schema, isApiResponse } = schemaMapping;

  if (isApiResponse) {
    // 백엔드 ApiResponse<T> 형식
    return validateApiResponse(data, schema, endpoint, method, requestId);
  } else {
    // 외부 API 또는 직접 데이터
    return validateApiResponse(data, schema, endpoint, method, requestId);
  }
}

/**
 * 엔드포인트에 해당하는 스키마 반환
 * @param endpoint API 엔드포인트 URL
 * @param method HTTP 메서드
 * @returns 스키마 정보 또는 null
 */
function getSchemaForEndpoint(
  endpoint: string,
  method: string,
): { schema: z.ZodType<any>; isApiResponse: boolean } | null {
  try {
    // exam 도메인
    if (endpoint.includes('/api/exams') || endpoint.includes('/exam/')) {
      if (method === 'GET' && endpoint.includes('/api/exams')) {
        // 시험 목록 조회
        const { ExamListApiResponseSchema } = require('@/api/exam/schemas');
        return { schema: ExamListApiResponseSchema, isApiResponse: true };
      }
      if (method === 'GET' && /\/api\/exams\/\d+$/.test(endpoint)) {
        // 시험 상세 조회
        const { ExamDetailApiResponseSchema } = require('@/api/exam/schemas');
        return { schema: ExamDetailApiResponseSchema, isApiResponse: true };
      }
      if (method === 'POST' && endpoint.includes('/api/exams')) {
        // 시험 생성
        const { ExamCreateApiResponseSchema } = require('@/api/exam/schemas');
        return { schema: ExamCreateApiResponseSchema, isApiResponse: true };
      }
    }

    // dashboard 도메인
    if (endpoint.includes('/api/dashboard')) {
      if (endpoint.includes('/recent-exams-status')) {
        const { RecentExamsStatusApiResponseSchema } = require('@/api/dashboard/schemas');
        return { schema: RecentExamsStatusApiResponseSchema, isApiResponse: true };
      }
      if (endpoint.includes('/score-distribution')) {
        const { ScoreDistributionApiResponseSchema } = require('@/api/dashboard/schemas');
        return { schema: ScoreDistributionApiResponseSchema, isApiResponse: true };
      }
      if (endpoint.includes('/student-detail')) {
        const { StudentDetailApiResponseSchema } = require('@/api/dashboard/schemas');
        return { schema: StudentDetailApiResponseSchema, isApiResponse: true };
      }
    }

    // exam-results 도메인
    if (endpoint.includes('/api/exam-results')) {
      if (endpoint.includes('/averages')) {
        const { ExamAveragesApiResponseSchema } = require('@/api/exam-results/schemas');
        return { schema: ExamAveragesApiResponseSchema, isApiResponse: true };
      }
    }

    // exam-sheet 도메인
    if (endpoint.includes('/api/exam-sheet') || endpoint.includes('/exam-sheet/')) {
      if (endpoint.includes('/units')) {
        const { UnitsApiResponseSchema } = require('@/api/exam-sheet/schemas');
        return { schema: UnitsApiResponseSchema, isApiResponse: true };
      }
      if (method === 'POST' && endpoint.includes('/exam-sheets')) {
        const { ExamSheetCreateApiResponseSchema } = require('@/api/exam-sheet/schemas');
        return { schema: ExamSheetCreateApiResponseSchema, isApiResponse: true };
      }
    }

    // health-check 도메인
    if (endpoint.includes('/api/health') || endpoint.includes('/actuator/health')) {
      const { HealthCheckApiResponseSchema } = require('@/api/health-check/schemas');
      return { schema: HealthCheckApiResponseSchema, isApiResponse: true };
    }

    // auth 도메인
    if (endpoint.includes('/api/auth')) {
      if (endpoint.includes('/login')) {
        const { LoginApiResponseSchema } = require('@/api/auth/schemas');
        return { schema: LoginApiResponseSchema, isApiResponse: true };
      }
      if (endpoint.includes('/logout')) {
        const { LogoutApiResponseSchema } = require('@/api/auth/schemas');
        return { schema: LogoutApiResponseSchema, isApiResponse: true };
      }
      if (endpoint.includes('/me')) {
        const { UserInfoApiResponseSchema } = require('@/api/auth/schemas');
        return { schema: UserInfoApiResponseSchema, isApiResponse: true };
      }
    }

    // pokemon 도메인 (외부 API - PokeAPI)
    if (endpoint.includes('pokeapi.co') || endpoint.includes('/api/v2/pokemon')) {
      if (method === 'GET' && endpoint.includes('/pokemon/') && !endpoint.includes('?')) {
        // 포켓몬 상세 정보
        const { PokemonDetailSchema } = require('@/api/pokemon/schemas');
        return { schema: PokemonDetailSchema, isApiResponse: false };
      }
      if (method === 'GET' && (endpoint.includes('/pokemon?') || endpoint.includes('/pokemon/'))) {
        // 포켓몬 목록
        const { PokemonListResponseSchema } = require('@/api/pokemon/schemas');
        return { schema: PokemonListResponseSchema, isApiResponse: false };
      }
    }

    // 매칭되는 스키마가 없음
    return null;
  } catch (error) {
    // require 실패 시 (스키마 파일이 없거나 로딩 실패)
    debugLogger.warn("스키마 로딩 실패", {
      endpoint,
      method,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * 동적 스키마 로딩 캐시
 * @description 성능 최적화를 위한 스키마 캐시
 */
const schemaCache = new Map<string, { schema: z.ZodType<any>; isApiResponse: boolean }>();

/**
 * 캐시를 활용한 스키마 조회
 * @param endpoint API 엔드포인트 URL
 * @param method HTTP 메서드
 * @returns 캐시된 스키마 정보 또는 null
 */
export function getCachedSchemaForEndpoint(
  endpoint: string,
  method: string,
): { schema: z.ZodType<any>; isApiResponse: boolean } | null {
  const cacheKey = `${method}:${endpoint}`;
  
  // 캐시에서 조회
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey) || null;
  }
  
  // 캐시 미스 시 스키마 로딩 후 캐시에 저장
  const schemaInfo = getSchemaForEndpoint(endpoint, method);
  if (schemaInfo) {
    schemaCache.set(cacheKey, schemaInfo);
  }
  
  return schemaInfo;
}

/**
 * 스키마 캐시 클리어
 * @description 개발 중 스키마 변경 시 캐시 초기화용
 */
export function clearSchemaCache(): void {
  schemaCache.clear();
  debugLogger.info("스키마 캐시 클리어됨");
}

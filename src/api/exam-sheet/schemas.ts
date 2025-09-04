/**
 * Exam Sheet API Zod 검증 스키마 정의
 * @description 시험지 관련 모든 API 응답에 대한 런타임 검증 스키마
 *
 * 주요 특징:
 * - 서버 타입과 100% 일치하는 Zod 스키마
 * - 중학교 학년 구분 (중1, 중2, 중3) 검증
 * - 단원 ID와 이름 필수 검증
 * - 상세한 에러 메시지로 디버깅 효율성 향상
 *
 * @example
 * ```typescript
 * import { UnitsByGradeApiResponseSchema } from "@/api/exam-sheet/schemas";
 * import { validateApiResponse } from "@/api/client/validation";
 * 
 * const result = validateApiResponse(
 *   responseData,
 *   UnitsByGradeApiResponseSchema,
 *   "/api/exam-sheets/units",
 *   "GET"
 * );
 * ```
 */

import { z } from "zod";
import { createApiResponseSchema } from "@/api/client/validation";

/**
 * 학년 검증 스키마
 * @description 중학교 학년만 허용하는 스키마 (중1, 중2, 중3)
 */
const GradeSchema = z.union([
  z.literal("중1"),
  z.literal("중2"), 
  z.literal("중3")
], {
  message: "학년은 '중1', '중2', '중3' 중 하나여야 합니다"
});

/**
 * 단원 엔티티 Zod 스키마
 * @description 학년별 단원 식별자 및 표시 이름
 */
const UnitSchema = z.object({
  /** 단원 ID */
  id: z.string()
    .min(1, "단원 ID는 비어있을 수 없습니다")
    .max(50, "단원 ID는 50자를 초과할 수 없습니다")
    .trim(),
  /** 단원명 */
  name: z.string()
    .min(1, "단원명은 비어있을 수 없습니다")
    .max(100, "단원명은 100자를 초과할 수 없습니다")
    .trim(),
  /** 소속 학년 */
  grade: GradeSchema,
});

/**
 * 학년별 단원 조회 데이터 Zod 스키마
 * @description 단원 배열 (실제 데이터 부분)
 */
const UnitsByGradeDataSchema = z.array(UnitSchema)
  .min(0, "단원 데이터는 빈 배열이라도 배열이어야 합니다");

// ===== ApiResponse로 래핑된 최종 스키마들 =====

/**
 * 학년별 단원 조회 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exam-sheets/units 응답 검증용
 *
 * 백엔드 표준 ApiResponse<T> 형식:
 * - result: "SUCCESS" | "ERROR"
 * - message: string
 * - data: UnitsByGradeData
 *
 * 인터셉터에 의해 자동 처리:
 * - SUCCESS인 경우: data(UnitsByGradeData)만 추출하여 반환
 * - ERROR인 경우: ApiResponseError 발생
 */
export const UnitsByGradeApiResponseSchema = createApiResponseSchema(UnitsByGradeDataSchema);

/**
 * 단원 상세 정보 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exam-sheets/units/{id} 응답 검증용
 */
export const UnitDetailApiResponseSchema = createApiResponseSchema(UnitSchema);

/**
 * 시험지 생성 결과 API 응답 스키마 (ApiResponse 래핑)
 * @description POST /api/exam-sheets 응답 검증용
 */
export const ExamSheetCreatedApiResponseSchema = createApiResponseSchema(
  z.object({
    /** 생성된 시험지 ID */
    id: z.string().min(1, "시험지 ID는 비어있을 수 없습니다"),
    /** 시험지명 */
    name: z.string().min(1, "시험지명은 비어있을 수 없습니다"),
    /** 선택된 단원 ID 목록 */
    unitIds: z.array(z.string()),
    /** 총 문제 수 */
    totalQuestions: z.number().int().nonnegative(),
    /** 생성 시각 */
    createdAt: z.string().datetime(),
    /** 생성 메시지 */
    message: z.string().optional(),
  })
);

// ===== 요청 파라미터 검증 스키마들 =====

/**
 * 단원 조회 파라미터 검증 스키마
 * @description API 요청 시 사용하는 쿼리 파라미터 검증
 */
export const UnitsByGradeParamsSchema = z.object({
  /** 학년 (중1, 중2, 중3) */
  grade: GradeSchema,
  /** 단원 검색 키워드 (선택적) */
  search: z.string()
    .min(1, "검색 키워드는 1자 이상이어야 합니다")
    .max(50, "검색 키워드는 50자를 초과할 수 없습니다")
    .optional(),
  /** 정렬 방식 (선택적) */
  sort: z.enum(["name", "id", "createdAt"], {
    message: "정렬 방식은 'name', 'id', 'createdAt' 중 하나여야 합니다"
  }).optional(),
  /** 정렬 순서 (선택적) */
  order: z.enum(["asc", "desc"], {
    message: "정렬 순서는 'asc' 또는 'desc'여야 합니다"
  }).optional(),
});

/**
 * 시험지 생성 요청 바디 검증 스키마
 * @description POST /api/exam-sheets 요청 검증용
 */
export const CreateExamSheetRequestSchema = z.object({
  /** 시험지명 */
  name: z.string()
    .min(1, "시험지명은 필수입니다")
    .max(100, "시험지명은 100자를 초과할 수 없습니다")
    .trim(),
  /** 대상 학년 */
  grade: GradeSchema,
  /** 선택된 단원 ID 목록 */
  unitIds: z.array(z.string().min(1, "단원 ID는 비어있을 수 없습니다"))
    .min(1, "최소 하나의 단원을 선택해야 합니다")
    .max(20, "최대 20개의 단원까지 선택 가능합니다"),
  /** 문제 수 (선택적) */
  questionCount: z.number().int()
    .min(1, "문제 수는 1개 이상이어야 합니다")
    .max(100, "문제 수는 100개를 초과할 수 없습니다")
    .optional(),
  /** 시험지 설명 (선택적) */
  description: z.string()
    .max(500, "시험지 설명은 500자를 초과할 수 없습니다")
    .optional(),
  /** 난이도 (선택적) */
  difficulty: z.enum(["easy", "medium", "hard"], {
    message: "난이도는 'easy', 'medium', 'hard' 중 하나여야 합니다"
  }).optional(),
});

/**
 * 시험지 수정 요청 바디 검증 스키마
 * @description PUT /api/exam-sheets/{id} 요청 검증용
 */
export const UpdateExamSheetRequestSchema = CreateExamSheetRequestSchema.partial();

/**
 * 시험지 목록 조회 파라미터 검증 스키마
 * @description GET /api/exam-sheets 요청 검증용
 */
export const ExamSheetListParamsSchema = z.object({
  /** 학년 필터 */
  grade: GradeSchema.optional(),
  /** 검색 키워드 */
  search: z.string().max(50).optional(),
  /** 페이지 번호 (0부터 시작) */
  page: z.number().int().nonnegative().optional(),
  /** 페이지 크기 */
  size: z.number().int().positive().max(100).optional(),
  /** 정렬 기준 */
  sort: z.string().optional(),
});

// ===== 개별 스키마 export (필요한 경우) =====

export {
  UnitSchema,
  UnitsByGradeDataSchema,
  GradeSchema,
};

// ===== 타입 추론 헬퍼들 =====

/**
 * Zod 스키마에서 TypeScript 타입 추론
 * @description 검증된 데이터의 TypeScript 타입
 */
export type ValidatedUnit = z.infer<typeof UnitSchema>;
export type ValidatedUnitsByGradeData = z.infer<typeof UnitsByGradeDataSchema>;
export type ValidatedUnitsByGradeParams = z.infer<typeof UnitsByGradeParamsSchema>;
export type ValidatedCreateExamSheetRequest = z.infer<typeof CreateExamSheetRequestSchema>;
export type ValidatedUpdateExamSheetRequest = z.infer<typeof UpdateExamSheetRequestSchema>;
export type ValidatedExamSheetListParams = z.infer<typeof ExamSheetListParamsSchema>;
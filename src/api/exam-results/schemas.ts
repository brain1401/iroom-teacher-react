/**
 * Exam Results API Zod 검증 스키마 정의
 * @description 시험 결과 관련 모든 API 응답에 대한 런타임 검증 스키마
 *
 * 주요 특징:
 * - 서버 타입과 100% 일치하는 Zod 스키마
 * - 시험 평균 점수 범위 검증 (0-100)
 * - 시험명 필수 검증
 * - 상세한 에러 메시지로 디버깅 효율성 향상
 *
 * @example
 * ```typescript
 * import { ExamAveragesApiResponseSchema } from "@/api/exam-results/schemas";
 * import { validateApiResponse } from "@/api/client/validation";
 * 
 * const result = validateApiResponse(
 *   responseData,
 *   ExamAveragesApiResponseSchema,
 *   "/api/exam-results/averages",
 *   "GET"
 * );
 * ```
 */

import { z } from "zod";
import { createApiResponseSchema } from "@/api/client/validation";

/**
 * 학년 검증 스키마
 * @description 1-6학년만 허용하는 공통 스키마
 */
const GradeSchema = z.union([
  z.literal(1),
  z.literal(2), 
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6)
], {
  message: "학년은 1-6 중 하나여야 합니다"
});

/**
 * 시험 점수 검증 스키마
 * @description 0-100점 범위의 시험 점수 검증
 */
const ExamScoreSchema = z.number()
  .min(0, "시험 점수는 0점 이상이어야 합니다")
  .max(100, "시험 점수는 100점 이하여야 합니다")
  .refine((score) => Number.isFinite(score), {
    message: "시험 점수는 유효한 숫자여야 합니다"
  });

/**
 * 시험 평균 응답 모델 Zod 스키마
 * @description 학년별 시험(시험지) 평균 점수 정보
 */
const ExamAverageSchema = z.object({
  /** 시험명 */
  examName: z.string()
    .min(1, "시험명은 비어있을 수 없습니다")
    .max(100, "시험명은 100자를 초과할 수 없습니다")
    .trim(),
  /** 평균 점수 (0~100) */
  average: ExamScoreSchema,
});

/**
 * 학년별 시험 평균 조회 데이터 Zod 스키마
 * @description 시험 평균 배열 (실제 데이터 부분)
 */
const ExamAveragesDataSchema = z.array(ExamAverageSchema)
  .min(0, "시험 평균 데이터는 빈 배열이라도 배열이어야 합니다");

// ===== ApiResponse로 래핑된 최종 스키마들 =====

/**
 * 학년별 시험 평균 조회 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exam-results/averages 응답 검증용
 *
 * 백엔드 표준 ApiResponse<T> 형식:
 * - result: "SUCCESS" | "ERROR"
 * - message: string
 * - data: ExamAveragesData
 *
 * 인터셉터에 의해 자동 처리:
 * - SUCCESS인 경우: data(ExamAveragesData)만 추출하여 반환
 * - ERROR인 경우: ApiResponseError 발생
 */
export const ExamAveragesApiResponseSchema = createApiResponseSchema(ExamAveragesDataSchema);

// ===== 요청 파라미터 검증 스키마들 =====

/**
 * 시험 평균 조회 파라미터 검증 스키마
 * @description API 요청 시 사용하는 쿼리 파라미터 검증
 */
export const ExamAveragesParamsSchema = z.object({
  /** 학년 (1-6) */
  grade: GradeSchema,
  /** 시험 유형 필터 (선택적) */
  examType: z.string().optional(),
  /** 기간 필터 - 시작일 (선택적) */
  startDate: z.string().date("YYYY-MM-DD 형식이어야 합니다").optional(),
  /** 기간 필터 - 종료일 (선택적) */
  endDate: z.string().date("YYYY-MM-DD 형식이어야 합니다").optional(),
  /** 최소 평균 점수 필터 (선택적) */
  minAverage: ExamScoreSchema.optional(),
  /** 최대 평균 점수 필터 (선택적) */
  maxAverage: ExamScoreSchema.optional(),
}).refine((data) => {
  // 시작일과 종료일이 모두 있는 경우 시작일이 종료일보다 앞서야 함
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "시작일은 종료일보다 앞서야 합니다",
  path: ["endDate"],
}).refine((data) => {
  // 최소/최대 평균 점수가 모두 있는 경우 최소값이 최대값보다 작아야 함
  if (data.minAverage !== undefined && data.maxAverage !== undefined) {
    return data.minAverage <= data.maxAverage;
  }
  return true;
}, {
  message: "최소 평균 점수는 최대 평균 점수보다 작거나 같아야 합니다",
  path: ["maxAverage"],
});

/**
 * 시험 상세 결과 조회 파라미터 검증 스키마
 * @description 개별 시험의 상세 결과 조회용 (확장 가능)
 */
export const ExamDetailResultParamsSchema = z.object({
  /** 시험 ID */
  examId: z.string().min(1, "시험 ID는 비어있을 수 없습니다"),
  /** 학년 (1-6) */
  grade: GradeSchema,
  /** 상세 통계 포함 여부 */
  includeStatistics: z.boolean().optional(),
});

// ===== 개별 스키마 export (필요한 경우) =====

export {
  ExamAverageSchema,
  ExamAveragesDataSchema,
  GradeSchema,
  ExamScoreSchema,
};

// ===== 타입 추론 헬퍼들 =====

/**
 * Zod 스키마에서 TypeScript 타입 추론
 * @description 검증된 데이터의 TypeScript 타입
 */
export type ValidatedExamAverage = z.infer<typeof ExamAverageSchema>;
export type ValidatedExamAveragesData = z.infer<typeof ExamAveragesDataSchema>;
export type ValidatedExamAveragesParams = z.infer<typeof ExamAveragesParamsSchema>;
export type ValidatedExamDetailResultParams = z.infer<typeof ExamDetailResultParamsSchema>;
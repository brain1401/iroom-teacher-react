/**
 * Dashboard API Zod 검증 스키마 정의
 * @description 대시보드 관련 모든 API 응답에 대한 런타임 검증 스키마
 *
 * 주요 특징:
 * - 서버 타입과 100% 일치하는 Zod 스키마
 * - 학년, 점수, 비율 등의 범위 검증
 * - 상세한 에러 메시지로 디버깅 효율성 향상
 * - 통계 데이터의 정확성 보장
 *
 * @example
 * ```typescript
 * import { RecentExamsStatusApiResponseSchema } from "@/api/dashboard/schemas";
 * import { validateApiResponse } from "@/api/client/validation";
 * 
 * const result = validateApiResponse(
 *   responseData,
 *   RecentExamsStatusApiResponseSchema,
 *   "/api/dashboard/recent-exams",
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
 * 학년 검증 스키마
 * @description 1-3학년만 허용하는 공통 스키마
 */
const GradeSchema = z.number().int().min(1).max(3, {
  message: "학년은 1-3 사이여야 합니다"
});

/**
 * 백분율 검증 스키마
 * @description 0-100% 범위 검증
 */
const PercentageSchema = z.number().min(0).max(100, {
  message: "백분율은 0-100% 사이여야 합니다"
});

/**
 * 시험 제출 정보 Zod 스키마
 * @description 서버의 ExamSubmissionInfo와 동일
 */
const ExamSubmissionInfoSchema = z.object({
  /** 시험 ID */
  examId: z.string().min(1, "시험 ID는 비어있을 수 없습니다"),
  /** 시험명 */
  examName: z.string().min(1, "시험명은 비어있을 수 없습니다"),
  /** 생성일 */
  createdAt: ISODateTimeSchema,
  /** 전체 예상 제출 인원 */
  totalExpected: z.number().int().nonnegative({
    message: "전체 예상 제출 인원은 0 이상의 정수여야 합니다"
  }),
  /** 실제 제출 인원 */
  actualSubmissions: z.number().int().nonnegative({
    message: "실제 제출 인원은 0 이상의 정수여야 합니다"
  }),
  /** 제출률 (%) */
  submissionRate: PercentageSchema,
  /** 문제 개수 */
  questionCount: z.number().int().positive({
    message: "문제 개수는 1 이상의 정수여야 합니다"
  }),
});

/**
 * 최근 시험 제출 현황 응답 Zod 스키마
 * @description 서버의 RecentExamsStatusResponse와 동일
 */
const RecentExamsStatusResponseSchema = z.object({
  /** 학년 */
  grade: GradeSchema,
  /** 시험 개수 */
  examCount: z.number().int().nonnegative({
    message: "시험 개수는 0 이상의 정수여야 합니다"
  }),
  /** 평균 제출률 */
  averageSubmissionRate: PercentageSchema,
  /** 시험 제출 정보 목록 */
  examSubmissions: z.array(ExamSubmissionInfoSchema),
});

/**
 * 성적 분포 정보 Zod 스키마
 * @description 서버의 ScoreDistribution과 동일
 */
const ScoreDistributionSchema = z.object({
  /** 점수 구간 (예: "0-39점") */
  scoreRange: z.string().min(1, "점수 구간 설명은 비어있을 수 없습니다"),
  /** 구간 최솟값 */
  rangeMin: z.number().min(0, "구간 최솟값은 0 이상이어야 합니다"),
  /** 구간 최댓값 */
  rangeMax: z.number().min(0, "구간 최댓값은 0 이상이어야 합니다"),
  /** 해당 구간 학생 수 */
  studentCount: z.number().int().nonnegative({
    message: "학생 수는 0 이상의 정수여야 합니다"
  }),
  /** 해당 구간 비율 (%) */
  percentage: PercentageSchema,
}).refine((data) => data.rangeMax >= data.rangeMin, {
  message: "구간 최댓값은 최솟값보다 크거나 같아야 합니다",
  path: ["rangeMax"],
});

/**
 * 성적 통계 정보 Zod 스키마
 * @description 서버의 ScoreStatistics와 동일
 */
const ScoreStatisticsSchema = z.object({
  /** 최고 점수 */
  maxScore: z.number().min(0, "최고 점수는 0 이상이어야 합니다"),
  /** 최저 점수 */
  minScore: z.number().min(0, "최저 점수는 0 이상이어야 합니다"),
  /** 합격률 (60점 이상) */
  passingRate: PercentageSchema,
  /** 우수율 (80점 이상) */
  excellentRate: PercentageSchema,
}).refine((data) => data.maxScore >= data.minScore, {
  message: "최고 점수는 최저 점수보다 크거나 같아야 합니다",
  path: ["maxScore"],
}).refine((data) => data.excellentRate <= data.passingRate, {
  message: "우수율은 합격률보다 작거나 같아야 합니다",
  path: ["excellentRate"],
});

/**
 * 성적 분포도 응답 Zod 스키마
 * @description 서버의 ScoreDistributionResponse와 동일
 */
const ScoreDistributionResponseSchema = z.object({
  /** 학년 */
  grade: GradeSchema,
  /** 전체 학생 수 */
  totalStudentCount: z.number().int().nonnegative({
    message: "전체 학생 수는 0 이상의 정수여야 합니다"
  }),
  /** 평균 점수 */
  averageScore: z.number().min(0, "평균 점수는 0 이상이어야 합니다"),
  /** 표준편차 */
  standardDeviation: z.number().nonnegative({
    message: "표준편차는 0 이상이어야 합니다"
  }),
  /** 중앙값 */
  medianScore: z.number().min(0, "중앙값은 0 이상이어야 합니다"),
  /** 점수 구간별 분포 */
  distributions: z.array(ScoreDistributionSchema),
  /** 통계 요약 */
  statistics: ScoreStatisticsSchema,
});

/**
 * 최근 시험 제출 현황 조회 파라미터 Zod 스키마
 * @description API 요청 시 사용하는 쿼리 파라미터 검증
 */
export const RecentExamsStatusParamsSchema = z.object({
  /** 학년 (1, 2, 3) */
  grade: GradeSchema,
  /** 조회할 최근 시험 개수 (기본값: 10) */
  limit: z.number().int().positive().max(50, {
    message: "조회 개수는 1-50 사이여야 합니다"
  }).optional(),
});

/**
 * 성적 분포도 조회 파라미터 Zod 스키마
 * @description API 요청 시 사용하는 쿼리 파라미터 검증
 */
export const ScoreDistributionParamsSchema = z.object({
  /** 학년 (1, 2, 3) */
  grade: GradeSchema,
});

// ===== ApiResponse로 래핑된 최종 스키마들 =====

/**
 * 최근 시험 제출 현황 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/dashboard/recent-exams 응답 검증용
 */
export const RecentExamsStatusApiResponseSchema = createApiResponseSchema(
  RecentExamsStatusResponseSchema
);

/**
 * 성적 분포도 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/dashboard/score-distribution 응답 검증용
 */
export const ScoreDistributionApiResponseSchema = createApiResponseSchema(
  ScoreDistributionResponseSchema
);

/**
 * 전체 대시보드 데이터 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/dashboard 응답 검증용 (전체 정보)
 */
export const DashboardOverviewApiResponseSchema = createApiResponseSchema(
  z.object({
    /** 최근 시험 제출 현황 */
    recentExams: RecentExamsStatusResponseSchema,
    /** 성적 분포도 */
    scoreDistribution: ScoreDistributionResponseSchema,
    /** 대시보드 업데이트 시간 */
    lastUpdated: ISODateTimeSchema,
  })
);

// ===== 요청 파라미터 검증 스키마들 =====


/**
 * 대시보드 전체 데이터 조회 파라미터 검증 스키마
 */
export const DashboardOverviewParamsSchema = z.object({
  /** 학년 (1, 2, 3) */
  grade: GradeSchema,
  /** 최근 시험 조회 개수 */
  examLimit: z.number().int().positive().max(50).optional(),

});

// ===== 개별 스키마 export (필요한 경우) =====

export {
  ExamSubmissionInfoSchema,
  RecentExamsStatusResponseSchema,
  ScoreDistributionSchema,
  ScoreStatisticsSchema,
  ScoreDistributionResponseSchema,
  RecentExamsStatusParamsSchema as RecentExamsStatusParamsValidationSchema,
  ScoreDistributionParamsSchema as ScoreDistributionParamsValidationSchema,
};
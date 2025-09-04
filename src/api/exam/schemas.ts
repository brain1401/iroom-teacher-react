/**
 * 시험 API Zod 검증 스키마 정의
 * @description 시험 관련 모든 API 응답에 대한 런타임 검증 스키마
 *
 * 주요 특징:
 * - 서버 타입과 100% 일치하는 Zod 스키마
 * - ISO 8601 날짜 형식 검증
 * - Spring Boot Page 구조 완벽 지원
 * - 상세한 에러 메시지로 디버깅 효율성 향상
 *
 * @example
 * ```typescript
 * import { ServerExamListResponseSchema } from "@/api/exam/schemas";
 * import { validateApiResponse } from "@/api/client/validation";
 * 
 * const result = validateApiResponse(
 *   responseData,
 *   ServerExamListResponseSchema,
 *   "/api/exams",
 *   "GET"
 * );
 * ```
 */

import { z } from "zod";
import { createApiResponseSchema, createPagedApiResponseSchema } from "@/api/client/validation";

/**
 * ISO 8601 날짜 형식 검증 스키마
 * @description "2024-01-15T10:30:00.000Z" 형식의 날짜 검증
 */
const ISODateTimeSchema = z.string().datetime({
  message: "ISO 8601 형식의 날짜시간이어야 합니다 (예: 2024-01-15T10:30:00.000Z)"
});

/**
 * Spring Boot Pageable 정보 Zod 스키마
 * @description 서버의 Pageable 객체와 동일한 구조
 */
const ServerPageableSchema = z.object({
  /** 페이지 번호 (0부터 시작) */
  pageNumber: z.number().int().nonnegative({
    message: "페이지 번호는 0 이상의 정수여야 합니다"
  }),
  /** 페이지 크기 */
  pageSize: z.number().int().positive({
    message: "페이지 크기는 1 이상의 정수여야 합니다"
  }),
  /** 정렬 정보 */
  sort: z.object({
    /** 정렬 적용 여부 */
    sorted: z.boolean(),
    /** 정렬 없음 여부 */
    empty: z.boolean(),
    /** 정렬 미적용 여부 */
    unsorted: z.boolean(),
  }),
  /** 오프셋 */
  offset: z.number().int().nonnegative({
    message: "오프셋은 0 이상의 정수여야 합니다"
  }),
  /** 페이지 적용 여부 */
  paged: z.boolean(),
  /** 페이지 미적용 여부 */
  unpaged: z.boolean(),
});

/**
 * 시험지 정보 Zod 스키마
 * @description 서버의 ExamSheetInfo와 동일
 */
const ServerExamSheetInfoSchema = z.object({
  /** 시험지 ID */
  id: z.string().min(1, "시험지 ID는 비어있을 수 없습니다"),
  /** 시험지 이름 */
  examName: z.string().min(1, "시험지 이름은 비어있을 수 없습니다"),
  /** 총 문제 수 */
  totalQuestions: z.number().int().nonnegative({
    message: "총 문제 수는 0 이상의 정수여야 합니다"
  }),
  /** 총 점수 */
  totalPoints: z.number().nonnegative({
    message: "총 점수는 0 이상이어야 합니다"
  }),
  /** 생성일시 (ISO 8601) */
  createdAt: ISODateTimeSchema,
});

/**
 * 시험 기본 정보 Zod 스키마
 * @description 서버의 Exam 엔티티와 동일
 */
const ServerExamSchema = z.object({
  /** 시험 ID */
  id: z.string().min(1, "시험 ID는 비어있을 수 없습니다"),
  /** 시험 이름 */
  examName: z.string().min(1, "시험 이름은 비어있을 수 없습니다"),
  /** 학년 */
  grade: z.number().int().min(1).max(6, {
    message: "학년은 1-6 사이의 정수여야 합니다"
  }),
  /** 시험 내용 */
  content: z.string({
    message: "시험 내용은 문자열이어야 합니다"
  }),
  /** QR 코드 URL */
  qrCodeUrl: z.string().url({
    message: "올바른 URL 형식이어야 합니다"
  }).nullable(),
  /** 생성일시 (ISO 8601) */
  createdAt: ISODateTimeSchema,
  /** 시험지 정보 (없을 수 있음) */
  examSheetInfo: ServerExamSheetInfoSchema.nullable(),
});

/**
 * 시험 목록 응답 Zod 스키마
 * @description 서버의 Page<Exam> 응답 구조와 동일
 */
const ServerExamListResponseSchema = z.object({
  /** 시험 목록 */
  content: z.array(ServerExamSchema),
  /** 페이지 정보 */
  pageable: ServerPageableSchema,
  /** 마지막 페이지 여부 */
  last: z.boolean(),
  /** 총 요소 수 */
  totalElements: z.number().int().nonnegative({
    message: "총 요소 수는 0 이상의 정수여야 합니다"
  }),
  /** 총 페이지 수 */
  totalPages: z.number().int().nonnegative({
    message: "총 페이지 수는 0 이상의 정수여야 합니다"
  }),
  /** 첫 페이지 여부 */
  first: z.boolean(),
  /** 현재 페이지 크기 */
  size: z.number().int().positive({
    message: "페이지 크기는 1 이상의 정수여야 합니다"
  }),
  /** 현재 페이지 번호 */
  number: z.number().int().nonnegative({
    message: "페이지 번호는 0 이상의 정수여야 합니다"
  }),
  /** 정렬 정보 */
  sort: z.object({
    /** 정렬 적용 여부 */
    sorted: z.boolean(),
    /** 정렬 없음 여부 */
    empty: z.boolean(),
    /** 정렬 미적용 여부 */
    unsorted: z.boolean(),
  }),
  /** 현재 페이지 요소 수 */
  numberOfElements: z.number().int().nonnegative({
    message: "현재 페이지 요소 수는 0 이상의 정수여야 합니다"
  }),
  /** 빈 페이지 여부 */
  empty: z.boolean(),
});

/**
 * 최근 제출 정보 Zod 스키마
 * @description 서버의 RecentSubmission과 동일
 */
const ServerRecentSubmissionSchema = z.object({
  /** 제출 ID */
  submissionId: z.string().min(1, "제출 ID는 비어있을 수 없습니다"),
  /** 학생 ID */
  studentId: z.number().int().positive({
    message: "학생 ID는 양의 정수여야 합니다"
  }),
  /** 학생 이름 */
  studentName: z.string().min(1, "학생 이름은 비어있을 수 없습니다"),
  /** 제출일시 (ISO 8601) */
  submittedAt: ISODateTimeSchema,
});

/**
 * 제출 통계 정보 Zod 스키마
 * @description 서버의 SubmissionStats와 동일
 */
const ServerSubmissionStatsSchema = z.object({
  /** 총 예상 학생 수 */
  totalExpectedStudents: z.number().int().nonnegative({
    message: "총 예상 학생 수는 0 이상의 정수여야 합니다"
  }),
  /** 실제 제출 수 */
  actualSubmissions: z.number().int().nonnegative({
    message: "실제 제출 수는 0 이상의 정수여야 합니다"
  }),
  /** 미제출 수 */
  notSubmitted: z.number().int().nonnegative({
    message: "미제출 수는 0 이상의 정수여야 합니다"
  }),
  /** 제출률 (%) */
  submissionRate: z.number().min(0).max(100, {
    message: "제출률은 0-100% 사이여야 합니다"
  }),
  /** 통계 생성일시 (ISO 8601) */
  statsGeneratedAt: ISODateTimeSchema,
});

/**
 * 시간별 제출 통계 Zod 스키마
 * @description 서버의 HourlyStats와 동일
 */
const ServerHourlyStatsSchema = z.object({
  /** 시간 (yyyy-MM-dd HH:mm:ss) */
  hour: z.string().regex(
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
    "yyyy-MM-dd HH:mm:ss 형식이어야 합니다"
  ),
  /** 해당 시간 제출 수 */
  submissionCount: z.number().int().nonnegative({
    message: "제출 수는 0 이상의 정수여야 합니다"
  }),
});

/**
 * 시험 제출 현황 상세 응답 Zod 스키마
 * @description 서버의 SubmissionStatusResponse와 동일
 */
const ServerExamSubmissionStatusResponseSchema = z.object({
  /** 시험 정보 */
  examInfo: ServerExamSchema,
  /** 제출 통계 */
  submissionStats: ServerSubmissionStatsSchema,
  /** 최근 제출 목록 */
  recentSubmissions: z.array(ServerRecentSubmissionSchema),
  /** 시간별 제출 통계 */
  hourlyStats: z.array(ServerHourlyStatsSchema),
});

/**
 * 시험 통계 응답 Zod 스키마
 * @description 서버의 ExamStatistics와 동일
 */
const ServerExamStatisticsResponseSchema = z.object({
  /** 총 시험 수 */
  total: z.number().int().nonnegative({
    message: "총 시험 수는 0 이상의 정수여야 합니다"
  }),
  /** 학년별 백분율 */
  percentages: z.object({
    /** 1학년 백분율 */
    grade1Percentage: z.number().min(0).max(100, {
      message: "백분율은 0-100% 사이여야 합니다"
    }),
    /** 2학년 백분율 */
    grade2Percentage: z.number().min(0).max(100, {
      message: "백분율은 0-100% 사이여야 합니다"
    }),
    /** 3학년 백분율 */
    grade3Percentage: z.number().min(0).max(100, {
      message: "백분율은 0-100% 사이여야 합니다"
    }),
  }),
  /** 1학년 시험 수 */
  grade1: z.number().int().nonnegative({
    message: "학년별 시험 수는 0 이상의 정수여야 합니다"
  }),
  /** 2학년 시험 수 */
  grade2: z.number().int().nonnegative({
    message: "학년별 시험 수는 0 이상의 정수여야 합니다"
  }),
  /** 3학년 시험 수 */
  grade3: z.number().int().nonnegative({
    message: "학년별 시험 수는 0 이상의 정수여야 합니다"
  }),
});

/**
 * 시험 목록 조회 필터 파라미터 Zod 스키마
 * @description API 요청 시 사용하는 쿼리 파라미터 검증
 */
const ServerExamListParamsSchema = z.object({
  /** 학년 (1, 2, 3) */
  grade: z.number().int().min(1).max(6, {
    message: "학년은 1-6 사이여야 합니다"
  }).optional(),
  /** 검색 키워드 */
  search: z.string().optional(),
  /** 최근 시험 필터 */
  recent: z.boolean().optional(),
  /** 페이지 번호 (0부터 시작) */
  page: z.number().int().nonnegative({
    message: "페이지 번호는 0 이상이어야 합니다"
  }).optional(),
  /** 페이지 크기 (기본 20) */
  size: z.number().int().positive({
    message: "페이지 크기는 1 이상이어야 합니다"
  }).optional(),
  /** 정렬 기준 (기본 createdAt,desc) */
  sort: z.string().optional(),
});

/**
 * 시험 통계 조회 파라미터 Zod 스키마
 * @description 통계 API 요청 시 사용하는 쿼리 파라미터 검증
 */
const ServerExamStatisticsParamsSchema = z.object({
  /** 통계 타입 (기본 by-grade) */
  type: z.literal("by-grade").optional(),
});

// ===== ApiResponse로 래핑된 최종 스키마들 =====

/**
 * 시험 목록 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exams 응답 검증용
 */
export const ExamListApiResponseSchema = createApiResponseSchema(ServerExamListResponseSchema);

/**
 * 시험 상세 정보 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exams/{id} 응답 검증용
 */
export const ExamDetailApiResponseSchema = createApiResponseSchema(ServerExamSchema);

/**
 * 시험 제출 현황 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exams/{id}/submissions 응답 검증용
 */
export const ExamSubmissionStatusApiResponseSchema = createApiResponseSchema(
  ServerExamSubmissionStatusResponseSchema
);

/**
 * 시험 통계 API 응답 스키마 (ApiResponse 래핑)
 * @description GET /api/exams/statistics 응답 검증용
 */
export const ExamStatisticsApiResponseSchema = createApiResponseSchema(
  ServerExamStatisticsResponseSchema
);

/**
 * 시험 생성 API 응답 스키마 (ApiResponse 래핑)
 * @description POST /api/exams 응답 검증용
 */
export const ExamCreatedApiResponseSchema = createApiResponseSchema(
  z.object({
    id: z.string(),
    examName: z.string(),
    message: z.string().optional(),
  })
);

// ===== 요청 파라미터 검증 스키마들 =====

/**
 * 시험 목록 조회 파라미터 검증 스키마
 */
export const ExamListParamsSchema = ServerExamListParamsSchema;

/**
 * 시험 통계 조회 파라미터 검증 스키마  
 */
export const ExamStatisticsParamsSchema = ServerExamStatisticsParamsSchema;

/**
 * 시험 생성 요청 바디 검증 스키마
 */
export const CreateExamRequestSchema = z.object({
  /** 시험 이름 */
  examName: z.string().min(1, "시험 이름은 필수입니다").max(200, "시험 이름은 200자를 초과할 수 없습니다"),
  /** 학년 */
  grade: z.number().int().min(1).max(6, "학년은 1-6 사이여야 합니다"),
  /** 시험 내용 */
  content: z.string().min(1, "시험 내용은 필수입니다"),
});

/**
 * 시험 수정 요청 바디 검증 스키마
 */
export const UpdateExamRequestSchema = CreateExamRequestSchema.partial();

// ===== 개별 스키마 export (필요한 경우) =====

export {
  ServerExamSchema,
  ServerExamListResponseSchema,
  ServerExamSubmissionStatusResponseSchema,
  ServerExamStatisticsResponseSchema,
  ServerExamListParamsSchema,
  ServerExamStatisticsParamsSchema,
};
import type { ApiResponse } from "@/api/client/types";
import type { Grade } from "@/types/grade";

/**
 * 학년 타입 재노출
 * @description API 레이어에서 사용되는 학년 타입
 */
export type { Grade };

/**
 * 시험 평균 응답 모델
 * @description 학년별 시험(시험지) 평균 점수 정보
 *
 * 필드 설명:
 * - examName: 시험명 (예: "중간고사", "기말고사")
 * - average: 평균 점수 (0~100 가정)
 */
export type ExamAverage = {
  /** 시험명 */
  examName: string;
  /** 평균 점수 */
  average: number;
};

/**
 * 학년별 시험 평균 조회 데이터
 * @description 시험 평균 배열 (실제 데이터 부분)
 */
export type ExamAveragesData = ExamAverage[];

/**
 * 학년별 시험 평균 조회 API 응답 타입
 * @description 백엔드 표준 ApiResponse<T> 형식으로 래핑된 시험 평균 응답
 *
 * 인터셉터에 의해 자동 처리:
 * - SUCCESS인 경우: ExamAveragesData만 추출하여 반환
 * - ERROR인 경우: ApiResponseError 발생
 *
 * @example
 * ```typescript
 * // 백엔드 원본 응답 형식
 * const backendResponse: ExamAveragesApiResponse = {
 *   result: "SUCCESS",
 *   message: "시험 평균 조회 성공",
 *   data: [
 *     { examName: "중간고사", average: 85.5 },
 *     { examName: "기말고사", average: 88.2 }
 *   ]
 * };
 *
 * // 인터셉터 처리 후 API 함수에서 받는 형태: ExamAveragesData
 * ```
 */
export type ExamAveragesApiResponse = ApiResponse<ExamAveragesData>;

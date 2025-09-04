import { authApiClient } from "@/api/client";
import type {
  RecentExamsStatusResponse,
  RecentExamsStatusParams,
  ScoreDistributionResponse,
  ScoreDistributionParams,
} from "./types";

/**
 * 학년별 최근 시험 제출 현황 조회
 * @description 특정 학년의 최근 시험들의 제출 현황을 조회하는 함수
 *
 * 주요 기능:
 * - grade 파라미터로 학년 (1, 2, 3) 지정
 * - limit 파라미터로 조회할 시험 개수 제한 (기본값: 10)
 * - 시험 제출률, 문제 개수, 생성일 등 포함
 * - 생성일 기준 내림차순 정렬
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @param params.limit 조회할 최근 시험 개수 (기본값: 10)
 * @returns 학년별 최근 시험 제출 현황 데이터
 * @throws {ApiError} API 요청 실패 시
 */
export async function fetchRecentExamsStatus(
  params: RecentExamsStatusParams
): Promise<RecentExamsStatusResponse> {
  try {
    const response = await authApiClient.get<RecentExamsStatusResponse>(
      "/teacher/dashboard/recent-exams-status",
      {
        params: {
          grade: params.grade,
          limit: params.limit || 10,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `[Dashboard API] 최근 시험 제출 현황 조회 실패 - Grade: ${params.grade}`,
      error
    );
    throw error;
  }
}

/**
 * 학년별 성적 분포도 조회
 * @description 특정 학년 전체 학생들의 평균 성적을 구간별로 나누어 분포도를 조회하는 함수
 *
 * 주요 기능:
 * - 전체 학생 수와 평균 점수 제공
 * - 중앙값과 표준편차 포함
 * - 점수 구간별 분포 (0-39, 40-59, 60-69, 70-79, 80-89, 90-100점)
 * - 각 구간별 학생 수와 비율 계산
 * - 통계 요약 (최고/최저 점수, 합격률, 우수율)
 *
 * @param params 요청 파라미터
 * @param params.grade 학년 (1, 2, 3)
 * @returns 학년별 성적 분포도 데이터
 * @throws {ApiError} API 요청 실패 시
 *
 * @example
 * ```typescript
 * const scoreData = await fetchScoreDistribution({ grade: 2 });
 * console.log(scoreData.averageScore); // 평균 점수
 * console.log(scoreData.distributions); // 구간별 분포
 * ```
 */
export async function fetchScoreDistribution(
  params: ScoreDistributionParams
): Promise<ScoreDistributionResponse> {
  try {
    const response = await authApiClient.get<ScoreDistributionResponse>(
      "/teacher/dashboard/score-distribution",
      {
        params: {
          grade: params.grade,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      `[Dashboard API] 성적 분포도 조회 실패 - Grade: ${params.grade}`,
      error
    );
    throw error;
  }
}
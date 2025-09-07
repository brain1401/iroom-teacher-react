/**
 * 통계 API 함수들
 * @description 선생님 대시보드 통계 관련 API 함수들
 *
 * API 기본 URL: http://localhost:3055/api/teacher/dashboard
 * 모든 응답은 ApiResponse<T> 형태로 래핑됨 (인터셉터에서 자동 처리)
 */

import { apiClient } from "@/api/client";
import type {
  UnitWrongAnswerRatesResponse,
  ScoreDistributionResponse,
  StatisticsParams,
} from "./types";

/**
 * 단원별 오답률 통계 조회
 * @description 지정된 학년의 단원별 오답률 통계를 조회
 *
 * 제공되는 정보:
 * - 전체 문제 수와 제출 수
 * - 전체 오답률
 * - 각 단원별 세부 정보 (단원명, 문제 수, 제출 수, 오답 수, 오답률, 순위)
 *
 * @param params 통계 조회 파라미터
 * @returns 단원별 오답률 통계 데이터
 *
 * @example
 * ```typescript
 * // 1학년 단원별 오답률 조회
 * const wrongAnswerStats = await fetchUnitWrongAnswerRates({ grade: 1 });
 * console.log(wrongAnswerStats.overallWrongAnswerRate); // 36.1
 * console.log(wrongAnswerStats.unitStatistics[0].unitName); // "문자의 사용"
 * ```
 */
export async function fetchUnitWrongAnswerRates(
  params: StatisticsParams,
): Promise<UnitWrongAnswerRatesResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("grade", params.grade.toString());

  try {
    const response = await apiClient.get<UnitWrongAnswerRatesResponse>(
      `/teacher/dashboard/unit-wrong-answer-rates?${queryParams.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error(`단원별 오답률 조회 실패 (학년: ${params.grade}):`, error);
    throw error;
  }
}

/**
 * 학년별 성적 분포도 조회
 * @description 지정된 학년의 성적 분포 통계를 조회
 *
 * 제공되는 정보:
 * - 총 학생 수, 평균, 표준편차, 중간값
 * - 점수 구간별 학생 수와 비율
 * - 최고점, 최저점, 합격률, 우수율
 *
 * @param params 통계 조회 파라미터
 * @returns 성적 분포도 통계 데이터
 *
 * @example
 * ```typescript
 * // 1학년 성적 분포 조회
 * const scoreDistribution = await fetchScoreDistribution({ grade: 1 });
 * console.log(scoreDistribution.averageScore); // 84.13
 * console.log(scoreDistribution.statistics.passingRate); // 100.0
 * ```
 */
export async function fetchScoreDistribution(
  params: StatisticsParams,
): Promise<ScoreDistributionResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append("grade", params.grade.toString());

  try {
    const response = await apiClient.get<ScoreDistributionResponse>(
      `/teacher/dashboard/score-distribution?${queryParams.toString()}`,
    );
    return response.data;
  } catch (error) {
    console.error(`성적 분포 조회 실패 (학년: ${params.grade}):`, error);
    throw error;
  }
}

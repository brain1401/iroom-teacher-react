import { authApiClient } from "@/api/client";
import type { AxiosRequestConfig } from "@/api/client";
import type { Grade, TestAverage } from "./types";

/**
 * 학년별 시험 평균 조회 API
 * @description 선택 학년에 대한 시험별 평균 점수 목록 반환
 * 
 * 주요 기능:
 * - httpOnly 쿠키 인증 포함(authApiClient)
 * - grade를 쿼리스트링으로 전달
 * - AbortController signal 연동(옵션)
 * 
 * @param grade 조회 학년
 * @param options Axios 옵션 (signal 등)
 * @returns 시험별 평균 목록 배열
 */
export async function getTestAveragesByGrade(
  grade: Grade,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<TestAverage[]> {
  const { data } = await authApiClient.get<TestAverage[]>(
    "/test-results/averages",
    {
      params: { grade },
      signal: options?.signal,
    },
  );
  return data ?? [];
}



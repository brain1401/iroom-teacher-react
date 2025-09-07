import { apiClient } from "@/api/client";
import type { AxiosRequestConfig } from "@/api/client";
import type { Grade, ExamAveragesData } from "./types";

/**
 * 학년별 시험 평균 조회 API
 * @description 선택 학년에 대한 시험별 평균 점수 목록 반환
 *
 * 주요 기능:
 * - httpOnly 쿠키 인증 포함(apiClient)
 * - grade를 쿼리스트링으로 전달
 * - AbortController signal 연동(옵션)
 *
 * @param grade 조회 학년
 * @param options Axios 옵션 (signal 등)
 * @returns 시험별 평균 목록 배열
 */
export async function getExamAveragesByGrade(
  grade: Grade,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<ExamAveragesData> {
  // 인터셉터가 ApiResponse<T>에서 T만 추출하여 response.data에 저장
  // 따라서 response.data를 반환해야 함
  const response = await apiClient.get<ExamAveragesData>(
    "/exam-results/averages",
    {
      params: { grade },
      signal: options?.signal,
    },
  );

  return response.data;
}

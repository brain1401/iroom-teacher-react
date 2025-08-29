import { authApiClient } from "@/api/client";
import type { AxiosRequestConfig, ApiResponse } from "@/api/client";
import type { Grade } from "@/types/grade";
import type { UnitsByGradeResponse } from "./types";

/**
 * 학년별 단원 조회 API
 * @description 선택한 학년에 해당하는 단원 목록 반환
 *
 * 주요 기능:
 * - httpOnly 쿠키 인증 필요 시 authApiClient 사용
 * - grade를 쿼리스트링으로 전달
 * - AbortController signal 연동(옵션)
 *
 * @param grade 조회 학년
 * @param options Axios 옵션 (signal 등)
 * @returns 단원 목록 배열
 */
export async function getUnitsByGrade(
  grade: Grade,
  options?: Pick<AxiosRequestConfig, "signal">,
): Promise<UnitsByGradeResponse> {
  const { data } = await authApiClient.get<UnitsByGradeResponse>(
    "/test-paper/units",
    {
      params: { grade },
      signal: options?.signal,
    },
  );
  return data ?? [];
}

import { queryOptions } from "@tanstack/react-query";
import type { Grade } from "@/types/grade";
import { getUnitsByGrade } from "./api";

/**
 * 학년별 단원 조회 쿼리 옵션
 * @description Jotai atomWithQuery 또는 useQuery에서 공유 사용
 */
export function unitsByGradeQueryOptions(grade: Grade) {
  return queryOptions({
    queryKey: ["units-by-grade", grade],
    queryFn: ({ signal }) => getUnitsByGrade(grade, { signal }),
    staleTime: 1000 * 60, // 1분
  });
}

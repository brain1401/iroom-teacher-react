import { queryOptions } from "@tanstack/react-query";
import type { Grade, TestAverage } from "./types";
import { getTestAveragesByGrade } from "./api";

/**
 * 테스트 결과 쿼리 키
 * @description 학년별 시험 평균 결과 캐시 키 정의
 */
export const testResultsKeys = {
  all: ["test-results"] as const,
  averages: (grade: Grade) => [...testResultsKeys.all, "avg", grade] as const,
} as const;

/**
 * 학년별 시험 평균 쿼리 옵션
 * @description 학년 변경 시 자동 재조회되는 옵션
 * 
 * @param grade 조회 학년
 */
export const testAveragesByGradeQueryOptions = (grade: Grade) =>
  queryOptions({
    queryKey: testResultsKeys.averages(grade),
    queryFn: ({ signal }): Promise<TestAverage[]> =>
      getTestAveragesByGrade(grade, { signal }),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });



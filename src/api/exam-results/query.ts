import { queryOptions } from "@tanstack/react-query";
import type { Grade, ExamAverage } from "./types";
import { getExamAveragesByGrade } from "./api";

/**
 * 테스트 결과 쿼리 키
 * @description 학년별 시험 평균 결과 캐시 키 정의
 */
export const examResultsKeys = {
  all: ["exam-results"] as const,
  averages: (grade: Grade) => [...examResultsKeys.all, "avg", grade] as const,
} as const;

/**
 * 학년별 시험 평균 쿼리 옵션
 * @description 학년 변경 시 자동 재조회되는 옵션
 *
 * @param grade 조회 학년
 */
export const examAveragesByGradeQueryOptions = (grade: Grade) =>
  queryOptions({
    queryKey: examResultsKeys.averages(grade),
    queryFn: ({ signal }): Promise<ExamAverage[]> =>
      getExamAveragesByGrade(grade, { signal }),
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

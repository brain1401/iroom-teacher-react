import { queryOptions } from "@tanstack/react-query";
import type { Grade } from "@/types/grade";
import { getUnitsByGrade, getExamSheetsList } from "./api";

/**
 * 학년별 단원 조회 쿼리 옵션
 * @description Jotai atomWithQuery 또는 useQuery에서 공유 사용
 */
export function unitsByGradeQueryOptions(grade: Grade) {
  return queryOptions({
    queryKey: ["units-by-grade", grade],
    queryFn: ({ signal }) => getUnitsByGrade(grade, { signal }),
  });
}

/**
 * 시험지 목록 조회를 위한 파라미터 타입
 * @description API 요청에 사용되는 필터링 및 페이징 파라미터
 */
export type ExamSheetListParams = {
  /** 현재 페이지 (0부터 시작) */
  page: number;
  /** 페이지당 항목 수 */
  size: number;
  /** 정렬 필드 */
  sort: string;
  /** 정렬 방향 */
  direction: "desc" | "asc";
  /** 학년 필터 (선택사항) */
  grade?: number;
  /** 검색 키워드 (선택사항) */
  search?: string;
};

/**
 * 시험지 목록 조회 쿼리 옵션
 * @description Jotai atomWithQuery 또는 useQuery에서 공유 사용
 *
 * 주요 기능:
 * - 필터링 파라미터 기반 시험지 목록 조회
 * - TanStack Query 캐싱 최적화
 * - SSR 지원을 위한 사전 로드 가능
 * - 검색어/필터 변경 시 자동 새로고침
 *
 * 캐싱 전략:
 * - staleTime: 5분 (서버 데이터가 자주 변경되지 않음)
 * - gcTime: 10분 (메모리 효율성과 성능의 균형)
 * - 재시도: 3회 (네트워크 불안정성 대비)
 *
 * @example
 * ```typescript
 * // 기본 사용법
 * const options = examSheetListQueryOptions({
 *   page: 0,
 *   size: 10,
 *   sort: "createdAt",
 *   direction: "DESC"
 * });
 *
 * // 필터링과 함께
 * const options = examSheetListQueryOptions({
 *   page: 0,
 *   size: 10,
 *   sort: "examName",
 *   direction: "ASC",
 *   grade: "1",
 *   search: "수학"
 * });
 * ```
 *
 * @param params 시험지 목록 조회 파라미터
 * @returns TanStack Query queryOptions 객체
 */
export function examSheetListQueryOptions(params: ExamSheetListParams) {
  return queryOptions({
    queryKey: ["exam-sheets", "list", params],
    queryFn: ({ signal }) => getExamSheetsList(params, { signal }),
    staleTime: 5 * 60 * 1000, // 5분간 fresh 상태 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 3, // 3회 재시도
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

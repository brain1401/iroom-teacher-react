/**
 * 단원 트리 TanStack Query 설정
 * @description Jotai atomWithQuery 또는 useQuery에서 공유 사용하는 쿼리 옵션들
 */

import { queryOptions } from "@tanstack/react-query";
import {
  fetchUnitsTree,
  fetchUnitsTreeWithProblems,
  fetchBasicUnitsTree,
} from "./api";
import type { Grade } from "@/types/grade";
import type { UnitsTreeQueryParams } from "@/types/units-tree";

/**
 * 단원 트리 쿼리 키 관리
 * @description 일관된 쿼리 키 생성 및 무효화를 위한 키 팩토리
 */
export const unitsTreeKeys = {
  /** 모든 단원 트리 관련 쿼리 */
  all: ["units-tree"] as const,

  /** 단원 트리 목록들 */
  lists: () => [...unitsTreeKeys.all, "list"] as const,

  /** 특정 파라미터로 필터링된 단원 트리 */
  list: (params: UnitsTreeQueryParams) =>
    [...unitsTreeKeys.lists(), params] as const,

  /** 문제 포함 단원 트리들 */
  withProblems: () => [...unitsTreeKeys.all, "with-problems"] as const,

  /** 특정 학년의 문제 포함 단원 트리 */
  withProblemsForGrade: (grade: Grade) =>
    [...unitsTreeKeys.withProblems(), grade] as const,

  /** 기본 단원 트리들 (문제 미포함) */
  basic: () => [...unitsTreeKeys.all, "basic"] as const,

  /** 특정 학년의 기본 단원 트리 */
  basicForGrade: (grade: Grade) => [...unitsTreeKeys.basic(), grade] as const,
} as const;

/**
 * 단원 트리 기본 쿼리 옵션
 * @description Jotai atomWithQuery 또는 useQuery에서 공유 사용
 *
 * 캐싱 전략:
 * - staleTime: 10분 (단원 구조는 자주 변경되지 않음)
 * - gcTime: 30분 (메모리에서 제거되기까지의 시간)
 * - retry: 3회 (네트워크 불안정 시 재시도)
 *
 * @example
 * ```typescript
 * // useQuery 훅과 함께 사용
 * const { data, isLoading, error } = useQuery(
 *   unitsTreeQueryOptions({ grade: "1", includeQuestions: false })
 * );
 *
 * // Jotai atomWithQuery와 함께 사용
 * const unitsTreeAtom = atomWithQuery((get) =>
 *   unitsTreeQueryOptions({ grade: get(selectedGradeAtom) })
 * );
 * ```
 *
 * @param params 단원 트리 조회 파라미터
 * @returns TanStack Query 옵션 객체
 */
export const unitsTreeQueryOptions = (params?: UnitsTreeQueryParams) =>
  queryOptions({
    queryKey: unitsTreeKeys.list(params || {}),
    queryFn: ({ signal }) => fetchUnitsTree(params, { signal }),
    staleTime: 10 * 60 * 1000, // 10분간 fresh 상태 유지
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

/**
 * 문제 포함 단원 트리 쿼리 옵션
 * @description 시험지 생성 시 사용하는 대용량 데이터 조회용 쿼리 옵션
 *
 * 특징:
 * - 문제 데이터 포함으로 대용량이므로 CSR 방식 권장
 * - 더 긴 캐시 시간으로 사용자 경험 최적화
 * - 로딩 상태를 통한 스피너 표시 필요
 *
 * 성능 고려사항:
 * - includeQuestions=true로 인한 대용량 응답
 * - 네트워크 지연 시 사용자 대기 시간 최소화
 * - 적절한 staleTime으로 불필요한 재요청 방지
 *
 * @example
 * ```typescript
 * // 시험지 생성 페이지에서 사용
 * const { data: unitsWithProblems, isLoading, error } = useQuery(
 *   unitsTreeWithProblemsQueryOptions("2")
 * );
 *
 * if (isLoading) {
 *   return <UnitsTreeLoadingSpinner message="문제 포함 단원 트리를 불러오는 중..." />;
 * }
 *
 * // Jotai와 함께 사용
 * const unitsWithProblemsAtom = atomWithQuery((get) => {
 *   const selectedGrade = get(selectedGradeAtom);
 *   return unitsTreeWithProblemsQueryOptions(selectedGrade);
 * });
 * ```
 *
 * @param grade 조회할 학년
 * @returns 문제 포함 단원 트리 쿼리 옵션
 */
export const unitsTreeWithProblemsQueryOptions = (grade: Grade) =>
  queryOptions({
    queryKey: unitsTreeKeys.withProblemsForGrade(grade),
    queryFn: ({ signal }) => fetchUnitsTreeWithProblems(grade, { signal }),
    staleTime: 30 * 60 * 1000, // 30분간 fresh (대용량 데이터이므로 더 오래 유지)
    gcTime: 60 * 60 * 1000, // 1시간간 캐시 유지
    retry: 1, // 대용량 데이터이므로 재시도 횟수 최소화
    retryDelay: 2000, // 고정 2초 대기
    refetchOnWindowFocus: false, // 창 포커스 시 재요청 비활성화
    refetchOnMount: false, // 컴포넌트 마운트 시 재요청 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 재요청 비활성화
  });

/**
 * 기본 단원 트리 쿼리 옵션
 * @description 문제 없이 단원 구조만 조회하는 가벼운 쿼리 옵션
 *
 * 특징:
 * - 빠른 응답으로 SSR에서 사용 가능
 * - 초기 페이지 로딩 최적화
 * - 단원 선택 UI 구성용
 *
 * 사용 사례:
 * - 페이지 초기 로딩 시 단원 구조 표시
 * - SSR에서 단원 목록 사전 로드
 * - 검색 및 필터링용 단원 목록
 *
 * @example
 * ```typescript
 * // SSR loader에서 사용
 * export const loader = async ({ context }) => {
 *   await context.queryClient.prefetchQuery(
 *     basicUnitsTreeQueryOptions("1")
 *   );
 * };
 *
 * // 컴포넌트에서 사용
 * const { data: basicUnitsTree } = useQuery(
 *   basicUnitsTreeQueryOptions(selectedGrade)
 * );
 * ```
 *
 * @param grade 조회할 학년 (선택사항)
 * @returns 기본 단원 트리 쿼리 옵션
 */
export const basicUnitsTreeQueryOptions = (grade?: Grade) =>
  queryOptions({
    queryKey: grade
      ? unitsTreeKeys.basicForGrade(grade)
      : unitsTreeKeys.basic(),
    queryFn: ({ signal }) => fetchBasicUnitsTree(grade, { signal }),
    staleTime: 20 * 60 * 1000, // 20분간 fresh (구조 정보는 더 오래 유지)
    gcTime: 2 * 60 * 60 * 1000, // 2시간간 캐시 유지 (가벼운 데이터이므로 더 오래)
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000),
  });

/**
 * 단원 트리 쿼리 무효화 유틸리티
 * @description 단원 트리 관련 캐시를 무효화하는 헬퍼 함수들
 */
export const invalidateUnitsTreeQueries = {
  /** 모든 단원 트리 쿼리 무효화 */
  all: (queryClient: any) =>
    queryClient.invalidateQueries({ queryKey: unitsTreeKeys.all }),

  /** 특정 학년의 문제 포함 단원 트리만 무효화 */
  withProblemsForGrade: (queryClient: any, grade: Grade) =>
    queryClient.invalidateQueries({
      queryKey: unitsTreeKeys.withProblemsForGrade(grade),
    }),

  /** 모든 기본 단원 트리 무효화 */
  allBasic: (queryClient: any) =>
    queryClient.invalidateQueries({ queryKey: unitsTreeKeys.basic() }),
} as const;

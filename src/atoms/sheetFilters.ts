import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomWithQuery } from "jotai-tanstack-query";
import type { Getter } from "jotai";
import { examSheetListQueryOptions } from "@/api/exam-sheet";

/**
 * 시험지 관리 페이지 필터링 상태 atoms
 * @description 시험지 목록 페이지에서 사용되는 모든 필터링 및 UI 상태 관리
 *
 * 상태 분류:
 * - 필터링: 검색어, 학년, 페이징, 정렬
 * - UI 상태: 사이드바, 선택 상태
 * - 서버 상태: atomWithQuery를 통한 시험지 목록 데이터
 */

// ========================================
// 기본 필터링 atoms
// ========================================

/**
 * 검색 키워드 atom
 * @description 시험지명, 단원명 통합 검색
 */
export const sheetSearchKeywordAtom = atom<string>("");

/**
 * 선택된 학년 atom
 * @description 학년별 시험지 필터링
 */
export const selectedSheetGradeAtom = atom<string>("");

/**
 * 현재 페이지 atom (0-based)
 * @description 페이지네이션을 위한 현재 페이지 번호
 */
export const sheetPageAtom = atom<number>(0);

/**
 * 페이지 크기 atom
 * @description 한 페이지당 표시할 시험지 수
 */
export const sheetPageSizeAtom = atomWithStorage("sheet-page-size", 10);

/**
 * 정렬 필드 atom
 * @description 정렬 기준 (createdAt, examName 등)
 */
export const sheetSortAtom = atom<string>("createdAt");

/**
 * 정렬 방향 atom
 * @description ASC 또는 DESC
 */
export const sheetSortDirectionAtom = atom<"desc" | "asc">("desc");

// ========================================
// UI 상태 atoms
// ========================================

/**
 * 필터 사이드바 표시 여부 atom
 * @description 필터 사이드바의 표시/숨김 상태
 */
export const showSheetFilterSidebarAtom = atomWithStorage(
  "sheet-show-filter-sidebar",
  true,
);

/**
 * 필터 사이드바 접힘 상태 atom
 * @description 필터 사이드바의 확장/축소 상태
 */
export const collapsedSheetFilterSidebarAtom = atomWithStorage(
  "sheet-collapsed-filter-sidebar",
  false,
);

// ========================================
// 파생 atoms (derived atoms)
// ========================================

/**
 * 시험지 목록 쿼리 파라미터 atom
 * @description 모든 필터링 상태를 결합한 API 요청 파라미터
 */
export const sheetListQueryParamsAtom = atom((get) => {
  const page = get(sheetPageAtom);
  const size = get(sheetPageSizeAtom);
  const sort = get(sheetSortAtom);
  const direction = get(sheetSortDirectionAtom);
  const grade = get(selectedSheetGradeAtom);
  const search = get(sheetSearchKeywordAtom);

  return {
    page,
    size,
    sort,
    direction,
    grade: grade ? Number(grade) : undefined,
    search: search.trim() || undefined,
  };
});

/**
 * 시험지 목록 쿼리 atom (atomWithQuery)
 * @description 서버 상태와 클라이언트 필터링 상태를 연결
 *
 * 주요 기능:
 * - 필터링 상태 변경 시 자동으로 API 재호출
 * - TanStack Query의 캐싱, 로딩, 에러 상태 제공
 * - SSR 지원을 위한 사전 로드 가능
 */
export const sheetListQueryAtom = atomWithQuery((get: Getter) => {
  const params = get(sheetListQueryParamsAtom);
  return examSheetListQueryOptions(params);
});

// ========================================
// 액션 atoms (쓰기 전용)
// ========================================

/**
 * 검색어 설정 atom (쓰기 전용)
 * @description 검색어 변경 시 페이지를 1로 리셋하는 로직 포함
 */
export const setSheetSearchKeywordAtom = atom(
  null,
  (get, set, newKeyword: string) => {
    set(sheetSearchKeywordAtom, newKeyword);
    // 검색어 변경 시 페이지를 1로 리셋
    set(sheetPageAtom, 0);
  },
);

/**
 * 학년 설정 atom (쓰기 전용)
 * @description 학년 변경 시 페이지를 1로 리셋하는 로직 포함
 */
export const setSelectedSheetGradeAtom = atom(
  null,
  (get, set, newGrade: string) => {
    set(selectedSheetGradeAtom, newGrade);
    // 학년 변경 시 페이지를 1로 리셋
    set(sheetPageAtom, 0);
  },
);

/**
 * 페이지 설정 atom (쓰기 전용)
 * @description 페이지 변경 전용
 */
export const setSheetPageAtom = atom(null, (get, set, newPage: number) => {
  set(sheetPageAtom, newPage);
});

/**
 * 정렬 설정 atom (쓰기 전용)
 * @description 정렬 변경 시 페이지를 1로 리셋하는 로직 포함
 */
export const setSheetSortAtom = atom(
  null,
  (get, set, field: string, direction?: "desc" | "asc") => {
    const currentField = get(sheetSortAtom);
    const currentDirection = get(sheetSortDirectionAtom);

    // 필드 설정
    set(sheetSortAtom, field);

    // 방향 설정 (명시적으로 전달되지 않은 경우 토글)
    if (direction) {
      set(sheetSortDirectionAtom, direction);
    } else {
      // 같은 필드 클릭 시 방향 토글, 다른 필드 클릭 시 asc로 시작
      const newDirection =
        currentField === field && currentDirection === "asc" ? "desc" : "asc";
      set(sheetSortDirectionAtom, newDirection);
    }

    // 정렬 변경 시 페이지를 1로 리셋
    set(sheetPageAtom, 0);
  },
);

// ========================================
// 편의 atoms
// ========================================

/**
 * 필터링된 시험지 목록 atom
 * @description 쿼리 결과에서 필요한 데이터만 추출
 */
export const filteredSheetListAtom = atom((get) => {
  const { data, isPending, isError, error } = get(sheetListQueryAtom);

  return {
    sheets: data?.content || [],
    totalElements: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    currentPage: data?.number || 0,
    pageSize: data?.size || 10,
    isEmpty: data?.empty || true,
    isPending,
    isError,
    error,
  };
});

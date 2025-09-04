/**
 * 시험 필터 상태 관리 원자들
 * @description 서버 API 파라미터와 일치하는 시험 필터링 상태 관리
 *
 * 주요 변경사항:
 * - 서버 API 파라미터 구조에 맞춤
 * - ExamStatus 타입 제거 (서버에 없음)
 * - SearchScope는 UI에서만 사용
 * - 페이지네이션 상태 추가
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { SearchScope, ExamListFilters } from "@/types/exam";
import { convertFiltersToServerParams } from "@/types/exam";
import type { ServerExamListParams } from "@/api/exam";

/**
 * 기본 검색 필터 원자들
 * @description UI 레벨에서 관리하는 필터 상태
 */
export const searchKeywordAtom = atom<string>("");
export const searchScopeAtom = atom<SearchScope>("all");
export const selectedGradeAtom = atom<string>(""); // "1", "2", "3", "" (전체)

/**
 * 페이지네이션 관련 원자들
 * @description 서버 API와 일치하는 페이지네이션 상태
 */
export const examPageAtom = atom<number>(0); // 서버는 0부터 시작
export const examPageSizeAtom = atomWithStorage<number>("exam-page-size", 20);
export const examSortAtom = atomWithStorage<string>("exam-sort", "createdAt,desc");

/**
 * 추가 필터 원자들
 * @description 서버 API에서 지원하는 추가 필터들
 */
export const recentExamFilterAtom = atom<boolean>(false);

/**
 * 통합 필터 상태 원자
 * @description UI 컴포넌트에서 사용하는 통합 필터 객체
 */
export const examFiltersAtom = atom<ExamListFilters>(
  (get) => ({
    searchKeyword: get(searchKeywordAtom),
    searchScope: get(searchScopeAtom),
    selectedGrade: get(selectedGradeAtom),
  }),
);

/**
 * 서버 파라미터 변환 원자
 * @description UI 필터를 서버 API 파라미터로 변환
 */
export const examServerParamsAtom = atom<ServerExamListParams>((get) => {
  const filters = get(examFiltersAtom);
  const page = get(examPageAtom);
  const size = get(examPageSizeAtom);
  const sort = get(examSortAtom);
  const recent = get(recentExamFilterAtom);

  const serverParams = convertFiltersToServerParams(filters);
  
  return {
    ...serverParams,
    page,
    size,
    sort,
    recent: recent || undefined, // false면 undefined로 변환
  };
});

/**
 * 필터 사이드바 표시 상태 원자
 */
export const showFilterSidebarAtom = atomWithStorage<boolean>(
  "exam-show-filter-sidebar",
  true,
);

/**
 * 필터 사이드바 축소 상태 원자
 */
export const collapsedFilterSidebarAtom = atomWithStorage<boolean>(
  "exam-collapsed-filter-sidebar",
  false,
);

/**
 * 활성화된 필터 개수를 계산하는 파생 원자
 * @description 서버 파라미터 기준으로 활성 필터 계산
 */
export const activeFiltersCountAtom = atom((get) => {
  const searchKeyword = get(searchKeywordAtom);
  const selectedGrade = get(selectedGradeAtom);
  const recent = get(recentExamFilterAtom);

  let count = 0;

  // 검색어가 있으면 +1
  if (searchKeyword.trim()) count += 1;

  // 학년 필터가 있으면 +1
  if (selectedGrade && selectedGrade !== "") count += 1;

  // 최근 필터가 활성화되면 +1
  if (recent) count += 1;

  return count;
});

/**
 * 모든 필터를 초기화하는 액션 원자
 * @description 서버 파라미터 기준으로 필터 초기화
 */
export const resetAllFiltersAtom = atom(null, (_get, set) => {
  set(searchKeywordAtom, "");
  set(searchScopeAtom, "all");
  set(selectedGradeAtom, "");
  set(examPageAtom, 0);
  set(recentExamFilterAtom, false);
  // 페이지 크기와 정렬은 유지
});

/**
 * 페이지 리셋 액션 원자
 * @description 필터 변경 시 페이지를 0으로 리셋
 */
export const resetPageAtom = atom(null, (_get, set) => {
  set(examPageAtom, 0);
});

/**
 * 학년 변경 액션 원자
 * @description 학년 변경 시 페이지도 함께 리셋
 */
export const setSelectedGradeAtom = atom(null, (_get, set, grade: string) => {
  set(selectedGradeAtom, grade);
  set(examPageAtom, 0); // 페이지 리셋
});

/**
 * 검색어 변경 액션 원자
 * @description 검색어 변경 시 페이지도 함께 리셋
 */
export const setSearchKeywordAtom = atom(null, (_get, set, keyword: string) => {
  set(searchKeywordAtom, keyword);
  set(examPageAtom, 0); // 페이지 리셋
});

/**
 * 페이지 변경 액션 원자
 * @description 안전한 페이지 변경 (음수 방지)
 */
export const setExamPageAtom = atom(null, (_get, set, page: number) => {
  set(examPageAtom, Math.max(0, page));
});

/**
 * 다음 페이지 액션 원자
 * @description 페이지를 1 증가 (최대값 체크는 컴포넌트에서)
 */
export const nextPageAtom = atom(null, (get, set) => {
  const currentPage = get(examPageAtom);
  set(examPageAtom, currentPage + 1);
});

/**
 * 이전 페이지 액션 원자
 * @description 페이지를 1 감소 (최소 0)
 */
export const prevPageAtom = atom(null, (get, set) => {
  const currentPage = get(examPageAtom);
  set(examPageAtom, Math.max(0, currentPage - 1));
});

/**
 * 필터 요약 정보를 위한 파생 원자
 * @description 현재 적용된 필터의 요약 정보
 */
export const filterSummaryAtom = atom((get) => {
  const searchKeyword = get(searchKeywordAtom);
  const selectedGrade = get(selectedGradeAtom);
  const recent = get(recentExamFilterAtom);
  const page = get(examPageAtom);
  const size = get(examPageSizeAtom);

  return {
    hasSearchKeyword: Boolean(searchKeyword.trim()),
    hasGradeFilter: Boolean(selectedGrade),
    hasRecentFilter: recent,
    currentPage: page + 1, // UI에서는 1부터 표시
    pageSize: size,
    searchKeyword: searchKeyword.trim(),
    selectedGradeLabel: selectedGrade ? `${selectedGrade}학년` : "전체",
  };
});

/**
 * 추가 필터링 원자들 (고급 필터링 기능용)
 * @description 미래 확장을 위한 추가 필터링 상태들
 */

/**
 * 시험 상태 필터 원자
 * @description 시험의 승인 상태로 필터링하는 원자
 */
export const statusFiltersAtom = atom<string[]>([]);

/**
 * 날짜 범위 필터 원자
 * @description 생성일/수정일 범위로 필터링하는 원자
 */
export const dateRangeFiltersAtom = atom<{
  createdFrom?: Date;
  createdTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;
}>({});

/**
 * 문항 수 범위 필터 원자
 * @description 시험의 문항 수 범위로 필터링하는 원자
 */
export const questionCountRangeAtom = atom<{ min: number; max: number }>({
  min: 10,
  max: 40,
});

/**
 * 참여율 범위 필터 원자
 * @description 시험의 참여율 범위로 필터링하는 원자
 */
export const participationRateRangeAtom = atom<{ min: number; max: number }>({
  min: 0,
  max: 100,
});

/**
 * 단원 필터 원자
 * @description 단원별로 필터링하는 원자
 */
export const unitFiltersAtom = atom<string[]>([]);

/**
 * 시험 유형 필터 원자
 * @description 시험 유형별로 필터링하는 원자
 */
export const examTypeFiltersAtom = atom<string[]>([]);

/**
 * 고급 검색 옵션 원자
 * @description 대소문자 구분, 정확한 일치 등의 검색 옵션
 */
export const advancedSearchOptionsAtom = atom<{
  caseSensitive: boolean;
  exactMatch: boolean;
}>({
  caseSensitive: false,
  exactMatch: false,
});

/**
 * 필터 프리셋 원자
 * @description 자주 사용하는 필터 조합을 저장하는 원자
 */
export const filterPresetsAtom = atom<Record<string, {
  name: string;
  filters: {
    statusFilters: string[];
    questionCountRange: { min: number; max: number };
    participationRateRange: { min: number; max: number };
  };
}>>({
  recent: {
    name: "최근 시험",
    filters: {
      statusFilters: ["승인완료"],
      questionCountRange: { min: 10, max: 40 },
      participationRateRange: { min: 0, max: 100 },
    },
  },
  highPerformance: {
    name: "고참여율 시험",
    filters: {
      statusFilters: ["승인완료"],
      questionCountRange: { min: 15, max: 30 },
      participationRateRange: { min: 80, max: 100 },
    },
  },
});

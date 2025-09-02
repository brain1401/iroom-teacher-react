/**
 * 시험 필터 상태 관리 원자들
 * @description 시험 목록의 고급 필터링을 위한 Jotai 원자 정의
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ExamStatus, ExamLevel, SearchScope } from "@/types/exam";

/**
 * 기본 검색 필터 원자들
 */
export const searchKeywordAtom = atom<string>("");
export const searchScopeAtom = atom<SearchScope>("all");

/**
 * 상태 필터 원자 (다중 선택)
 */
export const statusFiltersAtom = atomWithStorage<ExamStatus[]>("exam-status-filters", [
  "승인완료",
  "승인거부",
]);

/**
 * 난이도 필터 원자 (다중 선택)
 */
export const difficultyFiltersAtom = atomWithStorage<ExamLevel[]>("exam-difficulty-filters", [
  "기초",
  "보통",
  "심화",
]);

/**
 * 날짜 범위 필터 원자들
 */
export const dateRangeFiltersAtom = atom<{
  createdFrom?: Date;
  createdTo?: Date;
  updatedFrom?: Date;
  updatedTo?: Date;
}>({});

/**
 * 문항 수 범위 필터 원자
 */
export const questionCountRangeAtom = atomWithStorage<{
  min: number;
  max: number;
}>("exam-question-count-range", {
  min: 15,
  max: 35,
});

/**
 * 참여율 범위 필터 원자
 */
export const participationRateRangeAtom = atomWithStorage<{
  min: number;
  max: number;
}>("exam-participation-range", {
  min: 0,
  max: 100,
});

/**
 * 단원 필터 원자 (다중 선택)
 */
export const unitFiltersAtom = atomWithStorage<string[]>("exam-unit-filters", []);

/**
 * 시험 유형 필터 원자 (다중 선택)
 */
export const examTypeFiltersAtom = atomWithStorage<string[]>("exam-type-filters", []);

/**
 * 고급 검색 옵션 원자
 */
export const advancedSearchOptionsAtom = atom<{
  caseSensitive: boolean;
  exactMatch: boolean;
  includeContent: boolean;
}>({
  caseSensitive: false,
  exactMatch: false,
  includeContent: true,
});

/**
 * 필터 사이드바 표시 상태 원자
 */
export const showFilterSidebarAtom = atomWithStorage<boolean>("exam-show-filter-sidebar", true);

/**
 * 필터 사이드바 축소 상태 원자
 */
export const collapsedFilterSidebarAtom = atomWithStorage<boolean>("exam-collapsed-filter-sidebar", false);

/**
 * 활성화된 필터 개수를 계산하는 파생 원자
 */
export const activeFiltersCountAtom = atom((get) => {
  const statusFilters = get(statusFiltersAtom);
  const difficultyFilters = get(difficultyFiltersAtom);
  const dateFilters = get(dateRangeFiltersAtom);
  const questionRange = get(questionCountRangeAtom);
  const participationRange = get(participationRateRangeAtom);
  const unitFilters = get(unitFiltersAtom);
  const examTypeFilters = get(examTypeFiltersAtom);
  const searchKeyword = get(searchKeywordAtom);

  let count = 0;

  // 검색어가 있으면 +1
  if (searchKeyword.trim()) count += 1;

  // 상태 필터가 전체가 아니면 +1
  if (statusFilters.length < 3) count += 1;

  // 난이도 필터가 전체가 아니면 +1
  if (difficultyFilters.length < 3) count += 1;

  // 날짜 필터가 있으면 +1
  if (Object.values(dateFilters).some(Boolean)) count += 1;

  // 문항 수 범위가 기본값(15-35)이 아니면 +1
  if (questionRange.min !== 15 || questionRange.max !== 35) count += 1;

  // 참여율 범위가 기본값(0-100)이 아니면 +1
  if (participationRange.min !== 0 || participationRange.max !== 100) count += 1;

  // 단원 필터가 있으면 +1
  if (unitFilters.length > 0) count += 1;

  // 시험 유형 필터가 있으면 +1
  if (examTypeFilters.length > 0) count += 1;

  return count;
});

/**
 * 모든 필터를 초기화하는 액션 원자
 */
export const resetAllFiltersAtom = atom(
  null,
  (get, set) => {
    set(searchKeywordAtom, "");
    set(searchScopeAtom, "all");
    set(statusFiltersAtom, ["승인완료", "승인거부"]);
    set(difficultyFiltersAtom, ["기초", "보통", "심화"]);
    set(dateRangeFiltersAtom, {});
    set(questionCountRangeAtom, { min: 15, max: 35 });
    set(participationRateRangeAtom, { min: 0, max: 100 });
    set(unitFiltersAtom, []);
    set(examTypeFiltersAtom, []);
    set(advancedSearchOptionsAtom, {
      caseSensitive: false,
      exactMatch: false,
      includeContent: true,
    });
  }
);

/**
 * 필터 프리셋 원자들
 */
export const filterPresetsAtom = atomWithStorage<{
  [key: string]: {
    name: string;
    filters: {
      statusFilters: ExamStatus[];
      difficultyFilters: ExamLevel[];
      questionCountRange: { min: number; max: number };
      participationRateRange: { min: number; max: number };
    };
  };
}>("exam-filter-presets", {
  "high-participation": {
    name: "높은 참여율",
    filters: {
      statusFilters: ["승인완료"],
      difficultyFilters: ["기초", "보통", "심화"],
      questionCountRange: { min: 15, max: 35 },
      participationRateRange: { min: 80, max: 100 },
    },
  },

  "advanced-level": {
    name: "심화 문제",
    filters: {
      statusFilters: ["승인완료"],
      difficultyFilters: ["심화"],
      questionCountRange: { min: 20, max: 35 },
      participationRateRange: { min: 0, max: 100 },
    },
  },
});
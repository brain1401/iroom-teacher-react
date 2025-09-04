/**
 * 시험 상세 페이지 상태 관리 원자들
 * @description 시험 상세 페이지에서 사용되는 필터링 및 UI 상태 관리
 *
 * 주요 기능:
 * - 학생 제출 목록 페이지네이션
 * - 제출 데이터 정렬
 * - 사이드바 UI 상태 관리
 * - URL과 상태 동기화 (변경된 값만 URL 반영)
 */

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { atomWithQuery } from "jotai-tanstack-query";
import { skipToken } from "@tanstack/react-query";
import {
  examDetailQueryOptions,
  submissionStatusQueryOptions,
} from "@/api/exam/query";
import logger from "@/utils/logger";

/**
 * 시험 상세 페이지 기본값 상수
 */
export const EXAM_DETAIL_DEFAULTS = {
  page: 0,
  size: 20,
  sort: "createdAt,desc",
  showSidebar: true,
  collapsedSidebar: false,
} as const;

/**
 * 시험명 검색 원자 (선택적)
 * @description 특정 시험명으로 필터링할 때 사용
 */
export const examNameFilterAtom = atom<string>("");

/**
 * 페이지네이션 원자들
 * @description 학생 제출 목록의 페이지네이션 상태
 */
export const examDetailPageAtom = atom<number>(EXAM_DETAIL_DEFAULTS.page);
export const examDetailPageSizeAtom = atomWithStorage<number>(
  "exam-detail-page-size",
  EXAM_DETAIL_DEFAULTS.size,
);

/**
 * 정렬 원자
 * @description 학생 제출 데이터의 정렬 방식
 */
export const examDetailSortAtom = atomWithStorage<string>(
  "exam-detail-sort",
  EXAM_DETAIL_DEFAULTS.sort,
);

/**
 * 사이드바 표시 상태 원자
 * @description 필터 사이드바의 표시/숨김 상태
 */
export const examDetailShowSidebarAtom = atomWithStorage<boolean>(
  "exam-detail-show-sidebar",
  EXAM_DETAIL_DEFAULTS.showSidebar,
);

/**
 * 사이드바 축소 상태 원자
 * @description 필터 사이드바의 축소/확장 상태
 */
export const examDetailCollapsedSidebarAtom = atomWithStorage<boolean>(
  "exam-detail-collapsed-sidebar",
  EXAM_DETAIL_DEFAULTS.collapsedSidebar,
);

/**
 * 시험 ID 원자
 * @description 현재 조회중인 시험의 ID
 */
export const examDetailIdAtom = atom<string>("");

/**
 * 통합 상태 원자
 * @description 모든 시험 상세 페이지 상태를 통합한 읽기 전용 원자
 */
export const examDetailStateAtom = atom((get) => ({
  examId: get(examDetailIdAtom),
  examName: get(examNameFilterAtom),
  page: get(examDetailPageAtom),
  size: get(examDetailPageSizeAtom),
  sort: get(examDetailSortAtom),
  showSidebar: get(examDetailShowSidebarAtom),
  collapsedSidebar: get(examDetailCollapsedSidebarAtom),
}));

/**
 * 시험 상세 데이터 쿼리 원자
 * @description examId atom을 기반으로 시험 상세 정보를 가져오는 atomWithQuery
 *
 * 주요 기능:
 * - examId가 없으면 쿼리 비활성화
 * - atom 기반 쿼리 키 관리로 상태 동기화
 * - 에러 상태 및 로딩 상태 자동 관리
 */
export const examDetailQueryAtom = atomWithQuery((get) => {
  const examId = get(examDetailIdAtom);

  // examId가 없거나 빈 문자열이면 쿼리 비활성화
  if (!examId || examId.trim() === "") {
    return {
      queryKey: ["exam", "detail", "disabled"] as const,
      queryFn: skipToken,
    };
  }

  return examDetailQueryOptions(examId);
});

/**
 * 시험 제출 현황 쿼리 원자
 * @description examId atom을 기반으로 제출 현황을 가져오는 atomWithQuery
 *
 * 주요 기능:
 * - examId가 없으면 쿼리 비활성화
 * - atom 기반 쿼리 키 관리로 상태 동기화
 * - 실시간 제출 현황 업데이트 지원
 */
export const submissionStatusQueryAtom = atomWithQuery((get) => {
  const examId = get(examDetailIdAtom);

  logger.info(`atomWithQuery 안에서 examId : ${examId}`);

  // examId가 없거나 빈 문자열이면 쿼리 비활성화
  if (!examId || examId.trim() === "") {
    return {
      queryKey: ["exam", "submission", "disabled"] as const,
      queryFn: skipToken,
    };
  }

  return submissionStatusQueryOptions(examId);
});

/**
 * 미래 확장용: 학생 제출 목록 쿼리 원자
 * @description examId와 필터링 atoms을 결합한 atomWithQuery 패턴 예시
 *
 * 이 atom은 향후 학생 제출 목록 API가 추가될 때 사용할 수 있는 패턴을 보여줍니다.
 * 현재는 비활성화 상태로 두고, API가 준비되면 활성화하여 사용할 수 있습니다.
 *
 * 예상 API: GET /exams/{examId}/submissions?page=0&size=20&sort=createdAt,desc&search=studentName
 */
export const studentSubmissionsQueryAtom = atomWithQuery((get) => {
  const examId = get(examDetailIdAtom);
  const page = get(examDetailPageAtom);
  const size = get(examDetailPageSizeAtom);
  const sort = get(examDetailSortAtom);
  const examName = get(examNameFilterAtom);

  // 모든 필터링 상태를 포함한 쿼리 키 생성 (일관된 구조 유지)
  const filters = {
    examId: examId || "disabled", // examId가 없으면 "disabled"로 설정
    page,
    size,
    sort,
    search: examName.trim() || undefined,
  };

  return {
    queryKey: ["exam", "submissions", filters] as const,
    queryFn: skipToken, // 현재는 API가 없으므로 비활성화
  };
});

/**
 * 시험 상세 페이지 전체 데이터 원자
 * @description 시험 상세와 제출 현황을 통합한 파생 원자
 */
export const examDetailPageDataAtom = atom((get) => {
  const examDetail = get(examDetailQueryAtom);
  const submissionStatus = get(submissionStatusQueryAtom);
  const filterState = get(examDetailStateAtom);

  return {
    examDetail,
    submissionStatus,
    filterState,
    // 로딩 상태 통합
    isLoading: examDetail.isPending || submissionStatus.isPending,
    // 에러 상태 통합
    hasError: examDetail.isError || submissionStatus.isError,
    error: examDetail.error || submissionStatus.error,
  };
});

/**
 * URL에 반영할 쿼리 파라미터 원자
 * @description 기본값과 다른 값들만 URL에 표시하기 위한 파생 원자
 */
export const examDetailUrlParamsAtom = atom((get) => {
  const state = get(examDetailStateAtom);
  const urlParams: Record<string, string | number | boolean> = {};

  // 기본값과 다른 값들만 URL 파라미터로 추가
  if (state.examName.trim() !== "") {
    urlParams.examName = state.examName;
  }

  if (state.page !== EXAM_DETAIL_DEFAULTS.page) {
    urlParams.page = state.page;
  }

  if (state.size !== EXAM_DETAIL_DEFAULTS.size) {
    urlParams.size = state.size;
  }

  if (state.sort !== EXAM_DETAIL_DEFAULTS.sort) {
    urlParams.sort = state.sort;
  }

  if (state.showSidebar !== EXAM_DETAIL_DEFAULTS.showSidebar) {
    urlParams.showSidebar = state.showSidebar;
  }

  if (state.collapsedSidebar !== EXAM_DETAIL_DEFAULTS.collapsedSidebar) {
    urlParams.collapsedSidebar = state.collapsedSidebar;
  }

  return urlParams;
});

/**
 * 액션 원자들
 * @description 상태를 안전하게 변경하는 액션들
 */

/**
 * 시험명 필터 설정 액션
 */
export const setExamNameFilterAtom = atom(
  null,
  (_get, set, examName: string) => {
    set(examNameFilterAtom, examName);
    set(examDetailPageAtom, 0); // 검색 시 페이지 리셋
  },
);

/**
 * 페이지 변경 액션
 */
export const setExamDetailPageAtom = atom(null, (_get, set, page: number) => {
  set(examDetailPageAtom, Math.max(0, page));
});

/**
 * 페이지 크기 변경 액션
 */
export const setExamDetailPageSizeAtom = atom(
  null,
  (_get, set, size: number) => {
    set(examDetailPageSizeAtom, Math.max(1, size));
    set(examDetailPageAtom, 0); // 페이지 크기 변경 시 페이지 리셋
  },
);

/**
 * 정렬 변경 액션
 */
export const setExamDetailSortAtom = atom(null, (_get, set, sort: string) => {
  set(examDetailSortAtom, sort);
  set(examDetailPageAtom, 0); // 정렬 변경 시 페이지 리셋
});

/**
 * 사이드바 표시 토글 액션
 */
export const toggleExamDetailSidebarAtom = atom(null, (get, set) => {
  const current = get(examDetailShowSidebarAtom);
  set(examDetailShowSidebarAtom, !current);
});

/**
 * 사이드바 축소 토글 액션
 */
export const toggleExamDetailCollapsedSidebarAtom = atom(null, (get, set) => {
  const current = get(examDetailCollapsedSidebarAtom);
  set(examDetailCollapsedSidebarAtom, !current);
});

/**
 * 모든 필터 리셋 액션
 */
export const resetExamDetailFiltersAtom = atom(null, (_get, set) => {
  set(examNameFilterAtom, "");
  set(examDetailPageAtom, EXAM_DETAIL_DEFAULTS.page);
  // pageSize와 sort는 사용자 설정이므로 유지
  // 사이드바 상태도 유지
});

/**
 * URL 상태로 atom 초기화 액션
 * @description URL 쿼리 파라미터로부터 atom 상태를 초기화
 */
export const initializeFromUrlAtom = atom(
  null,
  (
    _get,
    set,
    urlParams: {
      examName?: string;
      page?: number;
      size?: number;
      sort?: string;
      showSidebar?: boolean;
      collapsedSidebar?: boolean;
    },
  ) => {
    // URL에 값이 있으면 해당 값으로, 없으면 기본값으로 설정
    set(examNameFilterAtom, urlParams.examName ?? "");
    set(examDetailPageAtom, urlParams.page ?? EXAM_DETAIL_DEFAULTS.page);
    set(examDetailPageSizeAtom, urlParams.size ?? EXAM_DETAIL_DEFAULTS.size);
    set(examDetailSortAtom, urlParams.sort ?? EXAM_DETAIL_DEFAULTS.sort);
    set(
      examDetailShowSidebarAtom,
      urlParams.showSidebar ?? EXAM_DETAIL_DEFAULTS.showSidebar,
    );
    set(
      examDetailCollapsedSidebarAtom,
      urlParams.collapsedSidebar ?? EXAM_DETAIL_DEFAULTS.collapsedSidebar,
    );
  },
);

/**
 * 다음 페이지 액션
 */
export const nextExamDetailPageAtom = atom(null, (get, set) => {
  const currentPage = get(examDetailPageAtom);
  set(examDetailPageAtom, currentPage + 1);
});

/**
 * 이전 페이지 액션
 */
export const prevExamDetailPageAtom = atom(null, (get, set) => {
  const currentPage = get(examDetailPageAtom);
  set(examDetailPageAtom, Math.max(0, currentPage - 1));
});

/**
 * 상태 요약 정보 원자
 * @description 디버깅 및 상태 표시용 요약 정보
 */
export const examDetailSummaryAtom = atom((get) => {
  const state = get(examDetailStateAtom);
  const urlParams = get(examDetailUrlParamsAtom);

  return {
    hasFilter: state.examName.trim() !== "",
    currentPage: state.page + 1, // UI에서는 1부터 표시
    totalUrlParams: Object.keys(urlParams).length,
    isDefaultState: Object.keys(urlParams).length === 0,
  };
});

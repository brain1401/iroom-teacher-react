/**
 * 시험 필터 상태와 URL 파라미터 동기화 훅
 * @description Jotai atom 상태 변경을 URL 파라미터로 동기화하여 SSR 최적화
 *
 * 주요 기능:
 * - 필터 상태 변경 시 URL 자동 업데이트
 * - 페이지네이션 상태 URL 동기화
 * - 북마크 가능한 URL 생성
 * - 브라우저 뒤로가기/앞으로가기 지원
 * - SSR 하이드레이션과 완전 호환
 */

import { useEffect, useCallback } from "react";
import { useRouter } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import {
  searchKeywordAtom,
  selectedGradeAtom,
  examPageAtom,
  examPageSizeAtom,
  examSortAtom,
  recentExamFilterAtom,
  showFilterSidebarAtom,
  collapsedFilterSidebarAtom,
} from "@/atoms/examFilters";

/**
 * 시험 필터 상태를 URL과 동기화하는 훅
 * @description 상태 변경 시 URL 파라미터를 자동으로 업데이트
 *
 * 작동 원리:
 * 1. Jotai atom 상태 변경 감지
 * 2. 변경된 상태를 URL 검색 파라미터로 변환
 * 3. TanStack Router의 navigate로 URL 업데이트 (히스토리 교체)
 * 4. SSR에서 동일한 파라미터로 데이터 사전 로드 가능
 *
 * @param options 동기화 옵션
 * @param options.debounceMs 디바운스 지연 시간 (기본: 300ms)
 * @param options.enabled 동기화 활성화 여부 (기본: true)
 */
export function useExamUrlSync(options: {
  debounceMs?: number;
  enabled?: boolean;
} = {}) {
  const { debounceMs = 300, enabled = true } = options;
  const router = useRouter();

  // 현재 필터 상태 구독
  const searchKeyword = useAtomValue(searchKeywordAtom);
  const selectedGrade = useAtomValue(selectedGradeAtom);
  const examPage = useAtomValue(examPageAtom);
  const examPageSize = useAtomValue(examPageSizeAtom);
  const examSort = useAtomValue(examSortAtom);
  const recentExamFilter = useAtomValue(recentExamFilterAtom);
  const showFilterSidebar = useAtomValue(showFilterSidebarAtom);
  const collapsedFilterSidebar = useAtomValue(collapsedFilterSidebarAtom);

  /**
   * URL 파라미터 업데이트 함수
   * @description 현재 필터 상태를 URL에 반영 (디바운스 적용)
   */
  const updateUrlParams = useCallback(() => {
    if (!enabled) return;

    // 현재 필터 상태를 URL 파라미터 객체로 변환
    const searchParams: Record<string, any> = {};

    // 검색어가 있으면 추가
    if (searchKeyword.trim()) {
      searchParams.search = searchKeyword.trim();
    }

    // 학년 필터가 있으면 추가
    if (selectedGrade && selectedGrade !== "") {
      searchParams.grade = selectedGrade;
    }

    // 페이지가 0이 아니면 추가
    if (examPage > 0) {
      searchParams.page = examPage;
    }

    // 페이지 크기가 기본값(20)이 아니면 추가
    if (examPageSize !== 20) {
      searchParams.size = examPageSize;
    }

    // 정렬이 기본값이 아니면 추가
    if (examSort !== "createdAt,desc") {
      searchParams.sort = examSort;
    }

    // 최근 필터가 활성화되어 있으면 추가
    if (recentExamFilter) {
      searchParams.recent = true;
    }

    // 사이드바 표시 상태가 기본값(true)이 아니면 추가
    if (!showFilterSidebar) {
      searchParams.showSidebar = false;
    }

    // 사이드바 축소 상태가 기본값(false)이 아니면 추가
    if (collapsedFilterSidebar) {
      searchParams.collapsedSidebar = true;
    }

    // 현재 URL의 다른 파라미터 유지 (selectedExam, examName 등)
    const currentSearch = router.latestLocation.search as any;
    const mergedParams = {
      ...currentSearch,
      ...searchParams,
    };

    // 빈 값들 제거
    Object.keys(mergedParams).forEach(key => {
      if (mergedParams[key] === undefined || mergedParams[key] === null || mergedParams[key] === "") {
        delete mergedParams[key];
      }
    });

    // URL 업데이트 (히스토리 교체, 페이지 리로드 없음)
    router.navigate({
      search: mergedParams,
      replace: true, // 브라우저 히스토리 스택을 증가시키지 않음
    }).catch((error) => {
      console.warn("URL 파라미터 업데이트 실패:", error);
    });
  }, [
    enabled,
    searchKeyword,
    selectedGrade,
    examPage,
    examPageSize,
    examSort,
    recentExamFilter,
    showFilterSidebar,
    collapsedFilterSidebar,
    router,
  ]);

  // 디바운스된 URL 업데이트
  useEffect(() => {
    const timer = setTimeout(updateUrlParams, debounceMs);
    return () => clearTimeout(timer);
  }, [updateUrlParams, debounceMs]);

  return {
    /**
     * 수동 URL 동기화 트리거
     * @description 필요한 경우 즉시 URL을 업데이트
     */
    syncUrl: updateUrlParams,

    /**
     * 현재 필터 상태 요약
     * @description 디버깅이나 UI에서 사용할 수 있는 필터 상태 정보
     */
    currentState: {
      searchKeyword: searchKeyword.trim(),
      selectedGrade,
      examPage,
      examPageSize,
      examSort,
      recentExamFilter,
      showFilterSidebar,
      collapsedFilterSidebar,
      hasFilters: Boolean(
        searchKeyword.trim() || 
        selectedGrade || 
        examPage > 0 || 
        recentExamFilter
      ),
    },
  };
}

/**
 * 시험 상세 페이지 URL 생성 헬퍼
 * @description 현재 필터 상태를 유지하면서 시험 상세 페이지로 이동하는 URL 생성
 */
export function useExamDetailUrl() {
  const router = useRouter();

  return useCallback((examId: string, examName?: string) => {
    const currentSearch = router.latestLocation.search as any;
    
    return {
      to: "/main/exam/manage/$examId" as const,
      params: { examId },
      search: {
        ...currentSearch,
        examName: examName || undefined,
      },
    };
  }, [router]);
}
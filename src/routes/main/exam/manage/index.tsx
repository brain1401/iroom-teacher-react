import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useLayoutEffect, useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ExamCreationTab } from "@/components/exam";
import { ExamSheetListTab } from "@/components/sheet";
import { isShowHeaderAtom } from "@/atoms/ui";
import {
  searchKeywordAtom,
  selectedGradeAtom,
  examPageAtom,
  examPageSizeAtom,
  examSortAtom,
  recentExamFilterAtom,
  showFilterSidebarAtom,
  collapsedFilterSidebarAtom,
  setSearchKeywordAtom,
  setSelectedGradeAtom,
  setExamPageAtom,
} from "@/atoms/examFilters";
import { examListQueryOptions } from "@/api/exam";

/**
 * 시험 관리 페이지 검색 파라미터 스키마
 * @description Zod 스키마를 사용한 타입 안전한 검색 파라미터 검증
 * 
 * 포함 파라미터:
 * - 페이징: page, size
 * - 정렬: sort
 * - 필터링: search, grade, recent
 * - UI 상태: showSidebar, collapsedSidebar
 * - 네비게이션: selectedExam, examName
 */
const examManageSearchSchema = z.object({
  // 기본 필터링 파라미터들 - 시험 목록 페이지 전용
  page: z.number().int().min(0).optional(),
  size: z.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  search: z.string().optional(),
  grade: z.string().optional(),
  recent: z.boolean().optional(),
  
  // UI 상태 파라미터들
  showSidebar: z.boolean().optional(),
  collapsedSidebar: z.boolean().optional(),
  
  // 네비게이션 파라미터들 (부모 route.tsx에서 상속)
  selectedExam: z.string().optional(),
  examName: z.string().optional(),
});

export const Route = createFileRoute("/main/exam/manage/")({
  validateSearch: zodValidator(examManageSearchSchema),
  // 로더에서 사용할 의존성 추출
  loaderDeps: ({ search }) => ({
    page: search.page || 0,
    size: search.size || 20,
    sort: search.sort || "createdAt,desc",
    search: search.search || undefined,
    grade: search.grade ? parseInt(search.grade, 10) : undefined,
    recent: search.recent || undefined,
  }),
  // SSR loader for exam list data
  loader: async ({ context, deps }) => {
    const { queryClient } = context;
    
    // URL 파라미터를 서버 API 파라미터로 변환
    const serverParams = deps;

    try {
      // 서버에서 시험 목록 데이터 사전 로드
      const data = await queryClient.ensureQueryData(
        examListQueryOptions(serverParams)
      );
      
      return {
        examListData: data,
        serverParams,
        searchParams: deps,
        success: true,
        error: null,
      };
    } catch (error) {
      console.error("시험 목록 데이터 사전 로드 실패:", error);
      
      return {
        examListData: null,
        serverParams,
        searchParams: deps,
        success: false,
        error: error instanceof Error ? error.message : "데이터 로딩 실패",
      };
    }
  },
  component: RouteComponent,
});;

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  
  // 부모 route.tsx에서 네비게이션 파라미터 가져오기
  const { selectedExam, examName } = Route.useSearch();
  
  // 현재 route의 필터링 파라미터 가져오기
  const searchParams = Route.useSearch();
  
  // SSR 하이드레이션 - URL 파라미터를 Jotai atoms에 동기화
  useHydrateAtoms([
    [searchKeywordAtom, searchParams.search || ""],
    [selectedGradeAtom, searchParams.grade ? String(searchParams.grade) : ""],
    [examPageAtom, searchParams.page || 0],
    [examPageSizeAtom, searchParams.size || 20],
    [examSortAtom, searchParams.sort || "createdAt,desc"],
    [recentExamFilterAtom, searchParams.recent || false],
    [showFilterSidebarAtom, searchParams.showSidebar !== undefined ? searchParams.showSidebar : true],
    [collapsedFilterSidebarAtom, searchParams.collapsedSidebar !== undefined ? searchParams.collapsedSidebar : false],
  ]);

  // URL 파라미터 변경 시 atom 상태 동기화
  const setSearchKeyword = useSetAtom(setSearchKeywordAtom);
  const setSelectedGrade = useSetAtom(setSelectedGradeAtom);
  const setExamPage = useSetAtom(setExamPageAtom);
  const setExamPageSize = useSetAtom(examPageSizeAtom);
  const setExamSort = useSetAtom(examSortAtom);
  const setRecentFilter = useSetAtom(recentExamFilterAtom);
  const setShowSidebar = useSetAtom(showFilterSidebarAtom);
  const setCollapsedSidebar = useSetAtom(collapsedFilterSidebarAtom);

  // URL 파라미터 변경 시 atom 동기화
  useEffect(() => {
    if (searchParams.search !== undefined) {
      setSearchKeyword(searchParams.search);
    }
  }, [searchParams.search, setSearchKeyword]);

  useEffect(() => {
    if (searchParams.grade !== undefined) {
      setSelectedGrade(searchParams.grade);
    }
  }, [searchParams.grade, setSelectedGrade]);

  useEffect(() => {
    if (searchParams.page !== undefined) {
      setExamPage(searchParams.page);
    }
  }, [searchParams.page, setExamPage]);

  useEffect(() => {
    if (searchParams.size !== undefined) {
      setExamPageSize(searchParams.size);
    }
  }, [searchParams.size, setExamPageSize]);

  useEffect(() => {
    if (searchParams.sort !== undefined) {
      setExamSort(searchParams.sort);
    }
  }, [searchParams.sort, setExamSort]);

  useEffect(() => {
    if (searchParams.recent !== undefined) {
      setRecentFilter(searchParams.recent);
    }
  }, [searchParams.recent, setRecentFilter]);

  useEffect(() => {
    if (searchParams.showSidebar !== undefined) {
      setShowSidebar(searchParams.showSidebar);
    }
  }, [searchParams.showSidebar, setShowSidebar]);

  useEffect(() => {
    if (searchParams.collapsedSidebar !== undefined) {
      setCollapsedSidebar(searchParams.collapsedSidebar);
    }
  }, [searchParams.collapsedSidebar, setCollapsedSidebar]);

  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState<string>("list");

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  /**
   * 부모 컴포넌트의 탭 상태 동기화
   */
  useEffect(() => {
    // 부모 컴포넌트의 탭 상태를 동기화
    const parentElement = document.querySelector("[data-state]");
    if (parentElement) {
      const currentTab = parentElement.getAttribute("data-state");
      if (currentTab && currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    }
  }, [activeTab]);

  /**
   * 시험지 페이지 컴포넌트
   * @description 탭 전환 및 하단 밑줄 애니메이션 제공
   *
   * 주요 기능:
   * - 제어형 탭 상태 관리
   * - framer-motion `layoutId` 기반 밑줄 이동 애니메이션 처리
   * - shadcn/ui `Tabs` 조합 스타일 적용
   * - 대시보드에서 선택된 시험 정보 전달
   * - URL 기반 필터링 상태와 atom 상태 동기화
   */
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <ExamSheetListTab dataType="exam" />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamSheetRegistrationTab />
      </TabsContent>
    </>
  );
}

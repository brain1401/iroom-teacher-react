import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useLayoutEffect, useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Route as ParentRoute } from "./route";
import {
  EnhancedExamSheetListTab,
  ExamSheetRegistrationTab,
} from "@/components/exam";
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
} from "@/atoms/examFilters";
import { examListQueryOptions } from "@/api/exam";

export const Route = createFileRoute("/main/exam/manage/")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      page: search.page ? Number(search.page) : undefined,
      size: search.size ? Number(search.size) : undefined,
      sort: search.sort ? String(search.sort) : undefined,
      search: search.search ? String(search.search) : undefined,
      grade: search.grade ? String(search.grade) : undefined,
      recent: search.recent ? Boolean(search.recent) : undefined,
    };
  },
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
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const { selectedExam, examName } = ParentRoute.useSearch();
  
  // SSR 사전 로드된 데이터 가져오기
  const loaderData = Route.useLoaderData();
  const { searchParams } = loaderData;

  // SSR 하이드레이션 - URL 파라미터를 Jotai atoms에 동기화
  useHydrateAtoms([
    [searchKeywordAtom, searchParams.search || ""],
    [selectedGradeAtom, searchParams.grade ? String(searchParams.grade) : ""],
    [examPageAtom, searchParams.page || 0],
    [examPageSizeAtom, searchParams.size || 20],
    [examSortAtom, searchParams.sort || "createdAt,desc"],
    [recentExamFilterAtom, searchParams.recent || false],
    [showFilterSidebarAtom, true], // 기본값 사용
    [collapsedFilterSidebarAtom, false], // 기본값 사용
  ]);

  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState<string>("list");

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  /**
   * 시험 출제 완료 후 목록 탭으로 이동하고 새로운 시험 추가
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
   * - 시험 출제 완료 후 자동 탭 전환
   */
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <EnhancedExamSheetListTab
          selectedExamId={selectedExam}
          selectedExamName={examName}
        />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamSheetRegistrationTab />
      </TabsContent>
    </>
  );
}

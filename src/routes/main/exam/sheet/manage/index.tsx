import { createFileRoute } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useSetAtom } from "jotai";
import { useHydrateAtoms } from "jotai/utils";
import { useLayoutEffect, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { ExamSheetListTab, ExamSheetRegistrationTab } from "@/components/sheet";
import { isShowHeaderAtom } from "@/atoms/ui";
import {
  sheetSearchKeywordAtom,
  selectedSheetGradeAtom,
  sheetPageAtom,
  sheetPageSizeAtom,
  sheetSortAtom,
  sheetSortDirectionAtom,
  showSheetFilterSidebarAtom,
  collapsedSheetFilterSidebarAtom,
  setSheetSearchKeywordAtom,
  setSelectedSheetGradeAtom,
  setSheetPageAtom,
} from "@/atoms/sheetFilters";
import { examSheetListQueryOptions } from "@/api/exam-sheet";

/**
 * 시험지 관리 페이지 검색 파라미터 스키마
 * @description Zod 스키마를 사용한 타입 안전한 검색 파라미터 검증
 *
 * 포함 파라미터:
 * - 페이징: page, size
 * - 정렬: sort, direction
 * - 필터링: search, grade
 * - UI 상태: showSidebar, collapsedSidebar
 */
const sheetManageSearchSchema = z.object({
  // 기본 필터링 파라미터들 - 시험지 목록 페이지 전용
  page: z.number().int().min(0).optional(),
  size: z.number().int().min(1).max(100).optional(),
  sort: z.string().optional(),
  direction: z.enum(["desc", "asc"]).optional(),
  search: z.string().optional(),
  grade: z.string().optional(),

  // UI 상태 파라미터들
  showSidebar: z.boolean().optional(),
  collapsedSidebar: z.boolean().optional(),
});

export const Route = createFileRoute("/main/exam/sheet/manage/")({
  validateSearch: zodValidator(sheetManageSearchSchema),
  // 로더에서 사용할 의존성 추출
  loaderDeps: ({ search }) => ({
    page: search.page || 0,
    size: search.size || 10,
    sort: search.sort || "createdAt",
    direction: search.direction || ("desc" as const),
    search: search.search || undefined,
    grade: search.grade || undefined,
  }),
  // SSR loader for exam sheet list data
  loader: async ({ context, deps }) => {
    const { queryClient } = context;

    // URL 파라미터를 서버 API 파라미터로 변환
    const serverParams = {
      page: deps.page,
      size: deps.size,
      sort: deps.sort,
      direction: deps.direction,
      grade: deps.grade ? Number(deps.grade) : undefined,
      search: deps.search,
    };

    try {
      // 서버에서 시험지 목록 데이터 사전 로드
      await queryClient.prefetchQuery(examSheetListQueryOptions(serverParams));
    } catch (error) {
      console.error("시험지 목록 데이터 사전 로드 실패:", error);
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  // 현재 route의 필터링 파라미터 가져오기
  const searchParams = Route.useSearch();

  // SSR 하이드레이션 - URL 파라미터를 Jotai atoms에 동기화
  useHydrateAtoms([
    [sheetSearchKeywordAtom, searchParams.search || ""],
    [selectedSheetGradeAtom, searchParams.grade || ""],
    [sheetPageAtom, searchParams.page || 0],
    [sheetPageSizeAtom, searchParams.size || 10],
    [sheetSortAtom, searchParams.sort || "createdAt"],
    [sheetSortDirectionAtom, searchParams.direction || "desc"],
    [
      showSheetFilterSidebarAtom,
      searchParams.showSidebar !== undefined ? searchParams.showSidebar : true,
    ],
    [
      collapsedSheetFilterSidebarAtom,
      searchParams.collapsedSidebar !== undefined
        ? searchParams.collapsedSidebar
        : false,
    ],
  ]);

  // URL 파라미터 변경 시 atom 상태 동기화
  const setSearchKeyword = useSetAtom(setSheetSearchKeywordAtom);
  const setSelectedGrade = useSetAtom(setSelectedSheetGradeAtom);
  const setSheetPage = useSetAtom(setSheetPageAtom);
  const setSheetPageSize = useSetAtom(sheetPageSizeAtom);
  const setSheetSort = useSetAtom(sheetSortAtom);
  const setSheetSortDirection = useSetAtom(sheetSortDirectionAtom);
  const setShowSidebar = useSetAtom(showSheetFilterSidebarAtom);
  const setCollapsedSidebar = useSetAtom(collapsedSheetFilterSidebarAtom);

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
      setSheetPage(searchParams.page);
    }
  }, [searchParams.page, setSheetPage]);

  useEffect(() => {
    if (searchParams.size !== undefined) {
      setSheetPageSize(searchParams.size);
    }
  }, [searchParams.size, setSheetPageSize]);

  useEffect(() => {
    if (searchParams.sort !== undefined) {
      setSheetSort(searchParams.sort);
    }
  }, [searchParams.sort, setSheetSort]);

  useEffect(() => {
    if (searchParams.direction !== undefined) {
      setSheetSortDirection(searchParams.direction);
    }
  }, [searchParams.direction, setSheetSortDirection]);

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

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  /**
   * 시험지 페이지 컴포넌트
   * @description 탭 전환 및 하단 밑줄 애니메이션 제공
   *
   * 주요 기능:
   * - 제어형 탭 상태 관리
   * - framer-motion `layoutId` 기반 밑줄 이동 애니메이션 처리
   * - shadcn/ui `Tabs` 조합 스타일 적용
   * - URL 기반 필터링 상태와 atom 상태 동기화
   * - SSR에서 사전 로드된 데이터를 자식 컴포넌트에 전달
   */
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <ExamSheetListTab />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamSheetRegistrationTab />
      </TabsContent>
    </>
  );
}

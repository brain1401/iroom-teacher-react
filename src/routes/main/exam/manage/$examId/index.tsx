import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExamDetail } from "@/components/exam/ExamDetail";
import { examDetailQueryOptions, submissionStatusQueryOptions } from "@/api/exam/query";
import { isShowHeaderAtom } from "@/atoms/ui";
import { 
  examDetailIdAtom, 
  examDetailPageDataAtom,
  setExamNameFilterAtom,
  setExamDetailPageAtom,
  setExamDetailPageSizeAtom,
  setExamDetailSortAtom,
  examDetailShowSidebarAtom,
  examDetailCollapsedSidebarAtom
} from "@/atoms/examDetail";
import { useSetAtom, useAtomValue } from "jotai";
import { useLayoutEffect, useEffect } from "react";

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  // SSR loader with QueryClient hydration
  loader: async ({ context, params }) => {
    const { examId } = params;
    const { queryClient } = context;

    try {
      // Pre-fetch both exam detail and submission status data using QueryClient
      // This ensures the data is properly cached for atom hydration
      await Promise.all([
        queryClient.ensureQueryData(examDetailQueryOptions(examId)),
        queryClient.ensureQueryData(submissionStatusQueryOptions(examId))
      ]);

      console.log(`[SSR] 시험 상세 데이터 프리로드 완료 (examId: ${examId})`);
      
      return {
        success: true,
        examId,
        error: null,
      };
    } catch (error) {
      console.error(`[SSR] 시험 상세 데이터 로딩 실패 (examId: ${examId}):`, error);

      // Return error state that component can handle
      return {
        success: false,
        examId,
        error: error instanceof Error ? error.message : "데이터 로딩 실패",
      };
    }
  },
  component: ExamDetailPage,
});

function ExamDetailPage() {
  const { examId } = Route.useParams();
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const setExamDetailId = useSetAtom(examDetailIdAtom);
  
  // atom 기반 데이터 사용
  const pageData = useAtomValue(examDetailPageDataAtom);

  // Get preloaded data from SSR loader
  const { success: _success, examId: _loaderExamId, error: _error } = Route.useLoaderData();

  const router = useRouter();

  // Atom 설정 함수들
  const setExamNameFilter = useSetAtom(setExamNameFilterAtom);
  const setPage = useSetAtom(setExamDetailPageAtom);
  const setPageSize = useSetAtom(setExamDetailPageSizeAtom);
  const setSort = useSetAtom(setExamDetailSortAtom);
  const setShowSidebar = useSetAtom(examDetailShowSidebarAtom);
  const setCollapsedSidebar = useSetAtom(examDetailCollapsedSidebarAtom);

  // examId를 atom에 설정 (atom 기반 쿼리 활성화)
  useEffect(() => {
    if (examId) {
      setExamDetailId(examId);
    }
  }, [examId, setExamDetailId]);

  // URL 파라미터 선택적 처리 로직 (Step 6)
  useEffect(() => {
    // URL에서 search parameter를 직접 파싱
    const urlSearchParams = new URLSearchParams(window.location.search);
    
    // examName (또는 search) 파라미터 처리
    const examNameParam = urlSearchParams.get('examName') || urlSearchParams.get('search');
    if (examNameParam !== null) {
      setExamNameFilter(examNameParam);
    }

    // page 파라미터 처리
    const pageParam = urlSearchParams.get('page');
    if (pageParam !== null) {
      const pageValue = parseInt(pageParam, 10);
      if (!isNaN(pageValue)) {
        setPage(pageValue);
      }
    }

    // size 파라미터 처리
    const sizeParam = urlSearchParams.get('size');
    if (sizeParam !== null) {
      const sizeValue = parseInt(sizeParam, 10);
      if (!isNaN(sizeValue) && sizeValue > 0) {
        setPageSize(sizeValue);
      }
    }

    // sort 파라미터 처리
    const sortParam = urlSearchParams.get('sort');
    if (sortParam !== null) {
      setSort(sortParam);
    }

    // showSidebar 파라미터 처리
    const showSidebarParam = urlSearchParams.get('showSidebar');
    if (showSidebarParam !== null) {
      setShowSidebar(showSidebarParam === 'true');
    }

    // collapsedSidebar 파라미터 처리
    const collapsedSidebarParam = urlSearchParams.get('collapsedSidebar');
    if (collapsedSidebarParam !== null) {
      setCollapsedSidebar(collapsedSidebarParam === 'true');
    }

    console.log('[URL Parameters] Selective atom updates completed:', {
      examName: examNameParam,
      page: pageParam,
      size: sizeParam,
      sort: sortParam,
      showSidebar: showSidebarParam,
      collapsedSidebar: collapsedSidebarParam
    });
  }, [router.state.location.search, setExamNameFilter, setPage, setPageSize, setSort, setShowSidebar, setCollapsedSidebar]);

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.history.back();
  };

  // 로딩 상태 처리
  if (pageData.isLoading) {
    return (
      <div className="w-full h-full py-5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>시험 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (pageData.hasError) {
    return (
      <div className="w-full h-full py-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">시험 정보를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full py-5">
      <ExamDetail
        onBack={handleBack}
        examName={(pageData.examDetail.data as any)?.examName || "시험 상세"}
        examId={examId}
      />
    </div>
  );
}
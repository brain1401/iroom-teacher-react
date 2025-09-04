import { createFileRoute, useRouter, stripSearchParams } from "@tanstack/react-router";
import { z } from "zod";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { ExamDetail } from "@/components/exam/ExamDetail";
import { examDetailQueryOptions, submissionStatusQueryOptions } from "@/api/exam/query";
import { isShowHeaderAtom } from "@/atoms/ui";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";

// 기본값 정의
const defaultSearchParams = {
  page: 0,
  size: 20,
  sort: "createdAt,desc",
  showSidebar: true,
  collapsedSidebar: false,
} as const;

// 쿼리 파라미터 스키마 (fallback과 기본값 사용)
const examDetailSearchSchema = z.object({
  /** 시험명 (선택적) */
  examName: z.string().optional(),
  /** 페이지 번호 */
  page: fallback(z.number(), defaultSearchParams.page).default(defaultSearchParams.page),
  /** 페이지 크기 */
  size: fallback(z.number(), defaultSearchParams.size).default(defaultSearchParams.size),
  /** 정렬 기준 */
  sort: fallback(z.string(), defaultSearchParams.sort).default(defaultSearchParams.sort),
  /** 사이드바 표시 여부 */
  showSidebar: fallback(z.boolean(), defaultSearchParams.showSidebar).default(defaultSearchParams.showSidebar),
  /** 사이드바 접힘 여부 */
  collapsedSidebar: fallback(z.boolean(), defaultSearchParams.collapsedSidebar).default(defaultSearchParams.collapsedSidebar),
});

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  // zodValidator를 사용한 검색 파라미터 유효성 검사
  validateSearch: zodValidator(examDetailSearchSchema),
  // 기본값과 일치하는 파라미터를 URL에서 제거
  search: {
    middlewares: [stripSearchParams(defaultSearchParams)],
  },
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
  const searchParams = Route.useSearch();
  
  // Zod 스키마에서 기본값이 자동으로 적용됨
  const examName = searchParams.examName || "";
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  // Get preloaded data from SSR loader
  const { success: _success, examId: _loaderExamId, error: _error } = Route.useLoaderData();

  const router = useRouter();

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.history.back();
  };

  return (
    <div className="w-full h-full py-5">
      <ExamDetail
        onBack={handleBack}
        examName={examName || "시험 상세"}
        examId={examId}
      />
    </div>
  );
}
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { z } from "zod";
import { ExamDetail } from "@/components/exam/ExamDetail";
import { fetchSubmissionStatus } from "@/api/exam/api";
import { isShowHeaderAtom } from "@/atoms/ui";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";

// 검색 파라미터 스키마 정의
const searchSchema = z.object({
  examName: z.string().optional(),
});

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  validateSearch: searchSchema,
  // SSR loader for submission status data
  loader: async ({ params }) => {
    const { examId } = params;
    
    try {
      // Pre-fetch submission status data on server-side
      const submissionData = await fetchSubmissionStatus(examId);
      return {
        submissionData,
        success: true,
        error: null,
      };
    } catch (error) {
      console.error(`제출 현황 데이터 로딩 실패 (examId: ${examId}):`, error);
      
      // Return error state that component can handle
      return {
        submissionData: null,
        success: false,
        error: error instanceof Error ? error.message : "데이터 로딩 실패",
      };
    }
  },
  component: ExamDetailPage,
});;

function ExamDetailPage() {
  const { examId } = Route.useParams();
  const { examName } = Route.useSearch();
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  
  // Get preloaded data from SSR loader
  const { submissionData, success, error } = Route.useLoaderData();

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
        // Pass preloaded server data to component
        preloadedData={success ? submissionData : null}
        preloadedError={error}
      />
    </div>
  );
}

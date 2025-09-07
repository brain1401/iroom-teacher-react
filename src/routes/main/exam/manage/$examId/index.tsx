import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExamDetail } from "@/components/exam/ExamDetail";
import {
  examDetailQueryOptions,
  submissionStatusQueryOptions,
} from "@/api/exam/query";
import { isShowHeaderAtom } from "@/atoms/ui";
import { examDetailIdAtom, examDetailPageDataAtom } from "@/atoms/examDetail";
import { useSetAtom, useAtomValue } from "jotai";
import { useLayoutEffect } from "react";
import logger from "@/utils/logger";

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  loader: async ({ context, params }) => {
    const { examId } = params;
    const { queryClient } = context;

    logger.info(`[SSR] examId 로더: ${examId}`);

    try {
      await Promise.all([
        queryClient.prefetchQuery(examDetailQueryOptions(examId)),
        queryClient.prefetchQuery(submissionStatusQueryOptions(examId)),
      ]);

      logger.info(
        `[SSR] 시험 상세 데이터 프리로드 ${examId ? "완료" : "실패"}`,
      );
    } catch (error) {
      logger.error(
        `[SSR] 시험 상세 데이터 로딩 실패 (examId: ${examId}):`,
        error,
      );
    }
  },
  component: ExamDetailPage,
});

function ExamDetailPage() {
  const { examId } = Route.useParams();

  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const router = useRouter();

  const pageData = useAtomValue(examDetailPageDataAtom);

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    router.history.back();
  };

  // 에러 상태 처리
  if (pageData.hasError) {
    return (
      <div className="w-full h-full py-5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">
            시험 정보를 불러올 수 없습니다.
          </p>
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
        examName={pageData.examDetail.data?.examName || "시험 상세"}
        examId={examId}
      />
    </div>
  );
}

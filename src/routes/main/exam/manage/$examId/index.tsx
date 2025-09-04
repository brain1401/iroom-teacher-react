import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ExamDetail } from "@/components/exam/ExamDetail";
import {
  examDetailQueryOptions,
  submissionStatusQueryOptions,
} from "@/api/exam/query";
import { isShowHeaderAtom } from "@/atoms/ui";
import { examDetailIdAtom, examDetailPageDataAtom } from "@/atoms/examDetail";
import { useSetAtom, useAtomValue } from "jotai";
import { useLayoutEffect, useEffect } from "react";
import { useHydrateAtoms } from "jotai-ssr";
import logger from "@/utils/logger";

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  loader: async ({ context, params }) => {
    const { examId } = params;
    const { queryClient } = context;

    logger.info(`examId : ${examId})`);

    try {
      const [examDetail, submissionStatus] = await Promise.all([
        queryClient.ensureQueryData(examDetailQueryOptions(examId)),
        queryClient.ensureQueryData(submissionStatusQueryOptions(examId)),
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
  // SSR 하이드레이션 - examId만 설정
  useHydrateAtoms([[examDetailIdAtom, examId]]);

  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const setExamDetailId = useSetAtom(examDetailIdAtom);

  // atom 기반 데이터 사용
  const pageData = useAtomValue(examDetailPageDataAtom);
  const router = useRouter();

  // examId를 atom에 설정 (atom 기반 쿼리 활성화)
  useEffect(() => {
    if (examId) {
      setExamDetailId(examId);
    }
  }, [examId, setExamDetailId]);

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
  // if (pageData.isLoading) {
  //   return (
  //     <div className="w-full h-full py-5 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
  //         <p>시험 정보를 불러오는 중...</p>
  //       </div>
  //     </div>
  //   );
  // }

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

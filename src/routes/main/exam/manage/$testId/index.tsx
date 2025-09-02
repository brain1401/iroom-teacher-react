import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ExamDetail } from "@/components/exam/ExamDetail";
import { dashboardExamSubmissions } from "@/data/exam-submission-dashboard";
import { isShowHeaderAtom } from "@/atoms/ui";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";

// 검색 파라미터 스키마 정의
const searchSchema = z.object({
  examName: z.string().optional(),
});

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  validateSearch: searchSchema,
  component: ExamDetailPage,
});

function ExamDetailPage() {
  const { examId } = Route.useParams();
  const { examName } = Route.useSearch();
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  /**
   * 뒤로가기 핸들러
   */
  const handleBack = () => {
    window.history.back();
  };

  /**
   * 선택된 시험 정보 찾기
   */
  const selectedExam = dashboardExamSubmissions.find(
    (exam) => exam.id === examId,
  );

  return (
    <div className="w-full h-full p-8">
      <ExamDetail
        onBack={handleBack}
        examName={examName || selectedExam?.examName}
        examId={examId}
      />
    </div>
  );
}

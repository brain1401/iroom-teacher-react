import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { TestDetail } from "@/components/test/TestDetail";
import { dashboardTestSubmissions } from "@/data/test-submission-dashboard";
import { isShowHeaderAtom } from "@/atoms/ui";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";

// 검색 파라미터 스키마 정의
const searchSchema = z.object({
  testName: z.string().optional(),
});

export const Route = createFileRoute("/main/test-management/$testId")({
  validateSearch: searchSchema,
  component: TestDetailPage,
});

function TestDetailPage() {
  const { testId } = Route.useParams();
  const { testName } = Route.useSearch();
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
  const selectedTest = dashboardTestSubmissions.find(
    (test) => test.id === testId,
  );

  return (
    <div className="w-full h-full p-8">
      <TestDetail
        onBack={handleBack}
        testName={testName || selectedTest?.testName}
        testId={testId}
      />
    </div>
  );
}

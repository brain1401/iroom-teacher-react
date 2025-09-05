import { isShowHeaderAtom } from "@/atoms/ui";
import { ExamSubmissionStatus } from "@/components/exam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSetAtom, useAtomValue } from "jotai";
import { useLayoutEffect, useMemo } from "react";
import { GradeDistributionChart } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";
import { CircleQuestionMarkIcon, ChevronRight } from "lucide-react";
import { isAuthenticatedAtom } from "@/atoms/auth";
import {
  calculateDashboardStats,
  dashboardExamSubmissions,
} from "@/data/exam-submission-dashboard";
import type { DashboardExamSubmission } from "@/data/exam-submission-dashboard";

export const Route = createFileRoute("/main/")({
  component: RouteComponent,
});

const chartData = [
  { count: 0, level: "하위권", score: "0-39점" },
  { count: 2, level: "하위권", score: "40-49점" },
  { count: 4, level: "하위권", score: "50-59점" },
  { count: 5, level: "중위권", score: "60-69점" },
  { count: 10, level: "중위권", score: "70-79점" },
  { count: 8, level: "상위권", score: "80-89점" },
  { count: 6, level: "상위권", score: "90-100점" },
];

//  chartConfig 정의
const chartConfig = {
  상위권: {
    label: "상위권",
    color: "var(--chart-1)",
  },
  중위권: {
    label: "중위권",
    color: "var(--chart-2)",
  },
  하위권: {
    label: "하위권",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const navigate = useNavigate();
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  // 인증 상태 확인
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     navigate({ to: "/" });
  //   }
  // }, [isAuthenticated, navigate]);

  // // 인증되지 않은 경우 로딩 표시
  // if (!isAuthenticated) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">인증 확인 중...</p>
  //       </div>
  //     </div>
  //   );
  // }

  //  퍼센트 계산 로직
  const totalStudents = chartData.reduce((sum, item) => sum + item.count, 0);

  const levelInfo = useMemo(
    () =>
      Object.keys(chartConfig)
        .map((level) => {
          const count = chartData
            .filter((d) => d.level === level)
            .reduce((sum, item) => sum + item.count, 0);
          const percentage =
            totalStudents > 0 ? (count / totalStudents) * 100 : 0;
          return { level, percentage };
        })
        .sort((a, b) => {
          const order: Record<string, number> = {
            상위권: 1,
            중위권: 2,
            하위권: 3,
          };
          return (order[a.level] || 0) - (order[b.level] || 0);
        }),
    [chartData, totalStudents],
  );

  /**
   * 시험 제출 현황 카드 클릭 핸들러
   */
  const handleExamSubmissionClick = (exam: DashboardExamSubmission) => {
    // 해당 시험의 제출 현황 상세 페이지로 이동
    navigate({
      to: "/main/exam/manage/$examId",
      params: { examId: exam.id },
      search: { examName: exam.examName },
    });
  };

  /**
   * 더보기 버튼 클릭 핸들러
   */
  const handleViewMoreClick = () => {
    navigate({
      to: "/main/exam/manage",
    });
  };

  /**
   * 성적 분포도 차트 클릭 핸들러
   */
  const handleChartClick = (data: any) => {
    // 통계 페이지로 이동
    navigate({
      to: "/main/statistics",
    });
  };

  /**
   * 대시보드 통계 계산
   */
  const dashboardStats = calculateDashboardStats();

  /**
   * 최근 4개의 시험 제출 현황만 표시
   */
  const recentExamSubmissions = dashboardExamSubmissions.slice(0, 4);

  return (
    <div className="flex flex-1 gap-8 ">
      <Card className="w-[25rem] border-0 flex-1">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mt-4">
            시험 제출 현황
          </CardTitle>
          {/* 대시보드 통계 요약 */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>총 {dashboardStats.totalExams}개 시험</span>
            <span>•</span>
            <span>평균 제출률 {dashboardStats.averageSubmissionRate}%</span>
            <span>•</span>
            <span>
              {dashboardStats.totalSubmitted}/{dashboardStats.totalStudents}명
              제출
            </span>
          </div>
          <hr className="my-7 text-gray-200" />
        </CardHeader>
        <div className="-mt-10 p-4 gap-4 flex flex-col">
          {recentExamSubmissions.map((exam) => (
            <ExamSubmissionStatus
              key={exam.id}
              unitName={`${exam.unitName} : ${exam.examName}`}
              submittedCount={exam.submittedCount}
              totalStudents={exam.totalStudents}
              submissionRate={exam.submissionRate}
              onClick={() => handleExamSubmissionClick(exam)}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          ))}

          {/* 더보기 버튼 */}
          {dashboardExamSubmissions.length > 4 && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={handleViewMoreClick}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <span>더보기</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </Card>
      <div>
        <Card className=" flex w-[70rem] p-5 border-0">
          <CardHeader className="flex flex-row items-center">
            <CardTitle className="text-3xl font-bold">성적 분포도</CardTitle>
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <div className="ml-2 p-2 hover:cursor-help">
                  <CircleQuestionMarkIcon className="text-blue-500 pointer-events-none" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-3 w-150"
              >
                <div className="space-y-2 text-lg ">
                  <span className="text-gray-800">
                    성적 분포도는 기본적으로{" "}
                  </span>
                  <span className="text-blue-800">
                    전체(중1~중3) 학생들의 평균 점수를 합산하여 상·중·하위권으로
                    구분
                  </span>
                  <span className="text-gray-800">
                    {" "}
                    해 보여줍니다. 학년을 선택하면 해당 학년만 필터링된 분포도를
                    확인할 수 있으며, 이를 통해
                  </span>
                  <span className="text-blue-800">
                    학교 전체 성적 흐름과 학년별 특성을 한눈에 비교할 수
                    있습니다
                  </span>
                  .
                </div>
              </HoverCardContent>
            </HoverCard>
            <hr className="my-7 text-gray-200" />
          </CardHeader>
          <CardContent className="p-10 -mt-12">
            {/* chartData와 함께 chartConfig, levelInfo를 props로 전달 */}
            <GradeDistributionChart
              data={chartData}
              chartConfig={chartConfig}
              levelInfo={levelInfo}
              onBarClick={handleChartClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
import { useSetAtom, useAtomValue, useAtom } from "jotai";
import { useLayoutEffect, useMemo } from "react";
import { GradeDistributionChart } from "@/components/charts";
import type { ChartConfig } from "@/components/ui/chart";
import { CircleQuestionMarkIcon, ChevronRight } from "lucide-react";
// import { isAuthenticatedAtom } from "@/atoms/auth"; // 현재 사용하지 않음
import {
  selectedGradeAtom,
  recentExamsStatusQueryAtom,
  chartScoreDistributionAtom,
  scoreDistributionQueryAtom,
  scoreDistributionQueryOptions,
  recentExamsStatusQueryOptions,
} from "@/atoms/dashboard";

export const Route = createFileRoute("/main/")({
  component: RouteComponent,
  loader: async ({ context: { queryClient } }) => {
    // 메인 대시보드에 필요한 두 쿼리 모두 사전 로드 (SSR 최적화)
    await Promise.all([
      queryClient.ensureQueryData(scoreDistributionQueryOptions({ grade: 1 })),
      queryClient.ensureQueryData(recentExamsStatusQueryOptions({ grade: 1 })),
      queryClient.ensureQueryData(scoreDistributionQueryOptions({ grade: 2 })),
      queryClient.ensureQueryData(recentExamsStatusQueryOptions({ grade: 2 })),
      queryClient.ensureQueryData(scoreDistributionQueryOptions({ grade: 3 })),
      queryClient.ensureQueryData(recentExamsStatusQueryOptions({ grade: 3 })),
    ]);
  },
});

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
  // const isAuthenticated = useAtomValue(isAuthenticatedAtom); // 현재 사용하지 않음

  // Dashboard atoms 사용
  const [selectedGrade, setSelectedGrade] = useAtom(selectedGradeAtom);
  const {
    data: examSubmissionsData,
    isPending: isExamsLoading,
    isError: isExamsError,
  } = useAtomValue(recentExamsStatusQueryAtom);
  const {
    data: scoreDistributionData,
    isPending: isScoreLoading,
    isError: isScoreError,
  } = useAtomValue(scoreDistributionQueryAtom);
  const chartData = useAtomValue(chartScoreDistributionAtom);

  // 로딩 및 에러 상태 통합
  const isLoading = isExamsLoading || isScoreLoading;
  const hasError = isExamsError || isScoreError;

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  // 서버에서 받은 데이터 그대로 사용 (불필요한 변환 제거)
  const examSubmissions = examSubmissionsData?.examSubmissions || [];

  // 차트 데이터는 atoms에서 이미 변환되어 제공됨
  const chartDataForDisplay = useMemo(() => {
    return chartData.map((item) => ({
      count: item[`grade${selectedGrade}` as keyof typeof item] as number,
      level:
        item.scoreRange.includes("90-100") || item.scoreRange.includes("80-89")
          ? "상위권"
          : item.scoreRange.includes("70-79") ||
              item.scoreRange.includes("60-69")
            ? "중위권"
            : "하위권",
      score: `${item.scoreRange}점`,
    }));
  }, [chartData, selectedGrade]);

  // 레벨 정보 계산 (차트 표시용)
  const levelInfo = useMemo(
    () =>
      Object.keys(chartConfig)
        .map((level) => {
          const count = chartDataForDisplay
            .filter((d) => d.level === level)
            .reduce((sum, item) => sum + item.count, 0);
          const totalStudents = chartDataForDisplay.reduce(
            (sum, item) => sum + item.count,
            0,
          );
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
    [chartDataForDisplay],
  );

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

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="flex flex-1 gap-8">
        <Card className="w-[25rem] border-0 flex-1">
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </CardHeader>
        </Card>
        <div>
          <Card className="flex w-[70rem] p-5 border-0">
            <div className="animate-pulse w-full">
              <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // 에러 상태 처리
  if (hasError) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            데이터를 불러올 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            새로고침
          </Button>
        </Card>
      </div>
    );
  }

  /**
   * 시험 제출 현황 카드 클릭 핸들러 (서버 데이터 구조 사용)
   */
  const handleExamSubmissionClick = (exam: (typeof examSubmissions)[0]) => {
    // 해당 시험의 제출 현황 상세 페이지로 이동
    navigate({
      to: "/main/exam/manage/$examId",
      params: { examId: exam.examId },
    });
  };

  /**
   * 더보기 버튼 클릭 핸들러
   */
  const handleViewMoreClick = () => {
    navigate({
      to: "/main/exam/manage",
      search: {
        page: 0,
        size: 20,
        sort: "createdAt,desc",
        search: undefined,
        grade: undefined,
        recent: undefined,
      },
    });
  };

  /**
   * 성적 분포도 차트 클릭 핸들러
   */
  const handleChartClick = () => {
    // 통계 페이지로 이동
    navigate({
      to: "/main/statistics",
    });
  };

  /**
   * 학년 선택 핸들러
   */
  const handleGradeChange = (grade: 1 | 2 | 3) => {
    setSelectedGrade(grade);
  };

  return (
    <div className="flex flex-1 gap-8 ">
      <Card className="w-[25rem] border-0 flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold mt-4">
              시험 제출 현황
            </CardTitle>
            {/* 학년 선택 버튼 */}
            <div className="flex gap-2">
              {[1, 2, 3].map((grade) => (
                <Button
                  key={grade}
                  variant={selectedGrade === grade ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleGradeChange(grade as 1 | 2 | 3)}
                  className="text-sm"
                >
                  {grade}학년
                </Button>
              ))}
            </div>
          </div>
          {/* 대시보드 통계 요약 (서버 데이터 직접 사용) */}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>총 {examSubmissionsData?.examCount || 0}개 시험</span>
            <span>•</span>
            <span>
              평균 제출률{" "}
              {Math.round(
                (examSubmissionsData?.averageSubmissionRate || 0) * 10,
              ) / 10}
              %
            </span>
            <span>•</span>
            <span>평균 점수 {scoreDistributionData?.averageScore || 0}점</span>
          </div>
          <hr className="my-7 text-gray-200" />
        </CardHeader>
        <div className="-mt-10 p-4 gap-4 flex flex-col">
          {examSubmissions.length > 0 ? (
            <>
              {/* 최근 4개의 시험만 표시 */}
              {examSubmissions.slice(0, 4).map((exam) => (
                <ExamSubmissionStatus
                  key={exam.examId}
                  examName={exam.examName}
                  actualSubmissions={exam.actualSubmissions}
                  totalExpected={exam.totalExpected}
                  submissionRate={Math.round(exam.submissionRate * 10) / 10}
                  onClick={() => handleExamSubmissionClick(exam)}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              ))}

              {/* 더보기 버튼 */}
              {examSubmissions.length > 4 && (
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
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>시험 데이터가 없습니다.</p>
              <p className="text-sm">선택한 학년의 시험을 확인해보세요.</p>
            </div>
          )}
        </div>
      </Card>
      <div>
        <Card className=" flex w-[70rem] p-5 border-0">
          <CardHeader className="flex flex-row items-center">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <CardTitle className="text-3xl font-bold">
                  성적 분포도
                </CardTitle>
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
                        성적 분포도는 선택된 학년의 학생들 점수를{" "}
                      </span>
                      <span className="text-blue-800">
                        상·중·하위권으로 구분
                      </span>
                      <span className="text-gray-800">
                        {" "}
                        해 보여줍니다. 학년을 선택하면 해당 학년만 필터링된
                        분포도를 확인할 수 있습니다
                      </span>
                      .
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              {/* 학년 표시 */}
              <div className="text-lg font-medium text-blue-600">
                {selectedGrade}학년
              </div>
            </div>
            <hr className="my-7 text-gray-200" />
          </CardHeader>
          <CardContent className="p-10 -mt-12">
            {/* chartDataForDisplay와 함께 chartConfig, levelInfo를 props로 전달 */}
            <GradeDistributionChart
              data={chartDataForDisplay}
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

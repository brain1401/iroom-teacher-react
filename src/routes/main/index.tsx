import { isShowHeaderAtom } from "@/atoms/ui";
import { ExamSubmissionStatus } from "@/components/ExamSubmissionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { GradeDistributionChart } from "@/components/Gradedistributionchart";
import type { ChartConfig } from "@/components/ui/chart";
import { CircleQuestionMarkIcon } from "lucide-react";

export const Route = createFileRoute("/main/")({
  component: RouteComponent,
});
type ExamSubmissionStatus = {
  unitName: string;
  submittedCount: number;
  totalStudents: number;
  submissionRate: number;
};

const examSubmissionStatusList: ExamSubmissionStatus[] = [
  {
    unitName: "test1",
    submittedCount: 35,
    totalStudents: 50,
    submissionRate: 70,
  },
  {
    unitName: "test2",
    submittedCount: 20,
    totalStudents: 30,
    submissionRate: 66.67,
  },
  {
    unitName: "test3",
    submittedCount: 10,
    totalStudents: 30,
    submissionRate: 33.33,
  },
  {
    unitName: "test4",
    submittedCount: 15,
    totalStudents: 30,
    submissionRate: 50,
  },
];

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

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  //  퍼센트 계산 로직
  const totalStudents = chartData.reduce((sum, item) => sum + item.count, 0);

  const levelInfo = Object.keys(chartConfig)
    .map((level) => {
      const count = chartData
        .filter((d) => d.level === level)
        .reduce((sum, item) => sum + item.count, 0);
      const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
      return { level, percentage };
    })
    .sort((a, b) => {
      const order: Record<string, number> = { 상위권: 1, 중위권: 2, 하위권: 3 };
      return (order[a.level] || 0) - (order[b.level] || 0);
    });

  return (
    <div className="flex flex-1 gap-8 ">
      <Card className="w-[25rem] border-0 flex-1">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mt-4">
            시험 제출 현황
          </CardTitle>
          <hr className="my-7 text-gray-200" />
        </CardHeader>
        <div className="-mt-10 p-4 gap-4 flex flex-col">
          {examSubmissionStatusList.map((item) => (
            <ExamSubmissionStatus
              key={item.unitName}
              unitName={item.unitName}
              submittedCount={item.submittedCount}
              totalStudents={item.totalStudents}
              submissionRate={item.submissionRate}
            ></ExamSubmissionStatus>
          ))}
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
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

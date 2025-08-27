import { isShowHeaderAtom } from "@/atoms/ui";
import { ExamSubmissionStatus } from "@/components/ExamSubmissionStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { GradeDistributionChart } from "@/components/Gradedistributionchart";
import type { ChartConfig } from "@/components/ui/chart"; 

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
    { unitName: "test", submittedCount: 10, totalStudents: 100, submissionRate: 0.1 },
    { unitName: "test2", submittedCount: 99, totalStudents: 100, submissionRate: 50 },
    { unitName: "test3", submittedCount: 0, totalStudents: 100, submissionRate: 0 },
    { unitName: "test4", submittedCount: 100, totalStudents: 100, submissionRate: 1 },
];

// ✨ [수정] 이미지와 동일한 데이터로 수정
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
    color: "hsl(var(--chart-1))",
  },
  중위권: {
    label: "중위권",
    color: "hsl(var(--chart-3))",
  },
  하위권: {
    label: "하위권",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  //  퍼센트 계산 로직
  const totalStudents = chartData.reduce((sum, item) => sum + item.count, 0);

  const levelInfo = Object.keys(chartConfig).map(level => {
    const count = chartData
      .filter(d => d.level === level)
      .reduce((sum, item) => sum + item.count, 0);
    const percentage = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
    return { level, percentage };
  }).sort((a,b) => {
      const order: Record<string, number> = { '상위권': 1, '중위권': 2, '하위권': 3 };
      return (order[a.level] || 0) - (order[b.level] || 0);
  });

  return (
    <div className="flex gap-8">
      <Card className="w-[30rem] border-0">
        <CardHeader>
          <CardTitle className="text-3xl font-bold mt-4">시험 제출 현황</CardTitle>
          <hr className="my-7 text-gray-200"/>
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
        ))}</div>
      </Card>
      <div>
        <Card className="flex-1 w-[80rem] p-5 border-0">
          <CardHeader>
            <CardTitle className="text-3xl font-bold mt-4">성적 분포도</CardTitle>
            <hr className="my-7 text-gray-200"/>
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
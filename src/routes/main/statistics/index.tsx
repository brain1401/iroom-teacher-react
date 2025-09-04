import { isShowHeaderAtom } from "@/atoms/ui";
import {
  selectedGradeAtom,
  selectedGradeStatsAtom,
  dashboardLoadingAtom,
  dashboardErrorAtom,
} from "@/atoms/dashboard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { createFileRoute } from "@tanstack/react-router";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { useLayoutEffect, useMemo } from "react";
import type { Grade } from "@/types/grade";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
} from "recharts";
import type { TooltipProps } from "recharts";
import { HelpCircle } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

/** 평균 차트 커스텀 툴팁 */
function AverageTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const data = (
    payload[0] as unknown as {
      payload: { name: string; avg: number; participants?: number };
    }
  ).payload;
  return (
    <div className="border-border/50 bg-background grid min-w-[10rem] gap-1.5 rounded-md border px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{data.name || label}</div>
      <div>시험 본 인원: {data.participants ?? "-"}</div>
      <div>평균: {data.avg}</div>
    </div>
  );
}

/** 오답률 차트 커스텀 툴팁 */
function WrongRateTooltip(props: TooltipProps<number, string>) {
  const { active, payload, label } = props;
  if (!active || !payload || payload.length === 0) return null;
  const data = (
    payload[0] as unknown as {
      payload: {
        name: string;
        wrongRate: number;
        totalSubmitted?: number;
        wrongCount?: number;
      };
    }
  ).payload;
  return (
    <div className="border-border/50 bg-background grid min-w-[12rem] gap-1.5 rounded-md border px-3 py-2 text-xs shadow-xl">
      <div className="font-medium">{data.name || label}</div>
      <div>총 제출된 문제갯수: {data.totalSubmitted ?? "-"}</div>
      <div>틀린갯수: {data.wrongCount ?? "-"}</div>
      <div>오답률: {data.wrongRate}%</div>
    </div>
  );
}

export const Route = createFileRoute("/main/statistics/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const [selectedGrade, setSelectedGrade] = useAtom(selectedGradeAtom);
  const gradeStats = useAtomValue(selectedGradeStatsAtom);
  const isLoading = useAtomValue(dashboardLoadingAtom);
  const { hasError } = useAtomValue(dashboardErrorAtom);

  // Grade 타입을 숫자 타입으로 매핑
  const gradeMapping: Record<1 | 2 | 3, Grade> = {
    1: "중1",
    2: "중2", 
    3: "중3",
  };

  const currentGrade = gradeMapping[selectedGrade];

  // **임시 Mock 데이터 (서버 API 한계로 인한 Fallback)**
  // TODO: 향후 서버에서 시험별/단원별 상세 통계 API 추가 시 제거 필요
  const fakeAveragesByGrade: Record<
    Grade,
    { examName: string; average: number; participants: number }[]
  > = {
    중1: [
      { examName: "1학기 중간", average: 76, participants: 10 },
      { examName: "1학기 기말", average: 81, participants: 10 },
      { examName: "2학기 중간", average: 79, participants: 10 },
      { examName: "2학기 기말", average: 83, participants: 10 },
    ],
    중2: [
      { examName: "1학기 중간", average: 72, participants: 12 },
      { examName: "1학기 기말", average: 78, participants: 12 },
      { examName: "2학기 중간", average: 75, participants: 12 },
      { examName: "2학기 기말", average: 80, participants: 12 },
    ],
    중3: [
      { examName: "1학기 중간", average: 70, participants: 11 },
      { examName: "1학기 기말", average: 77, participants: 11 },
      { examName: "2학기 중간", average: 74, participants: 11 },
      { examName: "2학기 기말", average: 79, participants: 11 },
    ],
  };

  // **임시 Mock 데이터 (서버 API 한계로 인한 Fallback)**
  // TODO: 향후 서버에서 단원별 오답률 API 추가 시 제거 필요
  const fakeUnitWrongSourcesByGrade: Record<
    Grade,
    {
      unitName: string;
      questionCount: number;
      participants: number;
      wrongCount: number;
    }[]
  > = {
    중1: [
      {
        unitName: "1단원(덧셈/뺄셈)",
        questionCount: 3,
        participants: 10,
        wrongCount: 3,
      }, // 10%
      {
        unitName: "2단원(곱셈)",
        questionCount: 4,
        participants: 10,
        wrongCount: 10,
      }, // 25%
      {
        unitName: "3단원(나눗셈)",
        questionCount: 5,
        participants: 10,
        wrongCount: 9,
      }, // 18%
      {
        unitName: "4단원(분수)",
        questionCount: 5,
        participants: 10,
        wrongCount: 7,
      }, // 14%
    ],
    중2: [
      {
        unitName: "1단원(방정식)",
        questionCount: 5,
        participants: 10,
        wrongCount: 13,
      }, // 26%
      {
        unitName: "2단원(부등식)",
        questionCount: 4,
        participants: 10,
        wrongCount: 8,
      }, // 20%
      {
        unitName: "3단원(함수)",
        questionCount: 6,
        participants: 10,
        wrongCount: 15,
      }, // 25%
      {
        unitName: "4단원(확률)",
        questionCount: 5,
        participants: 10,
        wrongCount: 9,
      }, // 18%
    ],
    중3: [
      {
        unitName: "1단원(다항식)",
        questionCount: 5,
        participants: 10,
        wrongCount: 14,
      }, // 28%
      {
        unitName: "2단원(인수분해)",
        questionCount: 5,
        participants: 10,
        wrongCount: 11,
      }, // 22%
      {
        unitName: "3단원(이차방정식)",
        questionCount: 5,
        participants: 10,
        wrongCount: 12,
      }, // 24%
      {
        unitName: "4단원(이차함수)",
        questionCount: 5,
        participants: 10,
        wrongCount: 10,
      }, // 20%
    ],
  };

  const results = fakeAveragesByGrade[currentGrade];
  const wrongSources = fakeUnitWrongSourcesByGrade[currentGrade];

  // Map 기반 데이터 변환 (시험명 -> 평균)
  const chartData = useMemo(() => {
    const list = results;
    return list.map((r) => ({
      name: r.examName,
      avg: r.average,
      participants: r.participants,
    }));
  }, [results]);

  // 차트 시리즈/색상 설정
  const chartConfig = {
    avg: { label: "평균 점수 ", color: "hsl(217 91% 60%)" },
  } as const;
  const wrongChartConfig = {
    wrongRate: { label: "오답률 ", color: "hsl(340 82% 52%)" },
  } as const;

  // 오답률 차트 데이터
  const wrongChartData = useMemo(() => {
    const list = wrongSources;
    const computed = list.map((s) => {
      const total = s.questionCount * s.participants;
      const rate = total > 0 ? (s.wrongCount / total) * 100 : 0;
      const rounded = Math.round(rate); // 정수 퍼센트 표기
      return {
        name: s.unitName,
        wrongRate: rounded,
        totalSubmitted: total,
        wrongCount: s.wrongCount,
      };
    });
    return computed;
  }, [wrongSources]);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  // 학년 선택 핸들러
  const handleGradeChange = (grade: 1 | 2 | 3) => {
    setSelectedGrade(grade);
  };

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <Card className="flex-1 p-8 flex flex-col w-full bg-white shadow-2xl rounded-sm">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="flex gap-4">
            <div className="flex-1 h-96 bg-gray-200 rounded"></div>
            <div className="flex-1 h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  // 에러 상태 처리
  if (hasError) {
    return (
      <Card className="flex-1 p-8 flex flex-col w-full bg-white shadow-2xl rounded-sm items-center justify-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">
          통계 데이터를 불러올 수 없습니다
        </h2>
        <p className="text-gray-600 mb-4">
          서버 연결을 확인하거나 잠시 후 다시 시도해 주세요.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          variant="outline"
        >
          새로고침
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex-1 p-8 flex flex-col w-full bg-white shadow-2xl rounded-sm">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-[2.5rem] font-bold">통계</div>
          <HoverCard>
            <HoverCardTrigger asChild>
              <HelpCircle className="h-6 w-6 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
            </HoverCardTrigger>
            <HoverCardContent
              side="right"
              className="bg-white border-2 border-blue-500 rounded-lg shadow-lg p-3 w-150"
            >
              <div className="space-y-2 text-lg ">
                <span className="text-gray-800">시험 통계는 </span>
                <span className="text-blue-800">
                  최근 4개 시험의 학년별 평균 점수
                </span>
                <span className="text-gray-800">
                  {" "}
                  를 꺽은선 그래프로 보여주며,
                </span>
                <span className="text-blue-800">
                  오답률이 높은 상위 4개 단원을 퍼센트로 표시해 취약 영역을 확인
                </span>
                <span className="text-gray-800">
                  {" "}
                  할 수 있고, 학년 버튼을 선택하면 해당 학년 데이터만 볼 수
                  있습니다.
                </span>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
        
        {/* 학년 선택 및 서버 통계 정보 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">학년 선택:</span>
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
          
          {/* 서버 데이터에서 가져온 현재 학년 통계 */}
          <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
            <span className="font-medium">현재 {selectedGrade}학년 통계:</span>
            <span className="ml-2">평균 {gradeStats.averageScore}점</span>
            <span className="mx-2">•</span>
            <span>합격률 {Math.round(gradeStats.passRate * 100)}%</span>
            <span className="mx-2">•</span>
            <span>총 {gradeStats.totalStudents}명</span>
          </div>
        </div>

        {/* API 한계 안내 */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>임시 데이터 표시 중:</strong> 
            현재 서버 API에서 시험별/단원별 상세 통계를 제공하지 않아 임시 데이터로 표시됩니다. 
            향후 API 확장 시 실제 데이터로 교체될 예정입니다.
          </p>
        </div>
      </div>
      
      <div className="flex flex-1 gap-4">
        <div className="flex-1 w-1/2 flex flex-col gap-4">
          <div className="flex w-full h-[15%] bg-blue-200 text-center items-center justify-center font-extrabold text-xl">
            시험별 평균 점수 ({currentGrade})
          </div>
          <div className="flex-1 w-full h-full">
            {chartData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-gray-500">
                데이터 없음
              </div>
            ) : (
              <ChartContainer
                config={chartConfig}
                className="h-full w-full p-4"
              >
                <LineChart
                  data={chartData}
                  margin={{ left: 24, right: 16, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" padding={{ left: 24, right: 24 }} />
                  <YAxis />
                  <ChartTooltip content={<AverageTooltip />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="var(--color-avg)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-avg)" }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  >
                    <LabelList
                      dataKey="avg"
                      position="bottom"
                      offset={6}
                      fill="var(--color-avg)"
                    />
                  </Line>
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 w-1/2 flex-1">
          <div className="flex w-full h-[15%] bg-red-200 text-center items-center justify-center font-extrabold text-xl">
            단원별 오답률 ({currentGrade})
          </div>
          <div className="flex-1 w-full h-full">
            {wrongChartData.length === 0 ? (
              <div className="flex h-full w-full items-center justify-center text-gray-500">
                데이터 없음
              </div>
            ) : (
              <ChartContainer
                config={wrongChartConfig}
                className="h-full w-full p-4"
              >
                <LineChart
                  data={wrongChartData}
                  margin={{ left: 24, right: 16, top: 8, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" padding={{ left: 24, right: 24 }} />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <ChartTooltip content={<WrongRateTooltip />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line
                    type="monotone"
                    dataKey="wrongRate"
                    stroke="var(--color-wrongRate)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-wrongRate)" }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  >
                    <LabelList
                      dataKey="wrongRate"
                      position="bottom"
                      offset={6}
                      fill="var(--color-wrongRate)"
                    />
                  </Line>
                </LineChart>
              </ChartContainer>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

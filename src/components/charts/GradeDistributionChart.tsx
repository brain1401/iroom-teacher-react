"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

/**
 * 성적 차트 데이터 타입
 * @description 성적 분포 차트에 사용되는 데이터 구조
 */
type GradeChartData = {
  /** 해당 점수대의 학생 수 */
  count: number;
  /** 성적 레벨 (상/중/하) */
  level: string;
  /** 점수 범위 (예: "90-100") */
  score: string;
};

/**
 * 레벨 정보 타입
 * @description 각 성적 레벨별 비율 정보
 */
type LevelInfo = {
  /** 성적 레벨 */
  level: string;
  /** 해당 레벨의 백분율 */
  percentage: number;
};

/**
 * 성적 분포 차트 컴포넌트 Props
 * @description 성적 분포를 시각화하는 차트 컴포넌트의 속성
 */
type GradeChartProps = {
  /** 차트에 표시할 데이터 */
  data: GradeChartData[];
  /** 차트 설정 (색상, 라벨 등) */
  chartConfig: ChartConfig;
  /** 레벨별 비율 정보 */
  levelInfo: LevelInfo[];
  /** 막대 클릭 시 호출되는 콜백 함수 */
  onBarClick?: (data: GradeChartData) => void;
};

/**
 * 커스텀 범례 컴포넌트
 * @description 성적 레벨별 색상과 비율을 표시하는 범례
 *
 * 주요 기능:
 * - 각 레벨(상/중/하)의 색상 표시
 * - 해당 레벨의 백분율 표시
 * - 차트 우측 상단에 위치
 *
 * @param levelInfo 레벨별 비율 정보
 * @param config 차트 설정 (색상, 라벨)
 */
function CustomLegend({
  levelInfo,
  config,
}: {
  levelInfo: LevelInfo[];
  config: ChartConfig;
}) {
  return (
    <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
      {levelInfo.map(({ level, percentage }) => (
        <div key={level} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm bg-chart-2"
            style={{ backgroundColor: config[level].color }}
          />
          {config[level].label} {percentage.toFixed(1)}%
        </div>
      ))}
    </div>
  );
}

/**
 * 성적 분포 차트 컴포넌트
 * @description 학생들의 성적 분포를 막대 그래프로 시각화
 *
 * 주요 기능:
 * - 점수대별 학생 수를 막대 그래프로 표시
 * - 성적 레벨(상/중/하)에 따른 색상 구분
 * - 각 막대 위에 학생 수 표시
 * - 레벨별 비율을 범례로 표시
 * - 막대 클릭 시 상세 정보 조회 가능
 *
 * 설계 원칙:
 * - 접근성 고려 (accessibilityLayer 적용)
 * - 반응형 디자인 (최소 높이 200px)
 * - 사용자 친화적 툴팁 제공
 * - 클릭 상호작용 지원
 *
 * @example
 * ```tsx
 * <GradeDistributionChart
 *   data={gradeData}
 *   chartConfig={config}
 *   levelInfo={levelStats}
 *   onBarClick={(data) => handleBarClick(data)}
 * />
 * ```
 */
export function GradeDistributionChart({
  data,
  chartConfig,
  levelInfo,
  onBarClick,
}: GradeChartProps) {
  return (
    <div className="flex flex-col gap-4 bg-chart-1">
      {/* 커스텀 범례 렌더링 */}
      <CustomLegend levelInfo={levelInfo} config={chartConfig} />

      {/* ChartContainer에 config 전달 */}
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <BarChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="score"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis
            label={{
              value: "학생 수 (명)",
              angle: -90,
              position: "insideLeft",
              offset: -10,
            }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, _name, props) => (
                  <>
                    <p>학생 수: {value}명</p>
                    <p>레벨: {props.payload.level}</p>
                  </>
                )}
              />
            }
          />
          <Bar
            dataKey="count"
            radius={4}
            fill="hsl(var(--chart-1))"
            onClick={(data) => onBarClick?.(data)}
            style={{ cursor: onBarClick ? "pointer" : "default" }}
          >
            {/* 막대 위에 값(학생 수) 표시 */}
            <LabelList
              dataKey="count"
              position="top"
              offset={5}
              formatter={(value: number) => (value > 0 ? `${value}명` : "")}
              fontSize={12}
            />
            {/* 막대별로 level에 따른 색상 적용 */}
            {data.map((entry) => (
              <Cell
                key={`${entry.level}-${entry.score}`}
                fill={chartConfig[entry.level]?.color || "hsl(var(--chart-1))"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
"use client";

import { Bar, BarChart, CartesianGrid, Cell, LabelList, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

// 데이터 타입 정의
type GradeChartData = {
  count: number;
  level: string;
  score: string;
};

//  level 데이터 타입 (레벨,퍼센트)
type LevelInfo = {
  level: string;
  percentage: number;
};

//
type GradeChartProps = {
  data: GradeChartData[];
  chartConfig: ChartConfig;
  levelInfo: LevelInfo[];
};


// config : 디자인 정보 객체 (색상,공식명칭)
// 상중하 퍼센트율 
const CustomLegend = ({ levelInfo, config }: { levelInfo: LevelInfo[], config: ChartConfig }) => {
  return (
    <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
      {levelInfo.map(({ level, percentage }) => (
        <div key={level} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm bg-chart-2"
            style={{ backgroundColor: config[level].color }} // config에서 색상 참조
          />
          {config[level].label} {percentage.toFixed(1)}%
        </div>
      ))}
    </div>
  );
};

export const GradeDistributionChart = ({ data, chartConfig, levelInfo }: GradeChartProps) => {
  return (
    <div className="flex flex-col gap-4 bg-chart-1">
      {/*  커스텀 범례 렌더링 */}
      <CustomLegend levelInfo={levelInfo} config={chartConfig} />

      {/*  ChartContainer에 config 전달 */}
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
          {/*  YAxis(세로축) label(학생 수) */}
          <YAxis
            label={{ value: "학생 수 (명)", angle: -90, position: "insideLeft", offset: -10 }}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value, name, props) => (
                  <>
                    <p>학생 수: {value}명</p>
                    <p>레벨: {props.payload.level}</p>
                  </>
                )}
              />
            }
          />
          {/* 데이터에서  count값으로 막대 그래프 */}
          <Bar dataKey="count" radius={4} fill="hsl(var(--chart-1))">
            {/* 막대 위에 값(학생 수) 표시 */}
            <LabelList
              dataKey="count"
              position="top"
              offset={5}
              formatter={(value: number) => (value > 0 ? `${value}명` : "")}
              //  숫자가 0보다 크면 '명' 표시
              fontSize={12}
            />
            {/* (cell) 막대별로 level에 따른 색상 적용 */}
            {data.map((entry, index) => (
              // entry : 각각의 항목(학생 정보)
              // index : 각각의 항목(학생 정보)의 인덱스
              <Cell
                key={`cell-${index}`}
                fill={chartConfig[entry.level].color || "hsl(var(--chart-1))"}
                //  fill : 현재 데이터(level)을 확인하고 그 레벨에 맞는 color적용
                // GradeDistributionChart에서 props로 받은 chartConfig에서 가져옴
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};
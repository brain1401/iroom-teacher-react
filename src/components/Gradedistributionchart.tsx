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

// 커스텀 컴포넌트(기본 범례 legend 대신 원하는 모양으로 )
// config : 디자인 정보 객체 (색상,공식명칭)
const CustomLegend = ({ levelInfo, config }: { levelInfo: LevelInfo[], config: ChartConfig }) => {
  return (
    <div className="flex items-center justify-end gap-4 text-sm text-muted-foreground">
      {levelInfo.map(({ level, percentage }) => (
        <div key={level} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-sm"
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
    <div className="flex flex-col gap-4">
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
          {/*  [수정] YAxis에 label 추가 */}
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
          <Bar dataKey="count" radius={4} fill="hsl(var(--chart-1))">
            {/*  [추가] 막대 위에 값(학생 수) 표시 */}
            <LabelList
              dataKey="count"
              position="top"
              offset={5}
              formatter={(value: number) => (value > 0 ? `${value}명` : "")}
              fontSize={12}
            />
            {/* [수정] 각 막대별로 level에 따른 색상 적용 */}
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartConfig[entry.level].color || "hsl(var(--chart-1))"}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};
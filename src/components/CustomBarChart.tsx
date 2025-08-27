// @/components/CustomBarChart.tsx (수정 후)

"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import React from "react"

interface CustomBarChartProps {
  chartData: Array<{ [key: string]: string | number }>;
  chartConfig: ChartConfig;
  className?: string;
  // 👇 X축의 키를 props로 받도록 추가
  xAxisDataKey: string;
}

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  chartData,
  chartConfig,
  className,
  // 👇 props에서 xAxisDataKey를 받음
  xAxisDataKey,
}) => {
  const dataKeys = Object.keys(chartConfig);

  return (
    <ChartContainer config={chartConfig} className={`min-h-[200px] w-full ${className}`}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          // 👇 고정된 "month" 대신 props로 받은 키를 사용
          dataKey={xAxisDataKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => String(value).slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        
        {dataKeys.map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={4}
          />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
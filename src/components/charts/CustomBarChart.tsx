"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import React from "react";

/**
 * 커스텀 막대 차트 컴포넌트 Props 타입
 * @description 재사용 가능한 막대 차트 컴포넌트의 속성을 정의
 */
type CustomBarChartProps = {
  /** 차트에 표시할 데이터 배열 */
  chartData: Array<{ [key: string]: string | number }>;
  /** 차트 설정 (색상, 라벨 등) */
  chartConfig: ChartConfig;
  /** 추가 CSS 클래스 */
  className?: string;
  /** X축에 사용할 데이터 키 */
  xAxisDataKey: string;
};

/**
 * 커스텀 막대 차트 컴포넌트
 * @description 다양한 데이터를 막대 그래프로 시각화하는 재사용 가능한 차트 컴포넌트
 *
 * 주요 기능:
 * - 동적 데이터 키 지원 (chartConfig에서 자동 추출)
 * - 커스터마이징 가능한 X축 데이터 키
 * - 반응형 디자인 (최소 높이 200px)
 * - 접근성 지원 (accessibilityLayer)
 * - 툴팁과 범례 자동 생성
 * - 커스터마이징 가능한 스타일링
 *
 * 설계 원칙:
 * - 재사용성: 다양한 데이터 구조에 적용 가능
 * - 접근성: 스크린 리더 지원
 * - 성능: 불필요한 리렌더링 방지
 * - 일관성: shadcn/ui 차트 시스템과 통합
 *
 * @example
 * ```tsx
 * // 월별 판매 데이터 차트
 * const salesData = [
 *   { month: "January", sales: 1200, profit: 800 },
 *   { month: "February", sales: 1500, profit: 1100 },
 *   { month: "March", sales: 1800, profit: 1300 }
 * ];
 *
 * const salesConfig = {
 *   sales: {
 *     label: "매출",
 *     color: "hsl(var(--chart-1))"
 *   },
 *   profit: {
 *     label: "순이익", 
 *     color: "hsl(var(--chart-2))"
 *   }
 * };
 *
 * <CustomBarChart
 *   chartData={salesData}
 *   chartConfig={salesConfig}
 *   xAxisDataKey="month"
 *   className="h-[300px]"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // 학년별 학생 수 데이터 차트
 * const studentData = [
 *   { grade: "1학년", male: 45, female: 38 },
 *   { grade: "2학년", male: 52, female: 41 },
 *   { grade: "3학년", male: 48, female: 44 }
 * ];
 *
 * const studentConfig = {
 *   male: {
 *     label: "남학생",
 *     color: "hsl(220, 70%, 50%)"
 *   },
 *   female: {
 *     label: "여학생",
 *     color: "hsl(340, 75%, 55%)"
 *   }
 * };
 *
 * <CustomBarChart
 *   chartData={studentData}
 *   chartConfig={studentConfig}
 *   xAxisDataKey="grade"
 * />
 * ```
 */
export function CustomBarChart({
  chartData,
  chartConfig,
  className,
  xAxisDataKey,
}: CustomBarChartProps) {
  // chartConfig에서 데이터 키들을 추출
  const dataKeys = Object.keys(chartConfig);

  return (
    <ChartContainer
      config={chartConfig}
      className={`min-h-[200px] w-full ${className || ""}`}
    >
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xAxisDataKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => String(value).slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />

        {/* chartConfig의 각 키에 대해 막대 생성 */}
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
  );
}
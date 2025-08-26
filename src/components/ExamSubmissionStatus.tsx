import React, { useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

/**
 * 시험 제출 현황 카드 변형 타입
 */
type ExamSubmissionStatusVariant = "default" | "compact";

/**
 * 시험 제출 현황 카드 크기 타입
 */
type ExamSubmissionStatusSize = "sm" | "md" | "lg";

const examSubmissionStatusVariants = cva(
  // cva : 디자인 옵션 정의
  "group relative flex flex-col bg-white border border-gray-200 rounded-xl p-4 transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
  {
    variants: {
      variant: {
        default: "",
        compact: "p-3",
      },
      size: {
        sm: "min-h-[80px]",
        md: "min-h-[100px]",
        lg: "min-h-[120px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

/**
 * 시험 제출 현황 카드 컴포넌트 Props 타입
 */
type ExamSubmissionStatusProps = {
  /** 단원 이름 */
  unitName: string;
  /** 제출 인원 */
  submittedCount: number;
  /** 전체 인원 */
  totalStudents: number;
  /** 제출률 (0-100) */
  submissionRate: number;
  /** 카드 변형 */
  variant?: ExamSubmissionStatusVariant;
  /** 카드 크기 */
  size?: ExamSubmissionStatusSize;
  /** 진행바 표시 여부 */
  showProgressBar?: boolean;
  /** 뒤로가기 버튼 표시 여부 */
  showBackButton?: boolean;
  /** 카드 클릭 핸들러 */
  onClick?: () => void;
  /** 뒤로가기 버튼 클릭 핸들러 */
  onBackClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 자식 요소 */
  children?: React.ReactNode;
} & VariantProps<typeof examSubmissionStatusVariants>;

/**
 * 시험 제출 현황 카드 컴포넌트
 * @description 단원 이름, 제출 현황, 제출률을 표시하는 재사용 가능한 카드
 *
 * @example
 * ```tsx
 * <ExamSubmissionStatus
 * unitName="수학 단원 평가 : 연립방정식"
 * submittedCount={23}
 * totalStudents={28}
 * submissionRate={82}
 * onClick={() => console.log('Card clicked!')}
 * />
 * ```
 */
export const ExamSubmissionStatus = React.memo<ExamSubmissionStatusProps>(
  ({
    unitName,
    submittedCount,
    totalStudents,
    submissionRate,
    variant = "default",
    size = "md",
    showProgressBar = true,
    showBackButton = false,
    onClick,
    onBackClick,
    className,
    children,
    ...props
  }) => {
    // 계산 로직
    const submissionRateText = `제출률 ${submissionRate}%`;
    const submissionCountText = `${submittedCount}/${totalStudents}`;

    /**
     * 키보드 이벤트 핸들러
     */
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if ((event.key === "Enter" || event.key === " ") && onClick) {
          event.preventDefault();
          onClick();
        }
      },
      [onClick],
    );

    /**
     * 뒤로가기 버튼 클릭 핸들러
     */
    const handleBackClick = useCallback(
      (event: React.MouseEvent) => {
        event.stopPropagation();
        onBackClick?.();
      },
      [onBackClick],
    );

    return (
      <article
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        className={cn(
          examSubmissionStatusVariants({ variant, size }),
          onClick && "cursor-pointer",
          className,
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={
          onClick
            ? `${unitName}, ${submissionRateText}, 총 ${totalStudents}명 중 ${submittedCount}명 제출`
            : undefined
        }
        {...props}
      >
        {/* 헤더 영역: 단원 이름과 제출 인원 */}
        <header className="mb-3 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base leading-tight font-bold text-black">
              <span className="mr-2 inline-block rounded-2xl bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-600">
                시험
              </span>
              {unitName}
            </h3>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-sm font-medium text-gray-600">
              {submissionCountText}
            </span>
          </div>

          {showBackButton && onBackClick && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 size-6 shrink-0 hover:bg-gray-100"
              onClick={handleBackClick}
              aria-label="뒤로가기"
            >
              <ChevronLeft className="size-4" />
            </Button>
          )}
        </header>

        {/* 진행바 영역 (제출률) */}
        {showProgressBar && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">
              {submissionRateText}
            </p>
            <Progress
              value={submissionRate}
              className="h-2 bg-gray-200 [&>div]:bg-blue-600"
              aria-label={`제출률 ${submissionRate}%`}
            />
          </div>
        )}

        {/* 추가 컨텐츠 영역 */}
        {children && (
          <div className="mt-4 border-t border-gray-100 pt-4">{children}</div>
        )}
      </article>
    );
  },
);

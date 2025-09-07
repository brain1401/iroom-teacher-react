import React, { useCallback } from "react";
import { ChevronLeft } from "lucide-react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/**
 * 시험 제출 현황 카드 변형 타입
 * @description 카드 스타일 변형을 정의
 */
type ExamSubmissionStatusVariant = "default" | "compact";

/**
 * 시험 제출 현황 카드 크기 타입
 * @description 카드 크기 옵션을 정의
 */
type ExamSubmissionStatusSize = "sm" | "md" | "lg";

/**
 * cva를 사용한 스타일 변형 정의
 * @description 다양한 변형과 크기에 따른 스타일을 체계적으로 관리
 */
const examSubmissionStatusVariants = cva(
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
 * @description 시험 제출 현황을 표시하는 카드 컴포넌트의 모든 속성을 정의 (서버 데이터 구조에 맞춤)
 */
type ExamSubmissionStatusProps = {
  /** 시험 이름 (서버 필드명: examName) */
  examName: string;
  /** 실제 제출 인원 수 (서버 필드명: actualSubmissions) */
  actualSubmissions: number;
  /** 최대 학생 수 (서버 필드명: maxStudent) */
  maxStudent: number;
  /** 제출률 (0-100 퍼센트) */
  submissionRate: number;
  /** 카드 스타일 변형 */
  variant?: ExamSubmissionStatusVariant;
  /** 카드 크기 */
  size?: ExamSubmissionStatusSize;
  /** 진행바 표시 여부 */
  showProgressBar?: boolean;
  /** 뒤로가기 버튼 표시 여부 */
  showBackButton?: boolean;
  /** 카드 클릭 시 호출되는 핸들러 */
  onClick?: () => void;
  /** 뒤로가기 버튼 클릭 시 호출되는 핸들러 */
  onBackClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 자식 요소 (추가 컨텐츠) */
  children?: React.ReactNode;
} & VariantProps<typeof examSubmissionStatusVariants>;

/**
 * 시험 제출 현황 카드 컴포넌트
 * @description 단원별 시험 제출 현황을 시각적으로 표시하는 재사용 가능한 카드 컴포넌트
 *
 * 주요 기능:
 * - 단원명과 제출 현황 정보 표시
 * - 제출률을 진행바로 시각화
 * - 클릭 상호작용 지원
 * - 키보드 네비게이션 지원 (Enter, Space)
 * - 접근성 고려 (ARIA 라벨, 시맨틱 HTML)
 * - 다양한 크기와 스타일 변형 지원
 *
 * 설계 원칙:
 * - 접근성 우선 (role, tabIndex, aria-label)
 * - 재사용 가능한 컴포넌트 디자인
 * - 성능 최적화 (React.memo 사용)
 * - 키보드 및 마우스 상호작용 지원
 * - 반응형 디자인 고려
 *
 * @example
 * ```tsx
 * // 기본 사용법 (서버 데이터 구조 사용)
 * <ExamSubmissionStatus
 *   examName="수학 단원 평가: 연립방정식"
 *   actualSubmissions={23}
 *   maxStudent={28}
 *   submissionRate={82}
 *   onClick={() => handleCardClick()}
 * />
 *
 * // 컴팩트 크기와 뒤로가기 버튼 포함
 * <ExamSubmissionStatus
 *   examName="영어 단원 평가: 현재완료시제"
 *   actualSubmissions={15}
 *   maxStudent={20}
 *   submissionRate={75}
 *   variant="compact"
 *   size="sm"
 *   showBackButton
 *   onBackClick={() => handleBackClick()}
 * />
 *
 * // 추가 컨텐츠와 함께
 * <ExamSubmissionStatus
 *   examName="과학 단원 평가: 화학반응"
 *   actualSubmissions={30}
 *   maxStudent={32}
 *   submissionRate={94}
 * >
 *   <div>추가 정보나 액션 버튼들</div>
 * </ExamSubmissionStatus>
 * ```
 */
export const ExamSubmissionStatus = React.memo<ExamSubmissionStatusProps>(
  ({
    examName,
    actualSubmissions,
    maxStudent,
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
    // 표시용 텍스트 생성 (서버 데이터 필드명 사용)
    const submissionRateText = `제출률 ${submissionRate}%`;
    const submissionCountText = `${actualSubmissions}/${maxStudent}`;

    /**
     * 키보드 이벤트 핸들러
     * @description Enter 또는 Space 키를 눌렀을 때 onClick 핸들러 실행
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
     * @description 이벤트 버블링을 방지하고 뒤로가기 핸들러 실행
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
            ? `${examName}, ${submissionRateText}, 총 ${maxStudent}명 중 ${actualSubmissions}명 제출`
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
              {examName}
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

/**
 * 시험 관리 로딩 상태 컴포넌트들
 * @description 다양한 시험 관리 상황에 맞는 로딩 UI 컴포넌트 모음
 *
 * 주요 특징:
 * - 맥락에 맞는 로딩 메시지
 * - 스켈레톤 UI로 레이아웃 안정성 확보
 * - 진행률 표시 및 예상 시간 제공
 * - 접근성 고려 (aria-live, screen reader 지원)
 * - 취소 가능한 작업에 대한 취소 버튼
 */

import React, { useEffect, useState } from "react";
import {
  Loader2,
  Clock,
  CheckCircle,
  X,
  FileText,
  Users,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * 기본 로딩 스피너 Props
 */
type LoadingSpinnerProps = {
  /** 로딩 메시지 */
  message?: string;
  /** 아이콘 크기 */
  size?: "sm" | "md" | "lg";
  /** 세로 정렬 여부 */
  isVertical?: boolean;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 기본 로딩 스피너 컴포넌트
 * @description 간단한 로딩 상황에서 사용하는 기본 스피너
 */
export function LoadingSpinner({
  message = "로딩 중...",
  size = "md",
  isVertical = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const containerClasses = isVertical
    ? "flex-col items-center space-y-2"
    : "items-center space-x-2";

  return (
    <div
      className={cn("flex", containerClasses, className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
}

/**
 * 시험 목록 로딩 스켈레톤 Props
 */
type ExamListLoadingProps = {
  /** 표시할 스켈레톤 아이템 수 */
  itemCount?: number;
  /** 헤더 스켈레톤 표시 여부 */
  isShowHeader?: boolean;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 시험 목록 로딩 스켈레톤
 * @description 시험 목록 테이블의 로딩 상태를 표현하는 스켈레톤 UI
 */
export function ExamListLoadingSkeleton({
  itemCount = 5,
  isShowHeader = true,
  className,
}: ExamListLoadingProps) {
  return (
    <div
      className={cn("space-y-4", className)}
      role="status"
      aria-label="시험 목록 로딩 중"
    >
      {/* 헤더 스켈레톤 */}
      {isShowHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      )}

      {/* 테이블 스켈레톤 */}
      <Card>
        <CardContent className="p-0">
          {/* 테이블 헤더 */}
          <div className="flex items-center p-4 border-b bg-muted/50">
            <Skeleton className="h-4 w-4 mr-4" />
            <Skeleton className="h-4 w-32 mr-8" />
            <Skeleton className="h-4 w-24 mr-8" />
            <Skeleton className="h-4 w-20 mr-8" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* 테이블 행들 */}
          {Array.from({ length: itemCount }).map(() => {
            const key = Math.random().toString(36).substr(2, 9);
            return (
              <div
                key={`skeleton-item-${key}`}
                className="flex items-center p-4 border-b last:border-b-0"
              >
                <Skeleton className="h-4 w-4 mr-4" />
                <div className="flex-1 space-y-1 mr-8">
                  <Skeleton className="h-4 w-full max-w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-16 mr-8" />
                <Skeleton className="h-4 w-20 mr-8" />
                <div className="flex space-x-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 페이지네이션 스켈레톤 */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * 시험 상세 로딩 Props
 */
type ExamDetailLoadingProps = {
  /** 제목 */
  title?: string;
  /** 예상 로딩 시간 (초) */
  estimatedTime?: number;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 시험 상세 로딩 컴포넌트
 * @description 시험 상세 정보 로딩 시 사용하는 컴포넌트
 */
export function ExamDetailLoading({
  title = "시험 상세 정보 로딩 중",
  estimatedTime,
  className,
}: ExamDetailLoadingProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>소요 시간: {elapsed}초</span>
              {estimatedTime && (
                <Badge variant="outline" className="ml-2">
                  예상 {estimatedTime}초
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <div className="flex-1">
            <div className="text-sm font-medium">상세 정보 불러오는 중...</div>
            <div className="text-xs text-muted-foreground">
              시험 기본정보, 제출현황, 통계를 가져오고 있습니다.
            </div>
          </div>
        </div>

        {/* 로딩 단계 표시 */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>시험 기본 정보 로드 완료</span>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span>제출 현황 조회 중...</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>통계 데이터 대기 중...</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 진행률 기반 로딩 Props
 */
type ProgressLoadingProps = {
  /** 진행률 (0-100) */
  progress: number;
  /** 제목 */
  title: string;
  /** 현재 진행 단계 설명 */
  description?: string;
  /** 취소 버튼 표시 여부 */
  isCancellable?: boolean;
  /** 취소 핸들러 */
  onCancel?: () => void;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 진행률 기반 로딩 컴포넌트
 * @description 파일 다운로드, 업로드, 데이터 처리 등에 사용
 */
export function ProgressLoading({
  progress,
  title,
  description,
  isCancellable = false,
  onCancel,
  className,
}: ProgressLoadingProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5 text-primary" />
          <span>{title}</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}

        {isCancellable && onCancel && (
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            취소
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 제출 현황 로딩 Props
 */
type SubmissionLoadingProps = {
  /** 학생 수 */
  studentCount?: number;
  /** 예상 시간 */
  estimatedTime?: number;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 제출 현황 로딩 컴포넌트
 * @description 시험 제출 현황 조회 시 사용하는 로딩 컴포넌트
 */
export function SubmissionStatusLoading({
  studentCount,
  estimatedTime,
  className,
}: SubmissionLoadingProps) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Users className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>제출 현황 조회 중</CardTitle>
            {studentCount && (
              <p className="text-sm text-muted-foreground">
                {studentCount}명의 학생 제출 현황을 확인하고 있습니다
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-center py-6">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <div className="space-y-1">
              <div className="text-sm font-medium">
                실시간 데이터 수집 중...
              </div>
              <div className="text-xs text-muted-foreground">
                최신 제출 현황과 통계를 가져오고 있습니다
              </div>
              {estimatedTime && (
                <Badge variant="outline" className="text-xs">
                  예상 {estimatedTime}초
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 인라인 로딩 Props
 */
type InlineLoadingProps = {
  /** 로딩 텍스트 */
  text: string;
  /** 크기 */
  size?: "sm" | "md";
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 인라인 로딩 컴포넌트
 * @description 버튼이나 인라인 요소에 사용하는 작은 로딩 표시
 */
export function InlineLoading({
  text,
  size = "sm",
  className,
}: InlineLoadingProps) {
  const spinnerSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Loader2 className={cn(spinnerSize, "animate-spin")} />
      <span className={cn(textSize, "text-muted-foreground")}>{text}</span>
    </div>
  );
}

/**
 * 풀 페이지 로딩 Props
 */
type FullPageLoadingProps = {
  /** 제목 */
  title?: string;
  /** 설명 */
  description?: string;
  /** 로고나 아이콘 */
  icon?: React.ReactNode;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 풀 페이지 로딩 컴포넌트
 * @description 전체 페이지 로딩 시 사용하는 중앙 정렬 로딩 화면
 */
export function FullPageLoading({
  title = "로딩 중",
  description = "잠시만 기다려주세요...",
  icon,
  className,
}: FullPageLoadingProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        className,
      )}
    >
      <div className="text-center space-y-4 max-w-sm">
        {icon || (
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        )}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * 시험 관리 전용 에러 바운더리 컴포넌트
 * @description 시험 관련 컴포넌트의 JavaScript 에러를 포착하고 복구 UI 제공
 *
 * 주요 기능:
 * - React Error Boundary로 컴포넌트 트리 에러 포착
 * - 시험 관리 맥락에 맞는 에러 메시지 제공
 * - 에러 복구 액션 (새로고침, 홈으로 이동 등)
 * - 개발 환경에서 상세 에러 정보 표시
 * - 에러 로깅 및 모니터링 연동 준비
 */

import React from "react";
import { AlertTriangle, RefreshCw, Home, ChevronLeft, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * 에러 바운더리 상태 타입
 */
type ErrorBoundaryState = {
  /** 에러 발생 여부 */
  hasError: boolean;
  /** 포착된 에러 객체 */
  error: Error | null;
  /** React 에러 정보 */
  errorInfo: React.ErrorInfo | null;
  /** 에러 발생 시간 */
  errorTime: Date | null;
  /** 재시도 횟수 */
  retryCount: number;
};

/**
 * 에러 바운더리 Props
 */
type ExamErrorBoundaryProps = {
  /** 자식 컴포넌트 */
  children: React.ReactNode;
  /** 폴백 UI 제목 (선택적) */
  fallbackTitle?: string;
  /** 폴백 UI 설명 (선택적) */
  fallbackDescription?: string;
  /** 에러 발생 시 호출될 콜백 (선택적) */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** 홈 버튼 표시 여부 (기본: true) */
  showHomeButton?: boolean;
  /** 뒤로가기 버튼 표시 여부 (기본: true) */
  showBackButton?: boolean;
  /** 개발자 정보 표시 여부 (기본: 개발 환경에서만) */
  showDeveloperInfo?: boolean;
  /** 커스텀 CSS 클래스 */
  className?: string;
};

/**
 * 시험 관리 에러 바운더리
 * @description 시험 관련 컴포넌트에서 발생하는 런타임 에러를 포착하고 사용자 친화적 UI 제공
 *
 * 에러 처리 전략:
 * 1. **에러 포착**: JavaScript 에러를 React Error Boundary로 포착
 * 2. **에러 분류**: 네트워크, 데이터, 렌더링 에러 등으로 분류
 * 3. **복구 제안**: 사용자가 취할 수 있는 복구 액션 제시
 * 4. **개발 지원**: 개발 환경에서 디버깅 정보 제공
 * 5. **모니터링**: 프로덕션 환경에서 에러 로깅 (향후 확장)
 *
 * @example
 * ```tsx
 * // 기본 사용법
 * <ExamErrorBoundary>
 *   <ExamListTable />
 * </ExamErrorBoundary>
 *
 * // 커스텀 설정
 * <ExamErrorBoundary
 *   fallbackTitle="시험 목록 오류"
 *   onError={(error, info) => logError(error, info)}
 *   showDeveloperInfo={true}
 * >
 *   <ComplexExamComponent />
 * </ExamErrorBoundary>
 * ```
 */
export class ExamErrorBoundary extends React.Component<
  ExamErrorBoundaryProps,
  ErrorBoundaryState
> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ExamErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorTime: null,
      retryCount: 0,
    };
  }

  /**
   * 에러 포착 시 호출되는 라이프사이클 메서드
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorTime: new Date(),
    };
  }

  /**
   * 에러 정보 수집 및 로깅
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 에러 로깅
    console.error("[ExamErrorBoundary] 컴포넌트 에러 포착:", error, errorInfo);

    // 프로덕션 환경에서는 에러 모니터링 서비스로 전송
    if (process.env.NODE_ENV === "production") {
      // TODO: 에러 모니터링 서비스 연동 (Sentry, LogRocket 등)
      this.logErrorToMonitoring(error, errorInfo);
    }

    // 사용자 정의 에러 콜백 호출
    this.props.onError?.(error, errorInfo);
  }

  /**
   * 컴포넌트 언마운트 시 정리
   */
  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  /**
   * 에러 모니터링 서비스로 에러 전송 (향후 구현)
   */
  private logErrorToMonitoring(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: 실제 모니터링 서비스 연동
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount,
    };

    console.info("[ExamErrorBoundary] 에러 로깅 데이터:", errorData);
  }

  /**
   * 에러 타입 분류
   */
  private classifyError(error: Error): {
    type: "network" | "data" | "render" | "permission" | "unknown";
    severity: "low" | "medium" | "high" | "critical";
    recoverable: boolean;
  } {
    const message = error.message.toLowerCase();

    // 네트워크 관련 에러
    if (message.includes("network") || message.includes("fetch")) {
      return { type: "network", severity: "medium", recoverable: true };
    }

    // 데이터 관련 에러
    if (
      message.includes("cannot read") ||
      message.includes("undefined") ||
      message.includes("null")
    ) {
      return { type: "data", severity: "high", recoverable: true };
    }

    // 권한 관련 에러
    if (message.includes("permission") || message.includes("unauthorized")) {
      return { type: "permission", severity: "high", recoverable: false };
    }

    // 렌더링 관련 에러
    if (message.includes("render") || message.includes("element")) {
      return { type: "render", severity: "critical", recoverable: true };
    }

    // 기타 알 수 없는 에러
    return { type: "unknown", severity: "medium", recoverable: true };
  }

  /**
   * 에러 복구 시도
   */
  private handleRetry = () => {
    const maxRetries = 3;

    if (this.state.retryCount >= maxRetries) {
      alert("최대 재시도 횟수에 도달했습니다. 페이지를 새로고침해주세요.");
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorTime: null,
      retryCount: prevState.retryCount + 1,
    }));

    // 잠시 후 에러가 다시 발생하면 재시도 카운트 리셋
    this.retryTimeoutId = setTimeout(() => {
      this.setState({ retryCount: 0 });
    }, 30000); // 30초 후 리셋
  };

  /**
   * 홈으로 이동
   */
  private handleGoHome = () => {
    window.location.href = "/main";
  };

  /**
   * 뒤로가기
   */
  private handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.handleGoHome();
    }
  };

  /**
   * 페이지 새로고침
   */
  private handleRefresh = () => {
    window.location.reload();
  };

  render() {
    const {
      children,
      fallbackTitle = "시험 관리 오류",
      fallbackDescription = "예상치 못한 오류가 발생했습니다.",
      showHomeButton = true,
      showBackButton = true,
      showDeveloperInfo = process.env.NODE_ENV === "development",
      className,
    } = this.props;

    if (!this.state.hasError) {
      return children;
    }

    const { error, errorTime, retryCount } = this.state;
    const errorClassification = error ? this.classifyError(error) : null;

    return (
      <div className={cn("w-full h-full flex items-center justify-center p-8", className)}>
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <CardTitle className="text-red-600">{fallbackTitle}</CardTitle>
                {errorClassification && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="destructive" className="text-xs">
                      {errorClassification.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {errorClassification.severity}
                    </Badge>
                    {retryCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        재시도 {retryCount}회
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>오류 발생</AlertTitle>
              <AlertDescription>
                {fallbackDescription}
                {errorTime && (
                  <div className="text-xs mt-1 text-muted-foreground">
                    발생 시간: {errorTime.toLocaleString("ko-KR")}
                  </div>
                )}
              </AlertDescription>
            </Alert>

            {/* 복구 액션 버튼들 */}
            <div className="flex flex-wrap gap-2">
              {errorClassification?.recoverable && (
                <Button
                  variant="default"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="h-4 w-4" />
                  다시 시도 {retryCount >= 3 && "(최대 재시도)"}
                </Button>
              )}

              <Button
                variant="outline"
                onClick={this.handleRefresh}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                페이지 새로고침
              </Button>

              {showBackButton && (
                <Button
                  variant="outline"
                  onClick={this.handleGoBack}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  뒤로가기
                </Button>
              )}

              {showHomeButton && (
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  홈으로
                </Button>
              )}
            </div>

            {/* 개발자 정보 (개발 환경에서만) */}
            {showDeveloperInfo && error && (
              <>
                <Separator />
                <details className="space-y-2">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                    <Bug className="h-4 w-4" />
                    개발자 정보
                  </summary>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong>에러 메시지:</strong>
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                        {error.message}
                      </pre>
                    </div>
                    {error.stack && (
                      <div>
                        <strong>스택 트레이스:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <strong>컴포넌트 스택:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

/**
 * 함수형 래퍼 컴포넌트
 * @description hooks를 사용할 수 있는 함수형 에러 바운더리 래퍼
 */
export function ExamErrorBoundaryWrapper(props: ExamErrorBoundaryProps) {
  return <ExamErrorBoundary {...props} />;
}
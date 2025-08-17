import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ClassValue } from "clsx";

/**
 * 클래스명 조합 유틸리티 함수 (className의 줄임말)
 *
 * clsx와 tailwind-merge 조합으로 조건부 클래스명 생성과
 * Tailwind CSS 클래스 충돌 해결을 동시에 처리하는 핵심 유틸리티
 * shadcn/ui 컴포넌트에서 표준으로 사용하는 패턴
 *
 * @param inputs - 다양한 형태의 클래스명 입력값들
 * @returns 최적화되고 중복이 제거된 클래스명 문자열
 *
 * 주요 기능:
 * 1. clsx: 조건부 클래스명 생성 (문자열, 객체, 배열, 조건식 지원)
 * 2. twMerge: Tailwind CSS 클래스 충돌 해결 (동일 속성의 마지막 클래스만 적용)
 *
 * 사용 예시:
 * ```tsx
 * // 기본 사용
 * cn("text-red-500", "bg-blue-500") // "text-red-500 bg-blue-500"
 *
 * // 조건부 클래스
 * cn("base-class", isActive && "active-class") // isActive가 true일 때만 "active-class" 추가
 *
 * // 객체 형태 조건
 * cn("base-class", { "error-class": hasError, "success-class": isSuccess })
 *
 * // Tailwind 충돌 해결
 * cn("text-red-500", "text-blue-500") // "text-blue-500" (마지막 값만 적용)
 * cn("px-4", "px-6") // "px-6" (동일 속성의 충돌 해결)
 * ```
 *
 * shadcn/ui 컴포넌트 사용 패턴:
 * ```tsx
 * <Button className={cn("default-styles", variant === "destructive" && "destructive-styles", className)}>
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

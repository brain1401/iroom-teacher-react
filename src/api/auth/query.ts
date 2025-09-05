import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "./api";
import type { CurrentUserResponse } from "./types";

/**
 * Auth API를 위한 쿼리 키 팩토리
 * @description React Query에서 사용할 일관된 쿼리 키 생성
 */
export const authKeys = {
  /** 모든 auth 관련 쿼리의 기본 키 */
  all: ["auth"] as const,
  /** 현재 사용자 정보 쿼리 키 */
  currentUser: () => [...authKeys.all, "currentUser"] as const,
} as const;

/**
 * 현재 사용자 정보 쿼리 옵션
 * @description 현재 로그인된 사용자 정보를 조회하는 React Query 옵션
 *
 * 주요 설정:
 * - 30분간 fresh 상태 유지 (사용자 정보는 자주 변하지 않음)
 * - 1시간간 캐시 유지
 * - 재시도 1회만 (인증 에러는 빠른 실패가 좋음)
 * - 백그라운드 리페치 비활성화 (보안상 이유)
 *
 * @returns React Query 옵션 객체
 *
 * @example
 * ```typescript
 * // Jotai와 함께 사용
 * const currentUserQueryAtom = atomWithQuery(() => currentUserQueryOptions());
 * 
 * // 컴포넌트에서 사용
 * const { data: user, isLoading, error } = useQuery(currentUserQueryOptions());
 * ```
 */
export const currentUserQueryOptions = () => {
  return queryOptions({
    queryKey: authKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 30 * 60 * 1000, // 30분간 fresh
    gcTime: 60 * 60 * 1000, // 1시간간 캐시
    retry: 1, // 인증 에러는 1회만 재시도
    refetchOnWindowFocus: false, // 보안상 자동 리페치 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 자동 리페치 비활성화
  });
};

/**
 * 사용자 프로필 쿼리 옵션 (미래 확장용)
 * @description 사용자 상세 프로필 정보 조회 옵션
 */
export const userProfileQueryOptions = (userId: number) => {
  return queryOptions({
    queryKey: [...authKeys.all, "profile", userId] as const,
    queryFn: () => {
      throw new Error("사용자 프로필 API는 아직 구현되지 않았습니다.");
    },
    enabled: false, // 기본적으로 비활성화
  });
};
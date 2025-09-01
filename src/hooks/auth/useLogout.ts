import { useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/api/auth";
import { getErrorMessage, logError } from "@/utils/errorHandling";

/**
 * 로그아웃 커스텀 훅
 * @description 로그아웃 API 호출과 로그인 페이지 리다이렉트를 처리하는 훅
 *
 * 주요 기능:
 * - 로그아웃 API 호출
 * - 에러 처리 및 로깅
 * - 로그인 페이지로 자동 리다이렉트
 * - 로딩 상태 관리
 *
 * @returns 로그아웃 관련 상태와 핸들러
 *
 * @example
 * ```typescript
 * function HeaderComponent() {
 *   const { handleLogout, isLoggingOut } = useLogout();
 *
 *   return (
 *     <Button
 *       onClick={handleLogout}
 *       disabled={isLoggingOut}
 *     >
 *       {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
 *     </Button>
 *   );
 * }
 * ```
 */
export function useLogout() {
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: (data) => {
      // 로그아웃 성공 시 로그인 페이지로 리다이렉트
      console.log("로그아웃 성공:", data.message);
      navigate({ to: "/" });
    },
    onError: (error) => {
      // 에러 로깅
      logError(error, "useLogout");

      // 사용자에게 에러 메시지 표시 (필요시 토스트 등 사용)
      const errorMessage = getErrorMessage(error);
      console.error("로그아웃 실패:", errorMessage);

      // 네트워크 에러 등으로 인해 로그아웃이 실패해도
      // 클라이언트 상태를 초기화하고 로그인 페이지로 이동
      navigate({ to: "/" });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    handleLogout,
    isLoggingOut: logoutMutation.isPending,
    error: logoutMutation.error,
  };
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSetAtom } from "jotai";
import { loginAtom } from "@/atoms/auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/errorHandling";

/**
 * 로그인 섹션 컴포넌트
 * @description 서버 API 연동이 준비된 로그인 폼 컴포넌트
 *
 * 주요 개선사항:
 * - 서버 API 기반 인증 시스템 연동
 * - 체계적인 에러 처리 및 사용자 친화적 메시지
 * - 타입 안전성 보장된 로그인 플로우
 * - React Query 캐시 연동으로 사용자 정보 자동 관리
 *
 * 지원 계정:
 * - admin/1234 (관리자)
 * - teacher/1234 (교사)
 */
export function LoginSection() {
  const navigate = useNavigate();
  const login = useSetAtom(loginAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password.trim()) {
      toast.error("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        toast.success(`환영합니다, ${result.user?.name}님!`);

        // 로그인 성공 시 메인 페이지로 이동
        // 약간의 지연으로 토스트 메시지를 사용자가 볼 수 있도록 함
        setTimeout(() => {
          navigate({ to: "/main" });
        }, 500);
      }
    } catch (error) {
      // 구조화된 에러 메시지 처리
      const friendlyMessage = getErrorMessage(error);
      toast.error(friendlyMessage);

      console.error("[LoginSection] 로그인 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 개발용 계정 정보 안내
  const handleDemoLogin = (username: string, password: string) => {
    setFormData({ username, password });
  };

  return (
    <>
      {/* 왼쪽 로그인 폼 영역 - 흰색 배경 */}
      <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">
          {/* 로그인 헤더 */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              관리자 로그인
            </h2>
            <p className="text-gray-600">시스템에 접근하려면 로그인하세요.</p>
          </div>

          {/* 로그인 폼 */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                아이디
              </Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="아이디를 입력하세요"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                비밀번호
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  로그인 중...
                </div>
              ) : (
                "로그인"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

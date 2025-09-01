import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAtom } from "jotai";
import { loginAtom } from "@/atoms/auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

/**
 * 로그인 섹션 컴포넌트
 * 좌우 분할 레이아웃으로 브랜딩 영역과 로그인 폼을 분리
 */
export function LoginSection() {
  const navigate = useNavigate();
  const [, login] = useAtom(loginAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(formData);
      if (result.success) {
        toast.success("로그인되었습니다!");
        // 약간의 지연 후 네비게이션 (상태 업데이트 완료 대기)
        setTimeout(() => {
          navigate({ to: "/main" });
        }, 100);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "로그인에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </form>

          {/* 추가 링크 */}
        </div>
      </div>
    </>
  );
}

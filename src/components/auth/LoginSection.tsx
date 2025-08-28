import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * 로그인 섹션 컴포넌트
 * 좌우 분할 레이아웃으로 브랜딩 영역과 로그인 폼을 분리
 */
export function LoginSection() {
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
          <form className="space-y-6" action="" method="post">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-700 font-medium">
                아이디
              </Label>
              <Input
                id="username"
                name="username"
                placeholder="아이디를 입력하세요"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                placeholder="비밀번호를 입력하세요"
                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              로그인
            </Button>
          </form>

          {/* 추가 링크 */}
        </div>
      </div>
    </>
  );
}

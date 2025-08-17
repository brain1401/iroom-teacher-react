import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";

/**
 * 로그인 섹션 컴포넌트
 * 브랜딩, 로그인 폼, 회원가입 링크를 포함하는 왼쪽 영역
 */
export function LoginSection() {
  return (
    <div className="bg-background space-y-8 p-8 md:p-10">
      {/* 브랜딩 영역 */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/15 text-violet-600">
          <BookOpen size={20} />
        </div>
        <div className="text-2xl font-bold">이룸클래스</div>
      </div>

      {/* 서비스 설명 */}
      <div className="text-muted-foreground">
        성장의 모든 순간을 함께하겠습니다
      </div>

      {/* 로그인 폼 */}
      <form className="space-y-4" action="" method="post">
        <div className="space-y-2">
          <Label htmlFor="username">아이디</Label>
          <Input
            id="username"
            name="username"
            placeholder="아이디를 입력하세요"
            className="h-[2.6rem]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">비밀번호</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            className="h-[2.6rem]"
          />
        </div>
        <Button type="submit" className="w-full h-[3rem]">
          로그인
        </Button>
      </form>

      {/* 회원가입 링크 */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">처음이신가요?</span>
        <Link to="/signup" className="ml-2 underline">
          회원가입
        </Link>
      </div>
    </div>
  );
}

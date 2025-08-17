import { createFileRoute } from "@tanstack/react-router";
import { LoginSection, ExplanationSection } from "@/components/auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="h-fit w-full max-w-5xl overflow-hidden border-0 py-0 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 왼쪽 브랜딩 섹션 */}
          <ExplanationSection />
          {/* 오른쪽 로그인 섹션 */}
          <LoginSection />
        </div>
      </Card>
    </div>
  );
}

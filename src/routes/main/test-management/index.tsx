// src/routes/test-paper/index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { TabsContent } from "@/components/ui/tabs";
import { TestListTab } from "@/components/test/TestListTab";
import { TestRegistrationTab } from "@/components/test/TestRegistrationTab";

// 라우트 경로 변경
export const Route = createFileRoute("/main/test-management/")({
  component: TestPaperPage, // 👈 페이지 컴포넌트명 변경
});

/**
 * 시험지 페이지 컴포넌트
 * @description 탭 전환 및 하단 밑줄 애니메이션 제공
 *
 * 주요 기능:
 * - 제어형 탭 상태 관리
 * - framer-motion `layoutId` 기반 밑줄 이동 애니메이션 처리
 * - shadcn/ui `Tabs` 조합 스타일 적용
 */
function TestPaperPage() {
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <TestListTab />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <TestRegistrationTab />
      </TabsContent>
    </>
  );
}

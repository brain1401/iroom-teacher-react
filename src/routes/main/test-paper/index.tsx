import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TestPaperListTab } from "@/components/testpaper/TestPaperListTab";
import { TestPaperRegistrationTab } from "@/components/testpaper/TestPaperRegistrationTab";
import { useSetAtom } from "jotai";
import { isShowHeaderAtom } from "@/atoms/ui";

export const Route = createFileRoute("/main/test-paper/")({
  component: TestPaperPage,
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
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  return (
    <>
      <TabsContent value="list" className="mt-10">
        <TestPaperListTab />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <TestPaperRegistrationTab />
      </TabsContent>
    </>
  );
}

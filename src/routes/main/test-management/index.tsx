import { isShowHeaderAtom } from "@/atoms/ui";
import { Card } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TestListTab } from "@/components/test/TestListTab";
import { TestRegistrationTab } from "@/components/test/TestRegistrationTab";

export const Route = createFileRoute("/main/test-management/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  /**
   * 시험지 페이지 컴포넌트
   * @description 탭 전환 및 하단 밑줄 애니메이션 제공
   *
   * 주요 기능:
   * - 제어형 탭 상태 관리
   * - framer-motion `layoutId` 기반 밑줄 이동 애니메이션 처리
   * - shadcn/ui `Tabs` 조합 스타일 적용
   */
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

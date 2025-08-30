import { isShowHeaderAtom } from "@/atoms/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect, useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { TestListTab } from "@/components/test/TestListTab";
import { TestCreationTab } from "@/components/test/TestCreationTab";
import { TestRegistrationTab } from "@/components/test/TestRegistrationTab";
import { Route as ParentRoute } from "./route";
import { useTestList } from "@/hooks/test/useTestList";
import type { TestLevel, TestStatus } from "@/types/test";

export const Route = createFileRoute("/main/test-management/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const { selectedTest, testName } = ParentRoute.useSearch();
  const { addNewTest } = useTestList();

  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState<string>("list");

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  /**
   * 시험 출제 완료 후 목록 탭으로 이동하고 새로운 시험 추가
   */
  const handleTestCreated = (newTest: {
    unitName: string;
    testName: string;
    questionCount: number;
    questionLevel: TestLevel;
    status: TestStatus;
  }) => {
    // 새로운 시험을 목록에 추가
    addNewTest(newTest);

    // 시험 목록 탭으로 이동
    setActiveTab("list");
  };

  /**
   * 시험 출제 완료 후 목록 탭으로 이동하고 새로운 시험 추가
   */
  useEffect(() => {
    // 부모 컴포넌트의 탭 상태를 동기화
    const parentElement = document.querySelector("[data-state]");
    if (parentElement) {
      const currentTab = parentElement.getAttribute("data-state");
      if (currentTab && currentTab !== activeTab) {
        setActiveTab(currentTab);
      }
    }
  }, [activeTab]);

  /**
   * 시험지 페이지 컴포넌트
   * @description 탭 전환 및 하단 밑줄 애니메이션 제공
   *
   * 주요 기능:
   * - 제어형 탭 상태 관리
   * - framer-motion `layoutId` 기반 밑줄 이동 애니메이션 처리
   * - shadcn/ui `Tabs` 조합 스타일 적용
   * - 대시보드에서 선택된 시험 정보 전달
   * - 시험 출제 완료 후 자동 탭 전환
   */
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <TestListTab
          selectedTestId={selectedTest}
          selectedTestName={testName}
        />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <TestRegistrationTab />
      </TabsContent>
    </>
  );
}

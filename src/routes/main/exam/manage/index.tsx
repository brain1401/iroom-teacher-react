import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect, useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Route as ParentRoute } from "./route";
import {
  EnhancedExamSheetListTab,
  ExamSheetRegistrationTab,
} from "@/components/exam";
import { isShowHeaderAtom } from "@/atoms/ui";

export const Route = createFileRoute("/main/exam/manage/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);
  const { selectedExam, examName } = ParentRoute.useSearch();

  // 현재 활성 탭 상태
  const [activeTab, setActiveTab] = useState<string>("list");

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

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
        <EnhancedExamSheetListTab
          selectedExamId={selectedExam}
          selectedExamName={examName}
        />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamSheetRegistrationTab />
      </TabsContent>
    </>
  );
}

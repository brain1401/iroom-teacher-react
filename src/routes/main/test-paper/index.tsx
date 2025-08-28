// src/routes/test-paper/index.tsx

import { createFileRoute } from "@tanstack/react-router";
import { useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestPaperListTab } from "@/components/testpaper/TestPaperListTab";
import { TestPaperRegistrationTab } from "@/components/testpaper/TestPaperRegistrationTab";
import { useSetAtom } from "jotai";
import { isShowHeaderAtom } from "@/atoms/ui";


// 라우트 경로 변경
export const Route = createFileRoute("/main/test-paper/")({
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
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);
  /** 현재 활성 탭 값 상태 */
  const [activeTab, setActiveTab] = useState<string>("list");

  return (
    <div className="flex-1 p-8 flex w-full bg-white shadow-2xl rounded-sm">
      {/* 제어형 탭 구성 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-10 ">
        {/* 탭 트랙 및 하단 보더 표시 */}
        <TabsList className="relative grid w-[30rem] grid-cols-2 ">
          {/* 목록 탭 트리거 */}
          <TabsTrigger
            value="list"
            className="relative px-6 py-3 text-muted-foreground data-[state=active]:text-sky-600 text-[1.1rem]"
          >
            시험지 목록
            {/* 활성 탭 하단 밑줄 애니메이션 렌더링 */}
            {activeTab === "list" && (
              <motion.div
                layoutId="tabs-underline"
                className="absolute left-0 right-0 -bottom-[2px] h-[0.3rem] bg-sky-500"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </TabsTrigger>

          {/* 등록 탭 트리거 */}
          <TabsTrigger
            value="register"
            className="relative px-6 py-3 text-muted-foreground data-[state=active]:text-sky-600"
          >
            시험지 등록
            {/* 활성 탭 하단 밑줄 애니메이션 렌더링 */}
            {activeTab === "register" && (
              <motion.div
                layoutId="tabs-underline"
                className="absolute left-0 right-0 -bottom-[2px] h-[0.3rem] bg-sky-500"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-10">
          <TestPaperListTab />
        </TabsContent>

        <TabsContent value="register" className="mt-10">
          <TestPaperRegistrationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

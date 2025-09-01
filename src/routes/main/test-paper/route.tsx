import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/main/test-paper")({
  component: RouteComponent,
});

function RouteComponent() {
  /** 현재 활성 탭 값 상태 */
  const [activeTab, setActiveTab] = useState<string>("list");

  return (
    <Card className="w-full h-full p-8 flex flex-col">
      {/* 제어형 탭 구성 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        {/* 탭 트랙 및 하단 보더 표시 */}
        <div className="flex-shrink-0">
          <TabsList className="relative grid w-[30rem] grid-cols-2 bg-white mt-2">
            {/* 목록 탭 트리거 */}
            <TabsTrigger
              value="list"
              className="relative px-6 py-3 text-muted-foreground data-[state=active]:text-sky-600 "
            >
              문제지 목록
              {/* 활성 탭 하단 밑줄 애니메이션 렌더링 */}
              {activeTab === "list" && (
                <motion.div
                  layoutId="tabs-underline"
                  className="absolute left-0 right-0 -bottom-[2px] h-[0.1rem] bg-sky-500"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </TabsTrigger>

            {/* 등록 탭 트리거 */}
            <TabsTrigger
              value="register"
              className="relative px-6 py-3 text-muted-foreground  data-[state=active]:text-sky-600"
            >
              문제지 등록
              {/* 활성 탭 하단 밑줄 애니메이션 렌더링 */}
              {activeTab === "register" && (
                <motion.div
                  layoutId="tabs-underline"
                  className="absolute left-0 right-0 -bottom-[2px] h-[0.1rem] bg-sky-500"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </TabsTrigger>
          </TabsList>
          <hr className="w-full" />
        </div>

        <div className="flex-1 min-h-0">
          <Outlet />
        </div>
      </Tabs>
    </Card>
  );
}

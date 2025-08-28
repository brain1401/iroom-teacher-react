import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/main/test-management")({
  component: RouteComponent,
});

function RouteComponent() {
  /** 현재 활성 탭 값 상태 */
  const [activeTab, setActiveTab] = useState<string>("list");

  return (
    <Card className="w-full p-8" >
      {/* 제어형 탭 구성 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-2 ">
        {/* 탭 트랙 및 하단 보더 표시 */}
        <TabsList className="relative grid w-[30rem] grid-cols-2 bg-white ">
          {/* 목록 탭 트리거 */}
          <TabsTrigger
            value="list"
            className="relative px-6 py-3 text-muted-foreground data-[state=active]:text-sky-600 "
          >
            시험 목록
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
            시험 출제
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
        <hr className="w-full mt-1  " />
        <Outlet />
      </Tabs>
    </Card>
  );
}


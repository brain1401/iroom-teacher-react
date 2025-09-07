import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useCallback } from "react";
import { z } from "zod";

export const Route = createFileRoute("/main/exam/sheet/manage")({
  validateSearch: z.object({
    /** 활성 탭 */
    tab: z.enum(["list", "register"]).optional().catch("list").default("list"),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  
  /** URL 기반 활성 탭 값 */
  const activeTab = searchParams.tab;

  /**
   * 탭 변경 핸들러
   * @description TanStack Router navigate를 사용한 URL 기반 탭 전환
   */
  const handleTabChange = useCallback((newTab: string) => {
    if (newTab === "list" || newTab === "register") {
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          tab: newTab,
        }),
      });
    }
  }, [navigate]);

  return (
    <Card className="w-full h-full p-8 flex flex-col">
      {/* URL 기반 탭 구성 */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
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
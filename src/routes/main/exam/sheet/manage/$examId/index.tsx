import { ExamList } from "@/components/layout/ExamList";
import { ExamSheetListTab } from "@/components/sheet/ExamSheetListTab";
import { TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * 문제지 관리 페이지의 검색 파라미터 스키마
 * @description TanStack Router의 타입 안전한 search params 관리
 */
const examSheetSearchSchema = z.object({
  /** 활성 탭 */
  tab: z.enum(["list", "register"]).optional().catch("list").default("list"),
  
  /** 현재 페이지 (0부터 시작) */
  page: z.number().int().min(0).catch(0).default(0),
  /** 페이지당 항목 수 */
  size: z.number().int().min(1).max(100).catch(10).default(10),
  /** 정렬 필드 */
  sort: z.string().catch("createdAt").default("createdAt"),
  /** 정렬 방향 */
  direction: z.enum(["ASC", "DESC"]).catch("DESC").default("DESC"),
  /** 학년 필터 */
  grade: z.string().catch("1").default("1"),
  /** 검색 키워드 */
  search: z.string().optional(),
});;

export const Route = createFileRoute("/main/exam/sheet/manage/$examId/")({
  validateSearch: examSheetSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const searchParams = Route.useSearch();
  
  /** URL 기반 활성 탭 */
  const activeTab = searchParams.tab || "list";

  return (
    <>
      <TabsContent value="list" className="mt-10">
        {activeTab === "list" && <ExamSheetListTab />}
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        {activeTab === "register" && <ExamList />}
      </TabsContent>
    </>
  );
}

import { ExamList } from "@/components/layout/ExamList";
import { TestPaperListTab } from "@/components/testpaper/TestPaperListTab";
import { TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/main/exam-sheet-management/$examId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <TestPaperListTab />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamList />
      </TabsContent>
    </>
  );
}

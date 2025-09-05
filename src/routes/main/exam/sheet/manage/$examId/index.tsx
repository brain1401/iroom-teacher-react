import { ExamList } from "@/components/layout/ExamList";
import { ExamSheetListTab } from "@/components/sheet/ExamSheetListTab";
import { TabsContent } from "@/components/ui/tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/main/exam/sheet/manage/$examId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <ExamSheetListTab />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamList />
      </TabsContent>
    </>
  );
}

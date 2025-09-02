import { ExamDetail } from "@/components/exam/ExamDetail";
import { ExamRegistrationTab } from "@/components/exam/ExamRegistrationTab";
import { TabsContent } from "@radix-ui/react-tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/main/exam/manage/$examId/")({
  component: RouteComponent,
});

export const useExamId = Route.useParams;

function RouteComponent() {
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <ExamDetail />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <ExamRegistrationTab />
      </TabsContent>
    </>
  );
}

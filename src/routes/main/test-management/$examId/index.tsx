import { TestDetail } from "@/components/test/TestDetail";
import { TestRegistrationTab } from "@/components/test/TestRegistrationTab";
import { TabsContent } from "@radix-ui/react-tabs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/main/test-management/$examId/")({
  component: RouteComponent,
});

export const useExamId = Route.useParams;

function RouteComponent() {
  return (
    <>
      <TabsContent value="list" className="mt-10">
        <TestDetail />
      </TabsContent>

      <TabsContent value="register" className="mt-10">
        <TestRegistrationTab />
      </TabsContent>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { LoginSection, MotivationSection } from "@/components/auth";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="h-fit w-full max-w-4xl overflow-hidden border-0 py-0 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <LoginSection />
          <MotivationSection />
        </div>
      </Card>
    </div>
  );
}

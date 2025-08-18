import { createFileRoute } from "@tanstack/react-router";
import { Exams } from "@/components/management/Exams";

export const Route = createFileRoute("/exams/")({
  component: () => <Exams />,
});


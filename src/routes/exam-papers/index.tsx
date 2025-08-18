import { createFileRoute } from "@tanstack/react-router";
import { ExamPapers } from "@/components/management/ExamPapers";

export const Route = createFileRoute("/exam-papers/")({
  component: () => <ExamPapers />,
});


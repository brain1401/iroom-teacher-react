import { createFileRoute } from "@tanstack/react-router";
import { Reports } from "@/components/management/Reports";

export const Route = createFileRoute("/reports/")({
  component: () => <Reports />,
});


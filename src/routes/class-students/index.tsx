import { createFileRoute } from "@tanstack/react-router";
import { ClassStudents } from "@/components/management/ClassStudents";

export const Route = createFileRoute("/class-students/")({
  component: () => <ClassStudents />,
});


import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/main/exam/sheet")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

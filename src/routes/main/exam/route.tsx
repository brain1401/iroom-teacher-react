import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/main/exam")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

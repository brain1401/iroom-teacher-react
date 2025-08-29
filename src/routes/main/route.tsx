import { SideMenu } from "@/components/layout/SideMenu";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HeaderTitle } from "@/components/layout/HeaderTitle";

export const Route = createFileRoute("/main")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full h-screen">
      <SideMenu />
      <div className="ml-32 flex-grow p-8 flex-1 flex flex-col w-full px-14 py-10">
        <div className="mb-[3rem] flex-shrink-0">
          <HeaderTitle />
        </div>
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

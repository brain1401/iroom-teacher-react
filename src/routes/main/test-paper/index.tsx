import { isShowHeaderAtom } from "@/atoms/ui";
import { Card } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";

export const Route = createFileRoute("/main/test-paper/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  return (
    <Card>
      <div className="text-5xl font-bold">시험지 관리</div>
    </Card>
  );
}

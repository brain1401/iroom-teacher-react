import { isShowHeaderAtom } from "@/atoms/ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { useLayoutEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsDemo } from "@/routes/main/test-management/Test";

export const Route = createFileRoute("/main/test-management/")({
  component: RouteComponent,
});

function RouteComponent() {
  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  return (
    <div>
        <TabsDemo/>
    </div>
  );
}

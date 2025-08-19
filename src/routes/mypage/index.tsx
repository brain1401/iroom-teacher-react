import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "@/components/mypage/MyPage";

export const Route = createFileRoute("/mypage/")({
  component: () => <MyPage />,
});


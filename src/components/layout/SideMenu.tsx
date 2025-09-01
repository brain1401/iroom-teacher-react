import { Link, useLocation } from "@tanstack/react-router";
import { ChartColumn, House, FileCog, FolderCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
// 1. framer-motion에서 필요한 것들을 import
import { motion } from "framer-motion";

const menuItems: { path: string; icon: LucideIcon; label: string }[] = [
  { path: "/main", icon: House, label: "홈" },
  { path: "/main/test-paper", icon: FolderCog, label: "문제지 관리" },
  { path: "/main/test-management", icon: FileCog, label: "시험 관리" },
  { path: "/main/statistics", icon: ChartColumn, label: "통계 관리" },
];

export function SideMenu() {
  const location = useLocation({ select: (loc) => loc.pathname });

  // isActive 함수 수정 - 정확한 경로 매칭만
  const isActive = (path: string) => {
    if (path === "/main") {
      // 홈의 경우 정확히 /main이거나 /main/statistics만 매치
      return location === path || location === "/main/statistics";
    }
    // 다른 메뉴의 경우 해당 경로와 하위 경로 매치
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <div className="fixed top-0 left-0 w-32 h-screen bg-white p-4 shadow-2xl">
      <div className="flex flex-col gap-16 pt-4">
        {menuItems.map((item) => {
          const IconComponent = item.icon;

          return (
            // 2. Link의 key를 item.path로 설정하는 것이 중요!
            <Link to={item.path} key={item.path}>
              {/* 3. 각 메뉴 아이템을 relative로 설정 */}
              <div className="flex-col flex gap-2 relative">
                <div className="flex flex-col items-center justify-center gap-2">
                  <IconComponent />
                  <div>{item.label}</div>
                </div>

                {/* 4. 활성화된 아이템에만 motion.div를 렌더링 */}
                {isActive(item.path) && (
                  <motion.div
                    className="absolute w-1 h-full bg-blue-500"
                    // 5. layoutId를 부여해서 애니메이션을 연결
                    layoutId="active-indicator"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

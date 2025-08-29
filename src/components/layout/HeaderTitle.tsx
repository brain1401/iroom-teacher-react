import { LogOut } from "lucide-react";

import { useAtomValue } from "jotai";
import { isShowHeaderAtom } from "@/atoms/ui";
import SelectGrade from "./SelectGrade";

export function HeaderTitle() {
  const isShowHeader = useAtomValue(isShowHeaderAtom);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-5xl font-bold">태극 스쿨</h1>
        <div className="ml-6 mr-2.5">{isShowHeader && <SelectGrade />}</div>
      </div>
      <LogOut className="w-16 h-16" />
    </div>
  );
}

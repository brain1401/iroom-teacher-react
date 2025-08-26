import { LogOut } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAtomValue } from "jotai";
import { isShowHeaderAtom } from "@/atoms/ui";

const HeaderTitle = () => {
  const isShowHeader = useAtomValue(isShowHeaderAtom);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-5xl font-bold">학원명</h1>
        <div className="ml-6 mr-2.5">
          {isShowHeader && (
            <Select defaultValue="중1">
            <SelectTrigger>
              <SelectValue placeholder="중1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="중1">중1</SelectItem>
              <SelectItem value="중2">중2</SelectItem>
              <SelectItem value="중3">중3</SelectItem>
            </SelectContent>
          </Select>
          )}
        </div>
      </div>
      <LogOut className="w-16 h-16" />
    </div>
  );
};

export default HeaderTitle;

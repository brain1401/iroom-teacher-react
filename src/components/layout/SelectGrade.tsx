import { selectedGradeAtom } from "@/atoms/grade";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAtom } from "jotai";
import type { Grade } from "@/types/grade";

export default function SelectGrade() {
  const [grade, setGrade] = useAtom(selectedGradeAtom);
  return (
    <Select value={grade} onValueChange={(value) => setGrade(value as Grade)}>
      <SelectTrigger>
        <SelectValue placeholder="중1" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="중1">중1</SelectItem>
        <SelectItem value="중2">중2</SelectItem>
        <SelectItem value="중3">중3</SelectItem>
      </SelectContent>
    </Select>
  );
}

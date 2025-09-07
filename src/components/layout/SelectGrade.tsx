import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useAtom } from "jotai";
import { selectedGradeAtom } from "@/atoms/grade";
import type { Grade } from "@/types/grade";

export function SelectGrade() {
  const [grade, setGrade] = useAtom(selectedGradeAtom);
  return (
    <Select value={grade} onValueChange={(value) => setGrade(value as Grade)}>
      <SelectTrigger>
        <SelectValue placeholder="1" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="1">1</SelectItem>
        <SelectItem value="2">2</SelectItem>
        <SelectItem value="3">3</SelectItem>
      </SelectContent>
    </Select>
  );
}

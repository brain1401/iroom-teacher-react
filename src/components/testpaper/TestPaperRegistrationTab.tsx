// src/routes/test-paper/_components/TestPaperRegistrationTab.tsx
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import SelectGrade from "../layout/SelectGrade";
import { useAtomValue } from "jotai";
import { selectedGradeAtom } from "@/atoms/grade";
import { useQuery } from "@tanstack/react-query";
import { unitsByGradeQueryOptions } from "@/api/test-paper";
import { useNavigate } from "@tanstack/react-router";

/**
 * 시험지 등록 탭 콘텐츠
 * @description 상단 `문항 조건`, 좌측 `단원 선택`, 우측 `선택 단원` 및 하단 작성 버튼 구성
 *
 * 주요 구성:
 * - 문항 수 선택 (최대 30)
 * - 좌측: 학년 선택 + 단원 버튼 그리드
 * - 우측: 선택 단원 목록 + 시험지명 입력 + 작성 버튼
 */
export function TestPaperRegistrationTab() {
  /** 현재 선택된 학년 */
  const grade = useAtomValue(selectedGradeAtom);
  const navigate = useNavigate({ from: "/main/test-paper" });

  /** 문항 수 상태 (최대 20) */
  const [questionCount, setQuestionCount] = useState<number>(20);

  /** 학년별 단원 목록 조회 */
  const {
    data: apiUnits = [],
    isPending,
    isError,
  } = useQuery(unitsByGradeQueryOptions(grade));

  /** 가데이터: API 미연동 시 프리뷰용 더미 단원 */
  const mockUnitsByGrade = useMemo(
    () => ({
      중1: Array.from({ length: 16 }).map((_, i) => ({
        id: `g1-u${i + 1}`,
        name: `${i + 1}단원`,
      })),
      중2: Array.from({ length: 14 }).map((_, i) => ({
        id: `g2-u${i + 1}`,
        name: `${i + 1}단원`,
      })),
      중3: Array.from({ length: 12 }).map((_, i) => ({
        id: `g3-u${i + 1}`,
        name: `${i + 1}단원`,
      })),
    }),
    [],
  );

  /** 실제 사용 단원: API 성공 시 API 데이터, 아니면 가데이터 */
  const units = useMemo(() => {
    if (!isError && apiUnits.length > 0) return apiUnits;
    return mockUnitsByGrade[grade];
  }, [apiUnits, isError, mockUnitsByGrade, grade]);

  /** 선택 단원 상태 */
  const [selectedUnitIds, setSelectedUnitIds] = useState<Set<string>>(
    new Set(),
  );
  const selectedUnits = useMemo(
    () => units.filter((u) => selectedUnitIds.has(u.id)),
    [units, selectedUnitIds],
  );

  /** 시험지명 상태 */
  const [examName, setExamName] = useState<string>("");

  /** 단원 토글 선택 처리 */
  const toggleUnit = (id: string) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** 우측 목록 개별 삭제 처리 */
  const removeUnit = (id: string) => {
    setSelectedUnitIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* 상단: 문항 조건 */}
      <div className="w-full rounded-md border p-4">
        <div className="flex items-center gap-6">
          <div className="text-sky-600 font-bold">문항 조건</div>
          <QuestionCountCombobox
            value={questionCount}
            onChange={(n) => setQuestionCount(Math.max(1, Math.min(20, n)))}
          />
          <div className="text-xs text-muted-foreground">(최대20문항)</div>
        </div>
      </div>

      {/* 본문: 좌측 단원 선택 / 우측 선택 단원 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* 좌측: 단원 선택 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sky-600">단원 선택</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <SelectGrade />
              <Button
                type="button"
                variant="default"
                className="ml-2"
                disabled={selectedUnitIds.size === 0}
              >
                선택한 단원 적용
              </Button>
            </div>

            {isPending && (
              <div className="text-sm text-muted-foreground">
                단원 불러오는 중...
              </div>
            )}
            {isError && apiUnits.length === 0 && (
              <div className="text-sm text-red-500">
                단원 목록을 불러오지 못함 (가데이터 표시)
              </div>
            )}
            {units.length > 0 && (
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-6 lg:grid-cols-8 ">
                {units.map((unit) => {
                  const isSelected = selectedUnitIds.has(unit.id);
                  return (
                    <Button
                      key={unit.id}
                      type="button"
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className="h-8"
                      onClick={() => toggleUnit(unit.id)}
                    >
                      {unit.name}
                    </Button>
                  );
                })}
              </div>
            )}
            {!isPending && units.length === 0 && (
              <div className="text-sm text-muted-foreground">표시할 단원이 없음</div>
            )}
          </CardContent>
        </Card>

        {/* 우측: 선택 단원 */}
        <div className="flex flex-col gap-4">
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sky-600">선택 단원</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedUnits.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    선택된 단원이 없음
                  </div>
                )}
                {selectedUnits.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox defaultChecked id={u.id} />
                      <Label htmlFor={u.id} className="text-sm">
                        선택된 단원명
                      </Label>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => removeUnit(u.id)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[110px_1fr]">
            <Label htmlFor="exam-name" className="self-center text-sm">
              시험지명
            </Label>
            <Input
              id="exam-name"
              placeholder="시험지명 입력"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
            />
          </div>

          <div>
            <Button
              type="button"
              className="w-full h-10"
              disabled={
                selectedUnitIds.size === 0 ||
                questionCount <= 0 ||
                examName.trim().length === 0
              }
              onClick={() => {
                const unitIds = Array.from(selectedUnitIds);
                navigate({
                  to: "/main/test-paper/draft",
                  search: {
                    examName: examName.trim(),
                    count: questionCount,
                    units: unitIds,
                  },
                });
              }}
            >
              시험 작성
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type QuestionCountComboboxProps = {
  value: number;
  onChange: (value: number) => void;
};

/**
 * 문항 수 콤보박스
 * @description 입력과 선택을 동시에 지원하는 Command 기반 컴포넌트
 */
function QuestionCountCombobox({
  value,
  onChange,
}: QuestionCountComboboxProps) {
  const [open, setOpen] = useState(false);
  const items = useMemo(() => [5, 10, 15, 20], []);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground/80">문항 수</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[96px] justify-between">
            {value}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandInput
              placeholder="숫자 입력(최대 20)"
              value={String(value)}
              onValueChange={(v) => {
                const n = Number(v.replace(/[^0-9]/g, ""));
                if (!Number.isNaN(n)) onChange(Math.max(1, Math.min(20, n)));
              }}
            />
            <CommandList>
              <CommandEmpty>결과 없음</CommandEmpty>
              <CommandGroup heading="추천">
                {items.map((n) => (
                  <CommandItem
                    key={n}
                    value={String(n)}
                    onSelect={() => {
                      onChange(n);
                      setOpen(false);
                    }}
                  >
                    {n}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

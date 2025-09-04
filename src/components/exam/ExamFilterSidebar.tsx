/**
 * 시험 목록 필터 사이드바 컴포넌트
 * @description 시험 목록의 고급 필터링을 위한 종합적인 사이드바 컴포넌트
 */

import { useState, useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  RotateCcw,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Filter Atoms
import {
  searchKeywordAtom,
  searchScopeAtom,
  statusFiltersAtom,
  dateRangeFiltersAtom,
  questionCountRangeAtom,
  participationRateRangeAtom,
  unitFiltersAtom,
  examTypeFiltersAtom,
  advancedSearchOptionsAtom,
  showFilterSidebarAtom,
  collapsedFilterSidebarAtom,
  activeFiltersCountAtom,
  resetAllFiltersAtom,
  filterPresetsAtom,
} from "@/atoms/examFilters";

// Types
import type { ExamStatus, SearchScope } from "@/types/exam";
import { cn } from "@/lib/utils";

/**
 * 필터 콘텐츠 컴포넌트의 Props 타입
 * @description 필터 사이드바 내부 콘텐츠를 렌더링하는 컴포넌트의 Props 정의
 */
type FilterContentProps = {
  /** 모바일 모드 여부 */
  isMobileMode?: boolean;
  /** 확장된 섹션들의 상태 */
  expandedSections: Record<string, boolean>;
  /** 섹션 확장/축소 토글 함수 */
  toggleSection: (section: string) => void;
  /** 사용 가능한 단원 목록 */
  availableUnits: string[];
  /** 사용 가능한 시험 유형 목록 */
  availableExamTypes: string[];
};

/**
 * 필터 사이드바 Props 타입
 */
type ExamFilterSidebarProps = {
  /** 사용 가능한 단원 목록 */
  availableUnits?: string[];
  /** 사용 가능한 시험 유형 목록 */
  availableExamTypes?: string[];
  /** 사이드바 클래스명 */
  className?: string;
};

const defaultAvailableUnits: string[] = [];
const defaultAvailableExamTypes: string[] = [];

/**
 * 필터 콘텐츠 컴포넌트
 * @description 필터 사이드바의 내부 콘텐츠를 렌더링하는 컴포넌트
 *
 * 주요 기능:
 * - 빠른 필터 프리셋 제공
 * - 검색 필터 (키워드, 범위, 고급 옵션)
 * - 상태 및 난이도 필터
 * - 날짜 범위 필터
 * - 성과 지표 필터 (문항 수, 참여율)
 * - 콘텐츠 분류 필터 (단원, 시험 유형)
 *
 * @param props 필터 콘텐츠 Props
 */
function FilterContent({
  isMobileMode = false,
  expandedSections,
  toggleSection,
  availableUnits,
  availableExamTypes,
}: FilterContentProps) {
  // 모든 상태를 Jotai atoms에서 직접 가져오기
  const [searchKeyword, setSearchKeyword] = useAtom(searchKeywordAtom);
  const [searchScope, setSearchScope] = useAtom(searchScopeAtom);
  const [statusFilters, setStatusFilters] = useAtom(statusFiltersAtom);
  const [dateFilters, setDateFilters] = useAtom(dateRangeFiltersAtom);
  const [questionRange, setQuestionRange] = useAtom(questionCountRangeAtom);
  const [participationRange, setParticipationRange] = useAtom(
    participationRateRangeAtom,
  );
  const [unitFilters, setUnitFilters] = useAtom(unitFiltersAtom);
  const [examTypeFilters, setExamTypeFilters] = useAtom(examTypeFiltersAtom);
  const [advancedOptions, setAdvancedOptions] = useAtom(
    advancedSearchOptionsAtom,
  );
  const [filterPresets] = useAtom(filterPresetsAtom);

  /**
   * 상태 필터 핸들러
   */
  const handleStatusFilter = (status: ExamStatus, checked: boolean) => {
    setStatusFilters((prev) =>
      checked ? [...prev, status] : prev.filter((s) => s !== status),
    );
  };

  /**
   * 단원 필터 핸들러
   */
  const handleUnitFilter = (unit: string, checked: boolean) => {
    setUnitFilters((prev) =>
      checked ? [...prev, unit] : prev.filter((u) => u !== unit),
    );
  };

  /**
   * 시험 유형 필터 핸들러
   */
  const handleExamTypeFilter = (type: string, checked: boolean) => {
    setExamTypeFilters((prev) =>
      checked ? [...prev, type] : prev.filter((t) => t !== type),
    );
  };

  /**
   * 날짜 범위 핸들러
   */
  const handleDateRangeChange = (
    type: "createdFrom" | "createdTo" | "updatedFrom" | "updatedTo",
    date: Date | undefined,
  ) => {
    setDateFilters((prev) => ({
      ...prev,
      [type]: date,
    }));
  };

  /**
   * 프리셋 적용 핸들러
   */
  const applyPreset = (presetKey: string) => {
    const preset = filterPresets[presetKey];
    if (!preset) return;

    setStatusFilters(preset.filters.statusFilters);
    setQuestionRange(preset.filters.questionCountRange);
    setParticipationRange(preset.filters.participationRateRange);
  };
  return (
    <ScrollArea
      className={cn(
        isMobileMode ? "h-[70vh]" : "h-[600px]",
        isMobileMode ? "" : "pr-3",
      )}
    >
      <div className="space-y-4 p-1">
        {/* 빠른 필터 프리셋 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">빠른 필터</Label>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(filterPresets).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="justify-start text-xs h-9"
                onClick={() => applyPreset(key)}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* 검색 필터 */}
        <Collapsible
          open={expandedSections.search}
          onOpenChange={() => toggleSection("search")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <span className="text-sm font-medium">검색</span>
              {expandedSections.search ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {/* 검색어 입력 */}
            <div className="space-y-2">
              <Label className="text-xs">검색어</Label>
              <Input
                placeholder="시험명, 단원명 등을 검색하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* 검색 범위 */}
            <div className="space-y-2">
              <Label className="text-xs">검색 범위</Label>
              <Select
                value={searchScope}
                onValueChange={(value: SearchScope) => setSearchScope(value)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 (시험명 + 단원명)</SelectItem>
                  <SelectItem value="examName">시험명만</SelectItem>
                  <SelectItem value="unitName">단원명만</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 고급 검색 옵션 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs">대소문자 구분</Label>
                <Switch
                  checked={advancedOptions.caseSensitive}
                  onCheckedChange={(checked) =>
                    setAdvancedOptions((prev) => ({
                      ...prev,
                      caseSensitive: checked,
                    }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">정확히 일치</Label>
                <Switch
                  checked={advancedOptions.exactMatch}
                  onCheckedChange={(checked) =>
                    setAdvancedOptions((prev) => ({
                      ...prev,
                      exactMatch: checked,
                    }))
                  }
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* 상태 및 난이도 필터 */}
        <Collapsible
          open={expandedSections.quick}
          onOpenChange={() => toggleSection("quick")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <span className="text-sm font-medium">상태 및 난이도</span>
              {expandedSections.quick ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* 승인 상태 */}
            <div className="space-y-2">
              <Label className="text-xs">승인 상태</Label>
              <div className="space-y-3">
                {(["승인완료", "승인거부"] as ExamStatus[]).map((status) => (
                  <div key={status} className="flex items-center space-x-3">
                    <Checkbox
                      id={`status-${status}`}
                      checked={statusFilters.includes(status)}
                      onCheckedChange={(checked) =>
                        handleStatusFilter(status, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`status-${status}`}
                      className="text-xs cursor-pointer"
                    >
                      {status}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* 날짜 범위 필터 */}
        <Collapsible
          open={expandedSections.date}
          onOpenChange={() => toggleSection("date")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <span className="text-sm font-medium">날짜 범위</span>
              {expandedSections.date ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* 생성일 범위 */}
            <div className="space-y-2">
              <Label className="text-xs">생성일</Label>
              <div
                className={cn(
                  "grid gap-2",
                  isMobileMode ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-9"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dateFilters.createdFrom
                        ? format(dateFilters.createdFrom, "MM/dd", {
                            locale: ko,
                          })
                        : "시작일"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilters.createdFrom}
                      onSelect={(date) =>
                        handleDateRangeChange("createdFrom", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-9"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dateFilters.createdTo
                        ? format(dateFilters.createdTo, "MM/dd", {
                            locale: ko,
                          })
                        : "종료일"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilters.createdTo}
                      onSelect={(date) =>
                        handleDateRangeChange("createdTo", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* 수정일 범위 */}
            <div className="space-y-2">
              <Label className="text-xs">수정일</Label>
              <div
                className={cn(
                  "grid gap-2",
                  isMobileMode ? "grid-cols-1" : "grid-cols-2",
                )}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-9"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dateFilters.updatedFrom
                        ? format(dateFilters.updatedFrom, "MM/dd", {
                            locale: ko,
                          })
                        : "시작일"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilters.updatedFrom}
                      onSelect={(date) =>
                        handleDateRangeChange("updatedFrom", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start text-xs h-9"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {dateFilters.updatedTo
                        ? format(dateFilters.updatedTo, "MM/dd", {
                            locale: ko,
                          })
                        : "종료일"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilters.updatedTo}
                      onSelect={(date) =>
                        handleDateRangeChange("updatedTo", date)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* 성과 지표 필터 */}
        <Collapsible
          open={expandedSections.performance}
          onOpenChange={() => toggleSection("performance")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <span className="text-sm font-medium">성과 지표</span>
              {expandedSections.performance ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* 문항 수 범위 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs">문항 수</Label>
                <span className="text-xs text-muted-foreground">
                  {questionRange.min} - {questionRange.max}개
                </span>
              </div>
              <Slider
                value={[questionRange.min, questionRange.max]}
                onValueChange={([min, max]) => setQuestionRange({ min, max })}
                max={40}
                min={10}
                step={1}
                className="w-full"
              />
            </div>

            {/* 참여율 범위 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-xs">참여율</Label>
                <span className="text-xs text-muted-foreground">
                  {participationRange.min}% - {participationRange.max}%
                </span>
              </div>
              <Slider
                value={[participationRange.min, participationRange.max]}
                onValueChange={([min, max]) =>
                  setParticipationRange({ min, max })
                }
                max={100}
                min={0}
                step={5}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* 콘텐츠 필터 */}
        <Collapsible
          open={expandedSections.content}
          onOpenChange={() => toggleSection("content")}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-0 h-auto"
            >
              <span className="text-sm font-medium">콘텐츠 분류</span>
              {expandedSections.content ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-3">
            {/* 단원 필터 */}
            {availableUnits.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">단원</Label>
                <div className="space-y-3 max-h-32 overflow-y-auto">
                  {availableUnits.map((unit) => (
                    <div key={unit} className="flex items-center space-x-3">
                      <Checkbox
                        id={`unit-${unit}`}
                        checked={unitFilters.includes(unit)}
                        onCheckedChange={(checked) =>
                          handleUnitFilter(unit, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`unit-${unit}`}
                        className="text-xs cursor-pointer line-clamp-1"
                      >
                        {unit}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 시험 유형 필터 */}
            {availableExamTypes.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">시험 유형</Label>
                <div className="space-y-3">
                  {availableExamTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-3">
                      <Checkbox
                        id={`type-${type}`}
                        checked={examTypeFilters.includes(type)}
                        onCheckedChange={(checked) =>
                          handleExamTypeFilter(type, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`type-${type}`}
                        className="text-xs cursor-pointer"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ScrollArea>
  );
}

/**
 * 시험 필터 사이드바 컴포넌트
 * @description 시험 목록의 모든 필터링 옵션을 제공하는 고급 사이드바
 *
 * 주요 기능:
 * - 빠른 필터 (상태, 난이도)
 * - 날짜 범위 필터 (생성일, 수정일)
 * - 성과 지표 필터 (문항 수, 참여율)
 * - 콘텐츠 필터 (단원, 시험 유형)
 * - 고급 검색 옵션
 * - 필터 프리셋 시스템
 * - 축소/확장 기능
 * - 활성 필터 카운트 표시
 * - 필터 초기화 기능
 *
 * @example
 * ```tsx
 * <ExamFilterSidebar
 *   availableUnits={["1단원: 다항식", "2단원: 인수분해"]}
 *   availableExamTypes={["중간고사", "기말고사", "단원평가"]}
 * />
 * ```
 */
export function ExamFilterSidebar({
  availableUnits = defaultAvailableUnits,
  availableExamTypes = defaultAvailableExamTypes,
  className,
}: ExamFilterSidebarProps) {
  // 사이드바 상태
  const [showSidebar, setShowSidebar] = useAtom(showFilterSidebarAtom);
  const [isCollapsed, setIsCollapsed] = useAtom(collapsedFilterSidebarAtom);

  // 파생 상태
  const activeFiltersCount = useAtomValue(activeFiltersCountAtom);
  const resetAllFilters = useSetAtom(resetAllFiltersAtom);

  // 로컬 상태
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    search: true,
    quick: true,
    date: false,
    performance: false,
    content: false,
    advanced: false,
  });

  // 모바일 감지 상태
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  /**
   * 섹션 확장/축소 토글
   */
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!showSidebar) return null;

  // 모바일에서는 Sheet를 사용, 데스크톱에서는 Card 사용
  if (isMobile) {
    return (
      <Sheet open={showSidebar} onOpenChange={setShowSidebar}>
        <SheetContent side="left" className="w-full max-w-sm p-0">
          <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4" />
              필터
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription>
              시험 목록을 원하는 조건으로 필터링하세요
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 px-4">
            {/* 모바일 헤더 버튼들 */}
            <div className="flex justify-end gap-2 py-2 border-b mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => resetAllFilters()}
                disabled={activeFiltersCount === 0}
                className="h-8 px-2"
                title="모든 필터 초기화"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                초기화
              </Button>
            </div>

            <FilterContent
              isMobileMode={true}
              expandedSections={expandedSections}
              toggleSection={toggleSection}
              availableUnits={availableUnits}
              availableExamTypes={availableExamTypes}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // 데스크톱에서는 기존 Card 구조 사용
  return (
    <Card className={cn("w-80 h-fit flex-shrink-0", className)}>
      {/* 헤더 */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-lg">필터</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* 축소/확장 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? "필터 확장" : "필터 축소"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
            {/* 초기화 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => resetAllFilters()}
              title="모든 필터 초기화"
              disabled={activeFiltersCount === 0}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            {/* 닫기 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowSidebar(false)}
              title="필터 사이드바 닫기"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardDescription>
          시험 목록을 원하는 조건으로 필터링하세요
        </CardDescription>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0">
          <FilterContent
            isMobileMode={false}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            availableUnits={availableUnits}
            availableExamTypes={availableExamTypes}
          />
        </CardContent>
      )}
    </Card>
  );
}

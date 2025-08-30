import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Trash2 } from "lucide-react";
import { SelectGrade } from "./SelectGrade";

/**
 * 툴바 컴포넌트 Props
 */
type ToolbarProps = {
  /** 검색 키워드 */
  searchKeyword: string;
  /** 검색 키워드 변경 핸들러 */
  onSearchChange: (value: string) => void;
  /** 검색 범위 */
  searchScope: string;
  /** 검색 범위 변경 핸들러 */
  onSearchScopeChange: (value: string) => void;
  /** 검색 범위 옵션 */
  searchScopeOptions: Array<{ value: string; label: string }>;
  /** 선택된 항목 수 */
  selectedCount: number;
  /** 삭제 핸들러 */
  onDelete?: () => void;
  /** 학년 선택 표시 여부 */
  isShowGradeSelect?: boolean;
  /** 검색 플레이스홀더 */
  searchPlaceholder?: string;
  /** 검색 범위 플레이스홀더 */
  searchScopePlaceholder?: string;
  /** 참여 현황 필터 표시 여부 */
  isShowParticipationFilter?: boolean;
  /** 참여 현황 필터 값 */
  participationFilter?: string;
  /** 참여 현황 필터 변경 핸들러 */
  onParticipationFilterChange?: (value: string) => void;
};

/**
 * 공통 툴바 컴포넌트
 * @description 검색, 필터, 삭제 기능을 제공하는 재사용 가능한 툴바
 *
 * 주요 기능:
 * - 검색 기능 (키워드 + 범위)
 * - 학년 선택 (선택적)
 * - 선택된 항목 삭제
 * - 일관된 UI 패턴 제공
 */
export function Toolbar({
  searchKeyword,
  onSearchChange,
  searchScope,
  onSearchScopeChange,
  searchScopeOptions,
  selectedCount,
  onDelete,
  isShowGradeSelect = true,
  searchPlaceholder = "검색어를 입력하세요",
  searchScopePlaceholder = "검색 범위",
  isShowParticipationFilter = false,
  participationFilter,
  onParticipationFilterChange,
}: ToolbarProps) {
  return (
    <div className="flex justify-between items-center">
      {/* 왼쪽 영역: 필터와 액션 */}
      <div className="flex items-center gap-2">
        {/* 학년 선택 */}
        {isShowGradeSelect && <SelectGrade />}

        {/* 참여 현황 필터 */}
        {isShowParticipationFilter && onParticipationFilterChange && (
          <Select
            value={participationFilter}
            onValueChange={onParticipationFilterChange}
          >
            <SelectTrigger className="w-40 h-8">
              <SelectValue placeholder="참여 현황" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="high">높은 참여율 (80% 이상)</SelectItem>
              <SelectItem value="medium">보통 참여율 (50-79%)</SelectItem>
              <SelectItem value="low">낮은 참여율 (50% 미만)</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* 삭제 버튼 - 선택된 항목이 있을 때만 표시 */}
        {selectedCount > 0 && onDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="h-8 px-2"
            title={`선택된 ${selectedCount}개 삭제`}
          >
            <Trash2 className="h-4 w-4" />
            <span className="ml-1 text-xs">({selectedCount})</span>
          </Button>
        )}
      </div>

      {/* 오른쪽 영역: 검색 */}
      <div className="flex items-center gap-2">
        {/* 검색 범위 선택 드롭다운 */}
        <Select value={searchScope} onValueChange={onSearchScopeChange}>
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder={searchScopePlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {searchScopeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 검색 입력창 */}
        <div className="relative">
          <Input
            placeholder={searchPlaceholder}
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-64 h-8 pr-8"
          />
          <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

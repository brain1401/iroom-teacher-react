import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 포켓몬 검색 컴포넌트 Props 인터페이스
 */
type PokemonSearchProps = {
  /** 현재 검색 키워드 */
  keyword?: string;
}

/**
 * 포켓몬 검색 폼 컴포넌트
 *
 * @description 포켓몬 이름 또는 ID로 검색할 수 있는 폼을 제공하며,
 * 검색 결과에 따라 페이지 이동과 검색어 초기화 기능을 포함함
 *
 * @param keyword - 현재 검색 키워드 (URL 파라미터에서 가져옴)
 */
export function PokemonSearch({ keyword = "" }: PokemonSearchProps) {
  // 라우터 네비게이션 훅
  const navigate = useNavigate({ from: "/examples/pokemon" });

  return (
    <form
      className="flex items-center gap-3 h-[2.7rem]"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchKeyword = formData.get("keyword") as string;

        // 검색 키워드로 페이지 이동 (첫 페이지로 리셋)
        navigate({
          search: (prev) => ({
            ...prev,
            keyword: searchKeyword.trim() || undefined,
            page: 1,
          }),
        });
      }}
    >
      <div className="relative flex-1 h-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          name="keyword"
          defaultValue={keyword}
          placeholder="포켓몬 이름 또는 ID로 검색하세요..."
          className={cn(
            "pl-10 pr-4 h-full text-base",
            "focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200",
          )}
        />
      </div>

      <Button type="submit" size="lg" className="gap-2 h-full">
        <Search className="w-4 h-4" />
        검색
      </Button>

      {keyword && (
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => {
            // 검색어 초기화 및 첫 페이지로 이동
            navigate({
              search: (prev) => ({ ...prev, keyword: undefined, page: 1 }),
            });
          }}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          초기화
        </Button>
      )}
    </form>
  );
}

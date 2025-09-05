import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { extractPokemonId } from "@/utils/pokemon";
import { formatPokemonId, formatPokemonName } from "@/utils/pokemonStyles";
import { cn } from "@/lib/utils";
import { usePokemonCardImage } from "@/hooks/pokemon";

type PokemonCardProps = {
  /** 포켓몬 이름 */
  name: string;
  /** 포켓몬 API URL */
  url: string;
  /** 카드 클릭 시 이동할 경로 */
  href?: string;
};

/**
 * 포켓몬 카드 컴포넌트
 * 이미지, 이름, 번호를 표시하는 현대적인 카드 UI
 *
 * 설계 원칙:
 * - 목록에서는 기본 정보만 표시 (이름, 번호, 이미지)
 * - 상세 정보(타입, 능력치 등)는 상세 페이지에서 atom으로 관리
 * - 커스텀 훅을 통한 이미지 로딩 로직 캡슐화
 * - 단순하고 이해하기 쉬운 UI 컴포넌트
 */
export function PokemonCard({
  name,
  url,
  href = "/examples/pokemon/$id",
}: PokemonCardProps) {
  const pokemonId = extractPokemonId(url);

  // 커스텀 훅으로 이미지 로딩 로직 캡슐화
  const {
    finalImageUrl,
    isLoading,
    hasError,
    imgRef,
    handleImageLoad,
    handleImageError,
  } = usePokemonCardImage({ name, url });

  return (
    <Link
      to={href}
      params={{ id: name }}
      className="block transform transition-all duration-300 hover:scale-105"
    >
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300",
          "hover:shadow-2xl hover:-translate-y-1",
          "border-2 bg-gradient-to-br from-white to-gray-50",
          "hover:ring-2 hover:ring-primary/50",
        )}
      >
        {/* 배경 그라디언트 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30" />

        {/* 장식용 원 */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm" />

        <div className="relative p-4 space-y-3">
          {/* 포켓몬 번호 */}
          <div className="text-right">
            <span className="text-sm font-bold text-muted-foreground/70">
              {formatPokemonId(pokemonId || "0")}
            </span>
          </div>

          {/* 포켓몬 이미지 */}
          <div className="relative h-32 flex items-center justify-center">
            {/* 고정 크기 이미지 컨테이너 - 레이아웃 시프트 방지 */}
            <div className="w-28 h-28 relative flex items-center justify-center transition-transform duration-300 hover:scale-110">
              {/* 로딩 스켈레톤 - 실제 이미지와 동일한 크기 */}
              {isLoading && <Skeleton className="w-28 h-28 rounded-full" />}

              {/* 실제 이미지 - 컨테이너와 동일한 크기로 고정 */}
              {!hasError && (
                <img
                  ref={imgRef}
                  src={finalImageUrl}
                  alt={`${name} 포켓몬 이미지`}
                  className={cn(
                    "absolute inset-0 w-full h-full object-contain drop-shadow-lg transition-opacity duration-300",
                    isLoading ? "opacity-0" : "opacity-100",
                  )}
                  loading="eager"
                  fetchPriority="high"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  referrerPolicy="no-referrer"
                />
              )}

              {/* 에러 상태 - 스켈레톤과 동일한 크기 */}
              {hasError && (
                <Skeleton className="w-28 h-28 rounded-full flex items-center justify-center">
                  <span className="text-muted-foreground text-xs">
                    이미지 없음
                  </span>
                </Skeleton>
              )}
            </div>
          </div>

          {/* 포켓몬 이름 */}
          <h3 className="text-center font-bold text-lg">
            {formatPokemonName(name)}
          </h3>

          {/* 클릭 안내 */}
          <div className="text-center">
            <span className="text-xs text-muted-foreground">
              클릭하여 자세히 보기
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

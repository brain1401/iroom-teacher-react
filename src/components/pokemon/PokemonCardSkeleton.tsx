import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * 포켓몬 카드 스켈레톤
 * @description 실제 PokemonCard와 동일한 레이아웃으로 제작하여 레이아웃 점프 방지
 *
 * 개선사항:
 * - 실제 카드와 동일한 배경 그라디언트 및 장식 요소 추가
 * - 정확한 크기와 간격 매칭으로 깜빡임 현상 제거
 * - hover 효과는 제외하여 성능 최적화
 */
export function PokemonCardSkeleton() {
  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300",
        "border-2 bg-gradient-to-br from-white to-gray-50",
      )}
    >
      {/* 배경 그라디언트 - 실제 카드와 동일 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30" />

      {/* 장식용 원 - 실제 카드와 동일 */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm" />
      <div className="absolute -left-8 -bottom-8 w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm" />

      <div className="relative p-4 space-y-3">
        {/* 포켓몬 번호 */}
        <div className="text-right">
          <Skeleton className="inline-block h-4 w-12" />
        </div>

        {/* 포켓몬 이미지 영역 - 실제 카드와 동일한 구조 */}
        <div className="relative h-32 flex items-center justify-center">
          {/* 고정 크기 이미지 컨테이너 - 실제 카드와 동일 */}
          <div className="w-28 h-28 relative flex items-center justify-center">
            <Skeleton className="w-28 h-28 rounded-full" />
          </div>
        </div>

        {/* 포켓몬 이름 */}
        <Skeleton className="h-6 w-24 mx-auto" />

        {/* 클릭 안내 */}
        <div className="text-center">
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      </div>
    </Card>
  );
}

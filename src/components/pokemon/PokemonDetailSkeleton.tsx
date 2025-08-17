import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, Sparkles, Zap } from "lucide-react";

/**
 * 포켓몬 상세 정보 로딩 스켈레톤 컴포넌트
 * @description 포켓몬 상세 정보를 불러오는 동안 표시되는 로딩 UI
 *
 * 스켈레톤이란?
 * - 콘텐츠가 로딩되는 동안 보여주는 임시 UI
 * - 실제 콘텐츠와 비슷한 형태로 만들어서 자연스러운 로딩 경험 제공
 * - 흰색 화면 대신 사용자에게 "로딩 중임"을 시각적으로 알려줌
 *
 * 사용 시점:
 * - React Query의 isLoading이 true일 때
 * - 포켓몬 상세 정보 API 요청 중일 때
 *
 * @returns 포켓몬 상세 페이지와 동일한 레이아웃의 스켈레톤 UI
 */
export function PokemonDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto p-4 max-w-7xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button variant="ghost" size="lg" disabled className="gap-2">
            <ChevronLeft className="w-5 h-5" />
            목록으로
          </Button>
        </div>

        <Card className="overflow-hidden shadow-2xl border-2">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* 이미지 영역 스켈레톤 */}
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 lg:p-12 flex items-center justify-center">
              <div className="w-full max-w-sm aspect-square">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>

            {/* 정보 영역 스켈레톤 */}
            <div className="p-8 lg:p-12 bg-white">
              <div className="space-y-8">
                {/* 헤더 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-gray-300" />
                    <Skeleton className="h-12 w-64" />
                  </div>

                  {/* 타입 뱃지 */}
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>

                {/* 신체 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>

                {/* 능력치 */}
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <Zap className="w-5 h-5 text-gray-300" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="space-y-4">
                    {Array.from({ length: 6 }, (_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-12" />
                        </div>
                        <Skeleton className="h-4 w-full rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* 경험치 */}
                <Skeleton className="h-20 rounded-lg" />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { PokemonCardSkeleton } from "@/components/pokemon";

export function PokemonListLoading() {
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          포켓몬 도감
        </h1>
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 20 }, (_, i) => {
          // Create stable key for skeleton loading items using a meaningful identifier
          const skeletonId = `pokemon-skeleton-item-${i + 1}`;
          return <PokemonCardSkeleton key={skeletonId} />;
        })}
      </div>
    </div>
  );
}

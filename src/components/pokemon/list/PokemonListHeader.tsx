import { Sparkles } from "lucide-react";

export function PokemonListHeader() {
  return (
    <div className="mb-8 text-center space-y-4">
      <div className="inline-flex items-center gap-2 mb-2">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Pokédex Collection
        </span>
        <Sparkles className="w-6 h-6 text-yellow-500" />
      </div>
      <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
        포켓몬 도감
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        다양한 포켓몬들을 만나보세요! 클릭하여 상세 정보를 확인할 수 있습니다.
      </p>
    </div>
  );
}

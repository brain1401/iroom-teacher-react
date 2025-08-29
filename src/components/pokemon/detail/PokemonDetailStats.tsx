import { Zap, Shield, Swords, Brain, Heart, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStatDisplayName, getStatGradient } from "@/utils/pokemonStyles";
import type { Pokemon } from "@/api/pokemon/types";

type Props = {
  pokemon: Pokemon;
};

const statIcons: Record<string, LucideIcon> = {
  hp: Heart,
  attack: Swords,
  defense: Shield,
  "special-attack": Zap,
  "special-defense": Brain,
  speed: Wind,
};

/** 능력치 섹션 컴포넌트 -함 */
export function PokemonDetailStats({ pokemon }: Props) {
  return (
    <div>
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-yellow-500" />
        능력치
      </h3>
      <div className="space-y-4">
        {pokemon.stats.map((s) => {
          const Icon = statIcons[s.stat.name] || Zap;
          return (
            <div key={s.stat.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">
                    {getStatDisplayName(s.stat.name)}
                  </span>
                </div>
                <span className="font-bold text-lg">{s.base_stat}</span>
              </div>
              <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-y-0 left-0 bg-gradient-to-r rounded-full transition-all duration-1000",
                    getStatGradient(s.stat.name),
                  )}
                  style={{
                    width: `${Math.min(100, (s.base_stat / 200) * 100)}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

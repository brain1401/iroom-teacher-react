import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getTypeBadgeClass,
  formatPokemonName,
  isPokemonTypeName,
} from "@/utils/pokemonStyles";
import type { Pokemon } from "@/api/pokemon/types";

type Props = {
  pokemon: Pokemon;
};

/** 헤더 섹션 컴포넌트 -함 */
export function PokemonDetailHeader({ pokemon }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-yellow-500" />
        <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          {formatPokemonName(pokemon.name)}
        </h1>
      </div>

      <div className="flex gap-2 flex-wrap">
        {pokemon.types.map((t) => {
          const typeName = t.type.name;
          const badgeClass = isPokemonTypeName(typeName)
            ? getTypeBadgeClass(typeName)
            : "bg-gray-500 text-white"; // fallback for unknown types

          return (
            <Badge
              key={typeName}
              className={cn(
                "capitalize px-4 py-2 text-sm font-semibold shadow-lg",
                badgeClass,
              )}
            >
              {typeName}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

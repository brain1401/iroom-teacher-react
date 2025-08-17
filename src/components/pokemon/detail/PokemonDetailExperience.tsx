import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import type { Pokemon } from "@/api/pokemon/types";

type Props = {
  pokemon: Pokemon;
};

/** 경험치 섹션 컴포넌트 -함 */
export function PokemonDetailExperience({ pokemon }: Props) {
  if (!pokemon.base_experience) return null;
  return (
    <Card className="border-2 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">기본 경험치</span>
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {pokemon.base_experience} EXP
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

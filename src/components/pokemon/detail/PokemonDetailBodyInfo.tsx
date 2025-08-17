import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Weight } from "lucide-react";
import type { Pokemon } from "@/api/pokemon/types";

type Props = {
  pokemon: Pokemon;
};

/** 신체 정보 섹션 컴포넌트 -함 */
export function PokemonDetailBodyInfo({ pokemon }: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-2">
        <CardContent className="p-4 flex items-center gap-3">
          <Ruler className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm text-muted-foreground">키</p>
            <p className="text-xl font-bold">
              {(pokemon.height / 10).toFixed(1)}m
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardContent className="p-4 flex items-center gap-3">
          <Weight className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm text-muted-foreground">무게</p>
            <p className="text-xl font-bold">
              {(pokemon.weight / 10).toFixed(1)}kg
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

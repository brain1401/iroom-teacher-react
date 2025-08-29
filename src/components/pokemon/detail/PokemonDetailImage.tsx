import { cn } from "@/lib/utils";
import { getTypeBgGradient, formatPokemonId, isPokemonTypeName } from "@/utils/pokemonStyles";
import type { Pokemon } from "@/api/pokemon/types";
import { usePokemonImage } from "@/hooks/pokemon";

type Props = {
  pokemon: Pokemon;
  idParam: string;
};

/** 이미지 섹션 컴포넌트 -함 */
export function PokemonDetailImage({ pokemon, idParam }: Props) {
  const primaryTypeName = pokemon.types[0]?.type?.name || "normal";
  const primaryType = isPokemonTypeName(primaryTypeName) ? primaryTypeName : "normal";
  const bgGradient = getTypeBgGradient(primaryType);

  const {
    imageUrl,
    isImageLoading,
    hasImageError,
    handleImageLoad,
    handleImageError,
  } = usePokemonImage(pokemon, idParam);

  return (
    <div
      className={cn(
        "relative p-8 lg:p-12 flex items-center justify-center",
        bgGradient,
      )}
    >
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/30 blur-xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-white/30 blur-xl" />
      </div>

      <div className="absolute top-6 right-6">
        <span className="text-2xl font-bold text-black/60 dark:text-white/60">
          {formatPokemonId(pokemon.id)}
        </span>
      </div>

      <div className="relative z-10 w-full max-w-sm aspect-square animate-float">
        {isImageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white/30 rounded-full animate-pulse" />
          </div>
        )}

        {hasImageError ? (
          <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-lg">
            <span className="text-white/70 text-lg">이미지 없음</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={pokemon.name}
            loading="eager"
            crossOrigin="anonymous"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              "w-full h-full object-contain drop-shadow-2xl transition-all duration-300",
              "hover:scale-110",
              isImageLoading ? "opacity-0" : "opacity-100",
            )}
          />
        )}
      </div>
    </div>
  );
}

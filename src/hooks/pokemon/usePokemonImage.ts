import { useCallback, useMemo, useState } from "react";
import type { Pokemon } from "@/api/pokemon/types";

/**
 * 포켓몬 상세 이미지 로딩 상태 관리 훅
 * -함
 */
export function usePokemonImage(
  pokemon: Pokemon | null | undefined,
  idOrName: string,
) {
  const primaryImageUrl =
    pokemon?.sprites.other?.["official-artwork"]?.front_default;
  const fallbackImageUrl = pokemon?.sprites.front_default ?? null;

  /** 직접 생성 이미지 URL (id 기반) -함 */
  const directImageUrl = useMemo(() => {
    const key = pokemon?.id ? String(pokemon.id) : String(idOrName);
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${key}.png`;
  }, [pokemon?.id, idOrName]);

  /** 최종 사용 이미지 URL -함 */
  const imageUrl = primaryImageUrl || fallbackImageUrl || directImageUrl;

  const [hasImageError, setHasImageError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);

  /** 이미지 로드 완료 핸들러 -함 */
  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
    setHasImageError(false);
  }, []);

  /** 이미지 에러 핸들러 (단계적 대체) -함 */
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      if (fallbackImageUrl && e.currentTarget.src !== fallbackImageUrl) {
        e.currentTarget.src = fallbackImageUrl;
        return;
      }
      setIsImageLoading(false);
      setHasImageError(true);
    },
    [fallbackImageUrl],
  );

  return {
    imageUrl,
    isImageLoading,
    hasImageError,
    handleImageLoad,
    handleImageError,
  };
}

/**
 * 포켓몬 관련 커스텀 훅 모음
 * @description 포켓몬 이미지 로딩, 상태 관리 등을 위한 재사용 가능한 React 훅들
 */

// 포켓몬 카드 이미지 관리 훅
export { usePokemonCardImage } from "./usePokemonCardImage";

// 포켓몬 상세 이미지 관리 훅
export { usePokemonImage } from "./usePokemonImage";

/**
 * @example
 * // 포켓몬 카드 이미지 로딩
 * import { usePokemonCardImage } from '@/hooks/pokemon';
 *
 * const { finalImageUrl, isLoading, hasError, imgRef, handleImageLoad, handleImageError } =
 *   usePokemonCardImage({ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' });
 *
 * @example
 * // 포켓몬 상세 이미지 로딩
 * import { usePokemonImage } from '@/hooks/pokemon';
 *
 * const { imageUrl, isImageLoading, hasImageError, handleImageLoad, handleImageError } =
 *   usePokemonImage(pokemon, idOrName);
 */

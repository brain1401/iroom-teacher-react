/**
 * 포켓몬 관련 헬퍼 함수들
 * @description 포켓몬 데이터 처리를 위한 유틸리티 함수들
 */

/**
 * 포켓몬 API URL에서 ID를 추출하는 함수
 * @description API에서 받은 URL 문자열에서 포켓몬 ID 번호를 파싱
 * @example
 * ```typescript
 * const url = "https://pokeapi.co/api/v2/pokemon/25/";
 * const id = extractPokemonId(url); // "25"
 * ```
 * @param url 포켓몬 API URL (예: "https://pokeapi.co/api/v2/pokemon/25/")
 * @returns 추출된 포켓몬 ID 문자열, 매칭되지 않으면 빈 문자열
 */
export function extractPokemonId(url: string): string {
  // 방어적 프로그래밍: null/undefined 체크
  if (!url || typeof url !== "string") {
    return "";
  }

  // URL 패턴: https://pokeapi.co/api/v2/pokemon/{id}/
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  return match ? match[1] : "";
}

/**
 * 포켓몬 공식 아트워크 이미지 URL을 생성하는 함수
 * @description 고품질 공식 아트워크 이미지 URL을 만드는 함수 (대부분의 경우 이 이미지 사용 규장)
 * @example
 * ```typescript
 * const imageUrl = getPokemonImageUrl("25");        // 피카촄 ID로
 * const imageUrl2 = getPokemonImageUrl("pikachu");  // 피카촄 이름으로
 * ```
 * @param idOrName 포켓몬 ID 또는 이름
 * @returns 공식 아트워크 이미지 URL
 */
export function getPokemonImageUrl(idOrName: string): string {
  // 방어적 프로그래밍: 입력값 검증 및 URL 인코딩 안전장치
  if (!idOrName || typeof idOrName !== "string") {
    return "";
  }

  // URL 안전한 문자열로 인코딩 (특수문자 처리)
  const safeIdOrName = encodeURIComponent(idOrName.trim().toLowerCase());

  // official artwork를 우선 사용 (고품질 이미지)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${safeIdOrName}.png`;
}

/**
 * 포켓몬 폴백 이미지 URL을 생성하는 함수
 * @description 공식 아트워크 이미지가 로드되지 않을 때 대체용 이미지 URL
 * @example
 * ```typescript
 * const fallbackUrl = getPokemonFallbackImageUrl("25");
 *
 * // 이미지 로드 실패 시 사용 예시
 * <img
 *   src={getPokemonImageUrl("25")}
 *   onError={(e) => e.target.src = getPokemonFallbackImageUrl("25")}
 * />
 * ```
 * @param idOrName 포켓몬 ID 또는 이름
 * @returns 폴백 이미지 URL (낮은 품질이지만 더 안정적)
 */
export function getPokemonFallbackImageUrl(idOrName: string): string {
  // 방어적 프로그래밍: 입력값 검증 및 URL 인코딩 안전장치
  if (!idOrName || typeof idOrName !== "string") {
    return "";
  }

  // URL 안전한 문자열로 인코딩 (특수문자 처리)
  const safeIdOrName = encodeURIComponent(idOrName.trim().toLowerCase());

  // fallback 이미지 (낮은 품질이지만 더 안정적)
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${safeIdOrName}.png`;
}

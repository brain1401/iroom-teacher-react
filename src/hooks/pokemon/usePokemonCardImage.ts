import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { extractPokemonId, getPokemonImageUrl } from "@/utils/pokemon";
import type React from "react";

interface UsePokemonCardImageProps {
  /** 포켓몬 이름 */
  name: string;
  /** 포켓몬 API URL */
  url: string;
}

interface UsePokemonCardImageReturn {
  /** 최종 사용할 이미지 URL */
  finalImageUrl: string;
  /** 이미지 로딩 상태 */
  isLoading: boolean;
  /** 이미지 에러 상태 */
  hasError: boolean;
  /** 이미지 ref */
  imgRef: React.RefObject<HTMLImageElement | null>;
  /** 이미지 로드 완료 핸들러 */
  handleImageLoad: () => void;
  /** 이미지 에러 핸들러 */
  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * 포켓몬 카드 이미지 로딩 상태 관리 훅
 * @description 복잡한 이미지 로딩 로직을 캡슐화하여 재사용 가능하게 만든 커스텀 훅
 *
 * 주요 기능:
 * - 다단계 fallback 이미지 처리
 * - 타임아웃 기반 로딩 상태 관리
 * - 캐시된 이미지 즉시 감지 (성능 최적화)
 * - 메모리 누수 방지를 위한 정리 로직
 */
export function usePokemonCardImage({
  name,
  url,
}: UsePokemonCardImageProps): UsePokemonCardImageReturn {
  const pokemonId = extractPokemonId(url);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // ref를 사용한 개선된 이미지 로딩 관리
  const imgRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 방어적 프로그래밍: 다중 fallback으로 pokemonId 확보
  const safePokemonId = pokemonId || name;

  // React 모범 사례: 이미지 URL 계산 최적화 (useMemo로 불필요한 재계산 방지)
  const { imageUrl, fallbackImageUrl, placeholderImageUrl, finalImageUrl } =
    useMemo(() => {
      // 이미지 URL 계산 (header preload로 이미 캐시됨)
      const primary = safePokemonId ? getPokemonImageUrl(safePokemonId) : "";
      const fallback = safePokemonId
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${safePokemonId}.png`
        : "";

      // 최종 안전장치: 기본 이미지 URL (SVG placeholder)
      const placeholder =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTEyIiBoZWlnaHQ9IjExMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iI2YzZjRmNiIgcng9IjIiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjEwIiByPSIzIiBmaWxsPSIjZDFkNWRiIi8+PHBhdGggZD0iTTkgMTZoNmExIDEgMCAwIDEgMSAxdjFhMSAxIDAgMCAxLTEgMUg5YTEgMSAwIDAgMS0xLTF2LTFhMSAxIDAgMCAxIDEtMXoiIGZpbGw9IiNkMWQ1ZGIiLz48L3N2Zz4=";

      // 실제 사용할 이미지 URL: 우선순위 기반 선택
      const final = primary || fallback || placeholder;

      return {
        imageUrl: primary,
        fallbackImageUrl: fallback,
        placeholderImageUrl: placeholder,
        finalImageUrl: final,
      };
    }, [safePokemonId]);

  // 타임아웃 정리 함수
  const clearLoadingTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // 캐시된 이미지 체크 함수 (즉시 로드된 이미지 감지)
  const checkIfImageLoaded = useCallback(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      console.log(`[PokemonCard] ${name} 캐시된 이미지 즉시 감지 ⚡`);
      clearLoadingTimeout();
      setIsLoading(false);
      setHasError(false);
      return true;
    }
    return false;
  }, [name, clearLoadingTimeout]);

  // 이미지 로드 완료 핸들러
  const handleImageLoad = useCallback(() => {
    console.log(`[PokemonCard] ${name} 이미지 로드 성공 ✅`);
    clearLoadingTimeout();
    setIsLoading(false);
    setHasError(false);
  }, [name, clearLoadingTimeout]);

  // 이미지 로드 에러 핸들러 (다단계 fallback)
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const currentSrc = e.currentTarget.src;

      // 1단계: 공식 이미지 실패 → fallback 이미지 시도
      if (
        currentSrc === imageUrl &&
        fallbackImageUrl &&
        currentSrc !== fallbackImageUrl
      ) {
        e.currentTarget.src = fallbackImageUrl;
        return;
      }

      // 2단계: fallback 이미지도 실패 → placeholder 이미지 시도
      if (
        currentSrc === fallbackImageUrl &&
        currentSrc !== placeholderImageUrl
      ) {
        e.currentTarget.src = placeholderImageUrl;
        return;
      }

      // 모든 fallback 실패 시 에러 상태로 설정
      console.warn(`[PokemonCard] 모든 이미지 소스 실패: ${name}`);
      setIsLoading(false);
      setHasError(true);
    },
    [name, imageUrl, fallbackImageUrl, placeholderImageUrl],
  );

  // 캐시된 이미지 즉시 감지 (새로고침 시 race condition 방지)
  useEffect(() => {
    // 이미지 URL이 변경되면 즉시 캐시된 이미지인지 체크
    const timer = setTimeout(() => {
      if (!checkIfImageLoaded()) {
        // 캐시된 이미지가 아니면 타임아웃 설정
        timeoutRef.current = setTimeout(() => {
          console.warn(
            `[PokemonCard] 이미지 로딩 타임아웃: ${name} (${safePokemonId})`,
          );
          setIsLoading(false);
          setHasError(true);
        }, 5000);
      }
    }, 0); // 다음 틱에서 실행하여 DOM 업데이트 후 체크

    return () => {
      clearTimeout(timer);
      clearLoadingTimeout();
    };
  }, [
    finalImageUrl,
    name,
    safePokemonId,
    checkIfImageLoaded,
    clearLoadingTimeout,
  ]);

  // 컴포넌트 언마운트 시 타임아웃 정리
  useEffect(() => {
    return () => clearLoadingTimeout();
  }, [clearLoadingTimeout]);

  return {
    finalImageUrl,
    isLoading,
    hasError,
    imgRef,
    handleImageLoad,
    handleImageError,
  };
}

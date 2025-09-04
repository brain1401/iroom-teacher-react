/**
 * Pokemon API Zod 검증 스키마 정의
 * @description 포켓몬 API (외부 PokeAPI) 응답에 대한 런타임 검증 스키마
 *
 * 주요 특징:
 * - 외부 API (https://pokeapi.co) 응답 구조 완벽 지원
 * - ApiResponse<T> 래핑 없는 직접 응답 형식
 * - 복잡한 중첩 구조와 nullable 필드 지원
 * - 포켓몬 데이터의 모든 세부사항 검증
 * - 상세한 에러 메시지로 디버깅 효율성 향상
 *
 * @example
 * ```typescript
 * import { PokemonListResponseSchema } from "@/api/pokemon/schemas";
 * import { validateApiResponse } from "@/api/client/validation";
 * 
 * const result = validateApiResponse(
 *   responseData,
 *   PokemonListResponseSchema,
 *   "https://pokeapi.co/api/v2/pokemon",
 *   "GET"
 * );
 * ```
 */

import { z } from "zod";

/**
 * URL 검증 스키마
 * @description PokeAPI에서 사용하는 URL 형식 검증
 */
const PokeApiUrlSchema = z.string().url({
  message: "올바른 URL 형식이어야 합니다"
}).refine((url) => {
  // PokeAPI URL인지 확인 (선택적 검증)
  return url.includes("pokeapi.co") || url.startsWith("http");
}, {
  message: "유효한 포켓몬 API URL이어야 합니다"
});

/**
 * API에서 자주 사용되는 기본 리소스 타입 스키마
 * @description 포켓몬 API의 모든 리소스가 공통으로 가지는 이름과 URL 정보
 */
const NamedAPIResourceSchema = z.object({
  /** 리소스 이름 */
  name: z.string().min(1, "리소스 이름은 비어있을 수 없습니다"),
  /** 상세 정보를 가져올 수 있는 API URL */
  url: PokeApiUrlSchema,
});

/**
 * 포켓몬 목록 API 응답 타입 스키마
 * @description 포켓몬 목록을 페이지네이션으로 가져올 때 받는 데이터 구조
 */
const PokemonListResponseSchema = z.object({
  /** 전체 포켓몬 개수 */
  count: z.number().int().nonnegative({
    message: "전체 포켓몬 개수는 0 이상의 정수여야 합니다"
  }),
  /** 다음 페이지 URL (마지막 페이지면 null) */
  next: PokeApiUrlSchema.nullable(),
  /** 이전 페이지 URL (첫 페이지면 null) */
  previous: PokeApiUrlSchema.nullable(),
  /** 현재 페이지의 포켓몬 목록 */
  results: z.array(NamedAPIResourceSchema),
});

/**
 * 포켓몬 타입 정보 스키마
 * @description 포켓몬이 가지는 타입 (불, 물, 풀 등)
 */
const PokemonTypeSchema = z.object({
  /** 타입 슬롯 번호 (첫 번째 타입: 1, 두 번째 타입: 2) */
  slot: z.number().int().positive({
    message: "타입 슬롯 번호는 1 이상의 정수여야 합니다"
  }),
  /** 타입 정보 (이름과 상세 URL 포함) */
  type: NamedAPIResourceSchema,
});

/**
 * 포켓몬 이미지 스프라이트 정보 스키마
 * @description 포켓몬의 다양한 형태 이미지 URL들 (정면, 후면, 색칠 등)
 */
const PokemonSpritesSchema = z.object({
  /** 기본 정면 이미지 */
  front_default: z.string().url().nullable(),
  /** 색칠된 정면 이미지 */
  front_shiny: z.string().url().nullable(),
  /** 암컷 정면 이미지 */
  front_female: z.string().url().nullable(),
  /** 색칠된 암컷 정면 이미지 */
  front_shiny_female: z.string().url().nullable(),
  /** 기본 후면 이미지 */
  back_default: z.string().url().nullable(),
  /** 색칠된 후면 이미지 */
  back_shiny: z.string().url().nullable(),
  /** 암컷 후면 이미지 */
  back_female: z.string().url().nullable(),
  /** 색칠된 암컷 후면 이미지 */
  back_shiny_female: z.string().url().nullable(),
  /** 추가 이미지 소스들 */
  other: z.object({
    /** 공식 아트워크 이미지 */
    "official-artwork": z.object({
      /** 기본 공식 아트워크 */
      front_default: z.string().url().nullable(),
      /** 색칠된 공식 아트워크 */
      front_shiny: z.string().url().nullable(),
    }).optional(),
    /** 드림월드 이미지 */
    dream_world: z.object({
      /** 드림월드 기본 이미지 */
      front_default: z.string().url().nullable(),
      /** 드림월드 암컷 이미지 */
      front_female: z.string().url().nullable(),
    }).optional(),
    /** 홈 스타일 이미지 */
    home: z.object({
      /** 홈 기본 이미지 */
      front_default: z.string().url().nullable(),
      /** 홈 암컷 이미지 */
      front_female: z.string().url().nullable(),
      /** 홈 색칠 이미지 */
      front_shiny: z.string().url().nullable(),
      /** 홈 색칠된 암컷 이미지 */
      front_shiny_female: z.string().url().nullable(),
    }).optional(),
  }).optional(),
});

/**
 * 포켓몬 능력치 정보 스키마
 * @description 포켓몬의 HP, 공격력, 방어력 등의 스탯 정보
 */
const PokemonStatSchema = z.object({
  /** 기본 능력치 수치 */
  base_stat: z.number().int().nonnegative({
    message: "기본 능력치는 0 이상의 정수여야 합니다"
  }),
  /** 노력치 수치 */
  effort: z.number().int().nonnegative({
    message: "노력치는 0 이상의 정수여야 합니다"
  }),
  /** 능력치 종류 (HP, 공격, 방어 등) */
  stat: NamedAPIResourceSchema,
});

/**
 * 포켓몬 특성 정보 스키마
 * @description 포켓몬이 가진 특성 (능력) 정보
 */
const PokemonAbilitySchema = z.object({
  /** 숨겨진 특성 여부 */
  is_hidden: z.boolean(),
  /** 특성 슬롯 번호 */
  slot: z.number().int().positive({
    message: "특성 슬롯 번호는 1 이상의 정수여야 합니다"
  }),
  /** 특성 정보 (이름과 상세 URL 포함) */
  ability: NamedAPIResourceSchema,
});

/**
 * 포켓몬 폼 정보 스키마
 * @description 포켓몬의 다양한 형태 (예: 알로라 형태, 갈라르 형태)
 */
const PokemonFormSchema = z.object({
  /** 폼 이름 */
  name: z.string().min(1, "폼 이름은 비어있을 수 없습니다"),
  /** 폼 상세 정보 URL */
  url: PokeApiUrlSchema,
});

/**
 * 버전 그룹 상세 정보 스키마
 * @description 포켓몬이 기술을 배우는 방법과 레벨 정보
 */
const VersionGroupDetailSchema = z.object({
  /** 기술을 배우는 레벨 */
  level_learned_at: z.number().int().nonnegative({
    message: "기술 학습 레벨은 0 이상의 정수여야 합니다"
  }),
  /** 게임 버전 그룹 */
  version_group: NamedAPIResourceSchema,
  /** 기술 학습 방법 */
  move_learn_method: NamedAPIResourceSchema,
});

/**
 * 포켓몬 기술 정보 스키마
 * @description 포켓몬이 배울 수 있는 기술과 학습 조건
 */
const PokemonMoveSchema = z.object({
  /** 기술 정보 */
  move: NamedAPIResourceSchema,
  /** 각 버전별 학습 상세 정보 */
  version_group_details: z.array(VersionGroupDetailSchema),
});

/**
 * 포켓몬 소지 아이템 정보 스키마
 * @description 포켓몬이 야생에서 소지할 수 있는 아이템
 */
const PokemonHeldItemSchema = z.object({
  /** 아이템 정보 */
  item: NamedAPIResourceSchema,
  /** 각 버전별 상세 정보 */
  version_details: z.array(z.object({
    /** 아이템 소지 확률 */
    rarity: z.number().min(0).max(100, {
      message: "아이템 소지 확률은 0-100 사이여야 합니다"
    }),
    /** 게임 버전 */
    version: NamedAPIResourceSchema,
  })),
});

/**
 * 포켓몬 게임 인덱스 정보 스키마
 * @description 각 게임에서의 포켓몬 도감 번호
 */
const PokemonGameIndexSchema = z.object({
  /** 게임내 도감 번호 */
  game_index: z.number().int().positive({
    message: "게임 도감 번호는 1 이상의 정수여야 합니다"
  }),
  /** 게임 버전 */
  version: NamedAPIResourceSchema,
});

/**
 * 포켓몬 과거 타입 정보 스키마
 * @description 이전 세대에서 가졌던 타입 정보
 */
const PokemonPastTypeSchema = z.object({
  /** 세대 정보 */
  generation: NamedAPIResourceSchema,
  /** 당시 가졌던 타입들 */
  types: z.array(PokemonTypeSchema),
});

/**
 * 포켓몬 과거 특성 정보 스키마
 * @description 이전 세대에서 가졌던 특성 정보
 */
const PokemonPastAbilitySchema = z.object({
  /** 세대 정보 */
  generation: NamedAPIResourceSchema,
  /** 당시 가졌던 특성들 */
  abilities: z.array(PokemonAbilitySchema),
});

/**
 * 포켓몬 완전한 정보 타입 스키마
 * @description 포켓몬의 모든 상세 정보를 담는 메인 타입 (API에서 받는 전체 데이터)
 */
const PokemonSchema = z.object({
  /** 포켓몬 고유 ID 번호 */
  id: z.number().int().positive({
    message: "포켓몬 ID는 1 이상의 정수여야 합니다"
  }),
  /** 포켓몬 이름 */
  name: z.string().min(1, "포켓몬 이름은 비어있을 수 없습니다"),
  /** 키 (데시미터 단위, 예: 7 = 0.7m) */
  height: z.number().positive({
    message: "포켓몬 키는 양수여야 합니다"
  }),
  /** 몸무게 (헥토그램 단위, 예: 69 = 6.9kg) */
  weight: z.number().positive({
    message: "포켓몬 몸무게는 양수여야 합니다"
  }),
  /** 기본 경험치 (null일 수 있음) */
  base_experience: z.number().int().nonnegative().nullable(),
  /** 기본 형태 여부 */
  is_default: z.boolean(),
  /** 포켓몬 정렬 순서 */
  order: z.number().int(),
  /** 포켓몬 이미지들 (정면, 후면, 색칠 등) */
  sprites: PokemonSpritesSchema,
  /** 포켓몬 타입들 (불, 물, 풀 등) */
  types: z.array(PokemonTypeSchema).min(1, "포켓몬은 최소 하나의 타입을 가져야 합니다"),
  /** 포켓몬 능력치들 (HP, 공격, 방어 등) */
  stats: z.array(PokemonStatSchema).length(6, "포켓몬은 정확히 6개의 능력치를 가져야 합니다"),
  /** 포켓몬 특성들 (능력) */
  abilities: z.array(PokemonAbilitySchema).min(1, "포켓몬은 최소 하나의 특성을 가져야 합니다"),
  /** 포켓몬 폼들 (다양한 형태) */
  forms: z.array(PokemonFormSchema),
  /** 각 게임에서의 도감 번호들 */
  game_indices: z.array(PokemonGameIndexSchema),
  /** 야생에서 소지할 수 있는 아이템들 */
  held_items: z.array(PokemonHeldItemSchema),
  /** 서식지 정보 API URL */
  location_area_encounters: PokeApiUrlSchema,
  /** 배울 수 있는 기술들 */
  moves: z.array(PokemonMoveSchema),
  /** 과거 세대의 타입 변경 이력 */
  past_types: z.array(PokemonPastTypeSchema),
  /** 과거 세대의 특성 변경 이력 */
  past_abilities: z.array(PokemonPastAbilitySchema),
  /** 포켓몬 종족 정보 */
  species: NamedAPIResourceSchema,
});

// ===== 최종 검증 스키마들 (외부 API용) =====

/**
 * 포켓몬 목록 API 응답 스키마
 * @description GET https://pokeapi.co/api/v2/pokemon 응답 검증용
 * @note 외부 API이므로 ApiResponse 래핑 없음
 */
export const PokemonListApiResponseSchema = PokemonListResponseSchema;

/**
 * 포켓몬 상세 정보 API 응답 스키마
 * @description GET https://pokeapi.co/api/v2/pokemon/{id} 응답 검증용
 * @note 외부 API이므로 ApiResponse 래핑 없음
 */
export const PokemonDetailApiResponseSchema = PokemonSchema;

// ===== 요청 파라미터 검증 스키마들 =====

/**
 * 포켓몬 목록 조회 파라미터 검증 스키마
 * @description PokeAPI 포켓몬 목록 요청 검증용
 */
export const PokemonListParamsSchema = z.object({
  /** 한 페이지당 항목 수 (기본 20, 최대 100) */
  limit: z.number().int().positive().max(100, {
    message: "한 페이지 항목 수는 1-100 사이여야 합니다"
  }).optional(),
  /** 시작 오프셋 */
  offset: z.number().int().nonnegative({
    message: "오프셋은 0 이상이어야 합니다"
  }).optional(),
});

/**
 * 포켓몬 상세 조회 파라미터 검증 스키마
 * @description PokeAPI 포켓몬 상세 정보 요청 검증용
 */
export const PokemonDetailParamsSchema = z.object({
  /** 포켓몬 ID 또는 이름 */
  identifier: z.union([
    z.number().int().positive({
      message: "포켓몬 ID는 1 이상의 정수여야 합니다"
    }),
    z.string().min(1, "포켓몬 이름은 비어있을 수 없습니다").toLowerCase()
  ]),
});

// ===== 개별 스키마 export (필요한 경우) =====

export {
  NamedAPIResourceSchema,
  PokemonListResponseSchema,
  PokemonSchema,
  PokemonTypeSchema,
  PokemonSpritesSchema,
  PokemonStatSchema,
  PokemonAbilitySchema,
  PokemonMoveSchema,
};

// ===== 타입 추론 헬퍼들 =====

/**
 * Zod 스키마에서 TypeScript 타입 추론
 * @description 검증된 데이터의 TypeScript 타입
 */
export type ValidatedNamedAPIResource = z.infer<typeof NamedAPIResourceSchema>;
export type ValidatedPokemonListResponse = z.infer<typeof PokemonListResponseSchema>;
export type ValidatedPokemon = z.infer<typeof PokemonSchema>;
export type ValidatedPokemonType = z.infer<typeof PokemonTypeSchema>;
export type ValidatedPokemonSprites = z.infer<typeof PokemonSpritesSchema>;
export type ValidatedPokemonStat = z.infer<typeof PokemonStatSchema>;
export type ValidatedPokemonAbility = z.infer<typeof PokemonAbilitySchema>;
export type ValidatedPokemonListParams = z.infer<typeof PokemonListParamsSchema>;
export type ValidatedPokemonDetailParams = z.infer<typeof PokemonDetailParamsSchema>;
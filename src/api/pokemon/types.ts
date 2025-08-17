/**
 * API에서 자주 사용되는 기본 리소스 타입
 * @description 포켓몬 API의 모든 리소스가 공통으로 가지는 이름과 URL 정보
 */
export type NamedAPIResource = {
  /** 리소스 이름 */
  name: string;
  /** 상세 정보를 가져올 수 있는 API URL */
  url: string;
};

/**
 * 포켓몬 목록 API 응답 타입
 * @description 포켓몬 목록을 페이지네이션으로 가져올 때 받는 데이터 구조
 */
export type PokemonListResponse = {
  /** 전체 포켓몬 개수 */
  count: number;
  /** 다음 페이지 URL (마지막 페이지면 null) */
  next: string | null;
  /** 이전 페이지 URL (첫 페이지면 null) */
  previous: string | null;
  /** 현재 페이지의 포켓몬 목록 */
  results: NamedAPIResource[];
};

/**
 * 포켓몬 타입 정보
 * @description 포켓몬이 가지는 타입 (불, 물, 풀 등)
 */
export type PokemonType = {
  /** 타입 슬롯 번호 (첫 번째 타입: 1, 두 번째 타입: 2) */
  slot: number;
  /** 타입 정보 (이름과 상세 URL 포함) */
  type: NamedAPIResource;
};

/**
 * 포켓몬 이미지 스프라이트 정보
 * @description 포켓몬의 다양한 형태 이미지 URL들 (정면, 후면, 색칠 등)
 */
export type PokemonSprites = {
  /** 기본 정면 이미지 */
  front_default: string | null;
  /** 색칠된 정면 이미지 */
  front_shiny: string | null;
  /** 암컷 정면 이미지 */
  front_female: string | null;
  /** 색칠된 암컷 정면 이미지 */
  front_shiny_female: string | null;
  /** 기본 후면 이미지 */
  back_default: string | null;
  /** 색칠된 후면 이미지 */
  back_shiny: string | null;
  /** 암컷 후면 이미지 */
  back_female: string | null;
  /** 색칠된 암컷 후면 이미지 */
  back_shiny_female: string | null;
  /** 추가 이미지 소스들 */
  other?: {
    /** 공식 아트워크 이미지 */
    ["official-artwork"]?: {
      /** 기본 공식 아트워크 */
      front_default: string | null;
      /** 색칠된 공식 아트워크 */
      front_shiny: string | null;
    };
    /** 드림월드 이미지 */
    dream_world?: {
      /** 드림월드 기본 이미지 */
      front_default: string | null;
      /** 드림월드 암컷 이미지 */
      front_female: string | null;
    };
    /** 홈 스타일 이미지 */
    home?: {
      /** 홈 기본 이미지 */
      front_default: string | null;
      /** 홈 암컷 이미지 */
      front_female: string | null;
      /** 홈 색칠 이미지 */
      front_shiny: string | null;
      /** 홈 색칠된 암컷 이미지 */
      front_shiny_female: string | null;
    };
  };
};

/**
 * 포켓몬 능력치 정보
 * @description 포켓몬의 HP, 공격력, 방어력 등의 스탯 정보
 */
export type PokemonStat = {
  /** 기본 능력치 수치 */
  base_stat: number;
  /** 노력치 수치 */
  effort: number;
  /** 능력치 종류 (HP, 공격, 방어 등) */
  stat: NamedAPIResource;
};

/**
 * 포켓몬 특성 정보
 * @description 포켓몬이 가진 특성 (능력) 정보
 */
export type PokemonAbility = {
  /** 숨겨진 특성 여부 */
  is_hidden: boolean;
  /** 특성 슬롯 번호 */
  slot: number;
  /** 특성 정보 (이름과 상세 URL 포함) */
  ability: NamedAPIResource;
};

/**
 * 포켓몬 폼 정보
 * @description 포켓몬의 다양한 형태 (예: 알로라 형태, 갈라르 형태)
 */
export type PokemonForm = {
  /** 폼 이름 */
  name: string;
  /** 폼 상세 정보 URL */
  url: string;
};

/**
 * 버전 그룹 상세 정보
 * @description 포켓몬이 기술을 배우는 방법과 레벨 정보
 */
export type VersionGroupDetail = {
  /** 기술을 배우는 레벨 */
  level_learned_at: number;
  /** 게임 버전 그룹 */
  version_group: NamedAPIResource;
  /** 기술 학습 방법 */
  move_learn_method: NamedAPIResource;
};

/**
 * 포켓몬 기술 정보
 * @description 포켓몬이 배울 수 있는 기술과 학습 조건
 */
export type PokemonMove = {
  /** 기술 정보 */
  move: NamedAPIResource;
  /** 각 버전별 학습 상세 정보 */
  version_group_details: VersionGroupDetail[];
};

/**
 * 포켓몬 소지 아이템 정보
 * @description 포켓몬이 야생에서 소지할 수 있는 아이템
 */
export type PokemonHeldItem = {
  /** 아이템 정보 */
  item: NamedAPIResource;
  /** 각 버전별 상세 정보 */
  version_details: {
    /** 아이템 소지 확률 */
    rarity: number;
    /** 게임 버전 */
    version: NamedAPIResource;
  }[];
};

/**
 * 포켓몬 게임 인덱스 정보
 * @description 각 게임에서의 포켓몬 도감 번호
 */
export type PokemonGameIndex = {
  /** 게임내 도감 번호 */
  game_index: number;
  /** 게임 버전 */
  version: NamedAPIResource;
};

/**
 * 포켓몬 과거 타입 정보
 * @description 이전 세대에서 가졌던 타입 정보
 */
export type PokemonPastType = {
  /** 세대 정보 */
  generation: NamedAPIResource;
  /** 당시 가졌던 타입들 */
  types: PokemonType[];
};

/**
 * 포켓몬 과거 특성 정보
 * @description 이전 세대에서 가졌던 특성 정보
 */
export type PokemonPastAbility = {
  /** 세대 정보 */
  generation: NamedAPIResource;
  /** 당시 가졌던 특성들 */
  abilities: PokemonAbility[];
};

/**
 * 포켓몬 완전한 정보 타입
 * @description 포켓몬의 모든 상세 정보를 담는 메인 타입 (API에서 받는 전체 데이터)
 */
export type Pokemon = {
  /** 포켓몬 고유 ID 번호 */
  id: number;
  /** 포켓몬 이름 */
  name: string;
  /** 키 (데시미터 단위, 예: 7 = 0.7m) */
  height: number;
  /** 몸무게 (헥토그램 단위, 예: 69 = 6.9kg) */
  weight: number;
  /** 기본 경험치 (null일 수 있음) */
  base_experience: number | null;
  /** 기본 형태 여부 */
  is_default: boolean;
  /** 포켓몬 정렬 순서 */
  order: number;
  /** 포켓몬 이미지들 (정면, 후면, 색칠 등) */
  sprites: PokemonSprites;
  /** 포켓몬 타입들 (불, 물, 풀 등) */
  types: PokemonType[];
  /** 포켓몬 능력치들 (HP, 공격, 방어 등) */
  stats: PokemonStat[];
  /** 포켓몬 특성들 (능력) */
  abilities: PokemonAbility[];
  /** 포켓몬 폼들 (다양한 형태) */
  forms: PokemonForm[];
  /** 각 게임에서의 도감 번호들 */
  game_indices: PokemonGameIndex[];
  /** 야생에서 소지할 수 있는 아이템들 */
  held_items: PokemonHeldItem[];
  /** 서식지 정보 API URL */
  location_area_encounters: string;
  /** 배울 수 있는 기술들 */
  moves: PokemonMove[];
  /** 과거 세대의 타입 변경 이력 */
  past_types: PokemonPastType[];
  /** 과거 세대의 특성 변경 이력 */
  past_abilities: PokemonPastAbility[];
  /** 포켓몬 종족 정보 */
  species: NamedAPIResource;
};

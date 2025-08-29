/**
 * 포켓몬 타입별 색상 및 스타일 유틸리티
 */

/** 포켓몬 타입별 색상 정의 */
export const pokemonTypeColors = {
  normal: {
    primary: "#A8A878",
    secondary: "#C6C6A7",
    gradient: "from-gray-400 to-gray-500",
    bgGradient: "bg-gradient-to-br from-gray-100 to-gray-200",
    borderColor: "border-gray-400",
    textColor: "text-gray-800",
    badgeClass: "bg-gray-500 text-white",
  },
  fire: {
    primary: "#F08030",
    secondary: "#F5AC78",
    gradient: "from-orange-500 to-red-500",
    bgGradient: "bg-gradient-to-br from-orange-100 to-red-100",
    borderColor: "border-orange-500",
    textColor: "text-orange-800",
    badgeClass: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  },
  water: {
    primary: "#6890F0",
    secondary: "#9DB7F5",
    gradient: "from-blue-500 to-cyan-500",
    bgGradient: "bg-gradient-to-br from-blue-100 to-cyan-100",
    borderColor: "border-blue-500",
    textColor: "text-blue-800",
    badgeClass: "bg-gradient-to-r from-blue-500 to-cyan-500 text-white",
  },
  electric: {
    primary: "#F8D030",
    secondary: "#FAE078",
    gradient: "from-yellow-400 to-yellow-500",
    bgGradient: "bg-gradient-to-br from-yellow-100 to-amber-100",
    borderColor: "border-yellow-500",
    textColor: "text-yellow-800",
    badgeClass: "bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900",
  },
  grass: {
    primary: "#78C850",
    secondary: "#A7DB8D",
    gradient: "from-green-500 to-emerald-500",
    bgGradient: "bg-gradient-to-br from-green-100 to-emerald-100",
    borderColor: "border-green-500",
    textColor: "text-green-800",
    badgeClass: "bg-gradient-to-r from-green-500 to-emerald-500 text-white",
  },
  ice: {
    primary: "#98D8D8",
    secondary: "#BCE6E6",
    gradient: "from-cyan-400 to-blue-400",
    bgGradient: "bg-gradient-to-br from-cyan-100 to-blue-100",
    borderColor: "border-cyan-400",
    textColor: "text-cyan-800",
    badgeClass: "bg-gradient-to-r from-cyan-400 to-blue-400 text-white",
  },
  fighting: {
    primary: "#C03028",
    secondary: "#D67873",
    gradient: "from-red-600 to-red-700",
    bgGradient: "bg-gradient-to-br from-red-100 to-rose-100",
    borderColor: "border-red-600",
    textColor: "text-red-800",
    badgeClass: "bg-gradient-to-r from-red-600 to-rose-600 text-white",
  },
  poison: {
    primary: "#A040A0",
    secondary: "#C183C1",
    gradient: "from-purple-500 to-purple-600",
    bgGradient: "bg-gradient-to-br from-purple-100 to-pink-100",
    borderColor: "border-purple-500",
    textColor: "text-purple-800",
    badgeClass: "bg-gradient-to-r from-purple-500 to-pink-500 text-white",
  },
  ground: {
    primary: "#E0C068",
    secondary: "#EBD69D",
    gradient: "from-yellow-600 to-amber-600",
    bgGradient: "bg-gradient-to-br from-yellow-100 to-orange-100",
    borderColor: "border-yellow-600",
    textColor: "text-yellow-800",
    badgeClass: "bg-gradient-to-r from-yellow-600 to-amber-600 text-white",
  },
  flying: {
    primary: "#A890F0",
    secondary: "#C6B7F5",
    gradient: "from-indigo-400 to-sky-400",
    bgGradient: "bg-gradient-to-br from-indigo-100 to-sky-100",
    borderColor: "border-indigo-400",
    textColor: "text-indigo-800",
    badgeClass: "bg-gradient-to-r from-indigo-400 to-sky-400 text-white",
  },
  psychic: {
    primary: "#F85888",
    secondary: "#FA92B2",
    gradient: "from-pink-500 to-rose-500",
    bgGradient: "bg-gradient-to-br from-pink-100 to-rose-100",
    borderColor: "border-pink-500",
    textColor: "text-pink-800",
    badgeClass: "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
  },
  bug: {
    primary: "#A8B820",
    secondary: "#C6D16E",
    gradient: "from-lime-500 to-green-500",
    bgGradient: "bg-gradient-to-br from-lime-100 to-green-100",
    borderColor: "border-lime-500",
    textColor: "text-lime-800",
    badgeClass: "bg-gradient-to-r from-lime-500 to-green-500 text-white",
  },
  rock: {
    primary: "#B8A038",
    secondary: "#D1C17D",
    gradient: "from-stone-500 to-amber-600",
    bgGradient: "bg-gradient-to-br from-stone-100 to-amber-100",
    borderColor: "border-stone-500",
    textColor: "text-stone-800",
    badgeClass: "bg-gradient-to-r from-stone-500 to-amber-600 text-white",
  },
  ghost: {
    primary: "#705898",
    secondary: "#A292BC",
    gradient: "from-purple-600 to-indigo-600",
    bgGradient: "bg-gradient-to-br from-purple-100 to-indigo-100",
    borderColor: "border-purple-600",
    textColor: "text-purple-800",
    badgeClass: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
  },
  dragon: {
    primary: "#7038F8",
    secondary: "#A27DFA",
    gradient: "from-indigo-600 to-purple-600",
    bgGradient: "bg-gradient-to-br from-indigo-100 to-purple-100",
    borderColor: "border-indigo-600",
    textColor: "text-indigo-800",
    badgeClass: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white",
  },
  dark: {
    primary: "#705848",
    secondary: "#A29288",
    gradient: "from-gray-700 to-gray-900",
    bgGradient: "bg-gradient-to-br from-gray-200 to-gray-300",
    borderColor: "border-gray-700",
    textColor: "text-gray-800",
    badgeClass: "bg-gradient-to-r from-gray-700 to-gray-900 text-white",
  },
  steel: {
    primary: "#B8B8D0",
    secondary: "#D1D1E0",
    gradient: "from-slate-500 to-gray-500",
    bgGradient: "bg-gradient-to-br from-slate-100 to-gray-100",
    borderColor: "border-slate-500",
    textColor: "text-slate-800",
    badgeClass: "bg-gradient-to-r from-slate-500 to-gray-500 text-white",
  },
  fairy: {
    primary: "#EE99AC",
    secondary: "#F4BDC9",
    gradient: "from-pink-400 to-purple-400",
    bgGradient: "bg-gradient-to-br from-pink-100 to-purple-100",
    borderColor: "border-pink-400",
    textColor: "text-pink-800",
    badgeClass: "bg-gradient-to-r from-pink-400 to-purple-400 text-white",
  },
} as const;

export type PokemonType = keyof typeof pokemonTypeColors;

/**
 * 포켓몬 타입명이 유효한지 확인하는 타입 가드
 * @description API에서 받은 문자열이 정의된 포켓몬 타입 중 하나인지 검증
 * 
 * 주요 기능:
 * - 런타임 타입 안전성 보장
 * - 유효하지 않은 타입명 필터링
 * - TypeScript 타입 내로잉 지원
 * 
 * @param type 검증할 포켓몬 타입 문자열
 * @returns 유효한 포켓몬 타입명 여부
 * 
 * @example
 * ```typescript
 * const apiType = pokemon.types[0].type.name;
 * if (isPokemonTypeName(apiType)) {
 *   const badgeClass = getTypeBadgeClass(apiType); // 타입 안전
 * }
 * ```
 */
export function isPokemonTypeName(type: string): type is PokemonType {
  return type in pokemonTypeColors;
}

/**
 * 포켓몬 타입에 따른 색상 정보 가져오기
 */
export function getTypeColor(type: PokemonType) {
  return pokemonTypeColors[type];
}

/**
 * 포켓몬 타입에 따른 그라디언트 클래스 가져오기
 */
export function getTypeGradient(type: PokemonType) {
  const color = getTypeColor(type);
  return `bg-gradient-to-br ${color.gradient}`;
}

/**
 * 포켓몬 타입에 따른 배경 그라디언트 클래스 가져오기
 */
export function getTypeBgGradient(type: PokemonType) {
  const color = getTypeColor(type);
  return color.bgGradient;
}

/**
 * 포켓몬 타입에 따른 뱃지 클래스 가져오기
 */
export function getTypeBadgeClass(type: PokemonType) {
  const color = getTypeColor(type);
  return color.badgeClass;
}

/**
 * 포켓몬 능력치에 따른 색상 가져오기
 */
export function getStatColor(statName: string): string {
  const statColors: Record<string, string> = {
    hp: "bg-red-500",
    attack: "bg-orange-500",
    defense: "bg-yellow-500",
    "special-attack": "bg-blue-500",
    "special-defense": "bg-green-500",
    speed: "bg-purple-500",
  };
  return statColors[statName] || "bg-gray-500";
}

/**
 * 포켓몬 능력치 그라디언트
 */
export function getStatGradient(statName: string): string {
  const statGradients: Record<string, string> = {
    hp: "from-red-400 to-red-600",
    attack: "from-orange-400 to-orange-600",
    defense: "from-yellow-400 to-yellow-600",
    "special-attack": "from-blue-400 to-blue-600",
    "special-defense": "from-green-400 to-green-600",
    speed: "from-purple-400 to-purple-600",
  };
  return statGradients[statName] || "from-gray-400 to-gray-600";
}

/**
 * 포켓몬 능력치 이름 한글화
 */
export function getStatDisplayName(statName: string): string {
  const statNames: Record<string, string> = {
    hp: "HP",
    attack: "공격",
    defense: "방어",
    "special-attack": "특수공격",
    "special-defense": "특수방어",
    speed: "스피드",
  };
  return statNames[statName] || statName;
}

/**
 * 포켓몬 ID를 3자리 문자열로 포맷
 */
export function formatPokemonId(id: number | string): string {
  return `#${id.toString().padStart(3, "0")}`;
}

/**
 * 포켓몬 이름 포맷 (첫 글자 대문자)
 */
export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

import { cn } from "@/lib/utils";

/**
 * 공통 스타일 유틸리티
 * @description 프로젝트 전체에서 일관된 디자인을 위한 스타일 상수들
 */

// ===== 테이블 스타일 =====
export const tableStyles = {
  container: "rounded-lg border bg-card shadow-sm",
  header: "border-b bg-muted/50",
  headerCell: "font-semibold text-foreground",
  headerCellCenter: "font-semibold text-foreground text-center",
  row: "transition-colors hover:bg-muted/50",
  rowEven: "bg-background",
  rowOdd: "bg-muted/20",
  cell: "text-foreground",
  cellCenter: "text-center",
  cellMedium: "font-medium text-foreground",
  checkbox:
    "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
} as const;

// ===== 버튼 스타일 =====
export const buttonStyles = {
  primary: cn(
    "transition-all duration-200",
    "hover:bg-primary hover:text-primary-foreground",
    "focus:ring-2 focus:ring-primary/20",
    "border-primary/20 text-primary",
  ),
  secondary: cn(
    "transition-all duration-200",
    "hover:bg-secondary hover:text-secondary-foreground",
    "focus:ring-2 focus:ring-secondary/20",
    "border-secondary/20 text-secondary-foreground",
  ),
  destructive: cn(
    "transition-all duration-200",
    "hover:bg-destructive hover:text-destructive-foreground",
    "focus:ring-2 focus:ring-destructive/20",
    "border-destructive/20 text-destructive",
  ),
} as const;

// ===== 배지 스타일 =====
export const badgeStyles = {
  default: "font-medium",
  outline: "font-medium",
  secondary: "font-medium",
  destructive: "font-medium",
} as const;

// ===== 카드 스타일 =====
export const cardStyles = {
  default: "rounded-lg border bg-card shadow-sm",
  elevated:
    "rounded-lg border bg-card shadow-md hover:shadow-lg transition-shadow",
  interactive: cn(
    "rounded-lg border bg-card shadow-sm",
    "hover:shadow-md transition-all duration-200",
    "cursor-pointer hover:scale-[1.02]",
  ),
} as const;

// ===== 레이아웃 스타일 =====
export const layoutStyles = {
  container: "container mx-auto px-4 py-8 max-w-7xl",
  section: "space-y-6",
  grid: "grid gap-6",
  gridResponsive: cn(
    "grid gap-6",
    "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  ),
  flexCenter: "flex items-center justify-center",
  flexBetween: "flex items-center justify-between",
  flexCol: "flex flex-col",
  flexRow: "flex flex-row",
} as const;

// ===== 타이포그래피 스타일 =====
export const typographyStyles = {
  h1: "text-4xl lg:text-5xl font-bold",
  h2: "text-3xl lg:text-4xl font-semibold",
  h3: "text-2xl lg:text-3xl font-semibold",
  h4: "text-xl lg:text-2xl font-medium",
  h5: "text-lg lg:text-xl font-medium",
  h6: "text-base lg:text-lg font-medium",
  body: "text-base",
  small: "text-sm",
  caption: "text-xs text-muted-foreground",
} as const;

// ===== 간격 스타일 =====
export const spacingStyles = {
  section: "space-y-6",
  content: "space-y-4",
  items: "space-y-2",
  inline: "space-x-2",
  padding: "p-6",
  paddingSmall: "p-4",
  margin: "m-6",
  marginSmall: "m-4",
} as const;

// ===== 상태별 색상 스타일 =====
export const statusStyles = {
  success: "text-green-600 bg-green-50 border-green-200",
  error: "text-red-600 bg-red-50 border-red-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
  neutral: "text-gray-600 bg-gray-50 border-gray-200",
} as const;

// ===== 난이도별 배지 색상 매핑 =====
export const getDifficultyBadgeVariant = (level: string) => {
  switch (level.toLowerCase()) {
    case "상":
      return "destructive" as const;
    case "중":
      return "default" as const;
    case "하":
      return "secondary" as const;
    default:
      return "outline" as const;
  }
};

// ===== 상태별 배지 색상 매핑 =====
export const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "완료":
    case "제출완료":
    case "success":
      return "default" as const;
    case "미제출":
    case "오류":
    case "error":
      return "destructive" as const;
    case "대기":
    case "pending":
      return "outline" as const;
    default:
      return "outline" as const;
  }
};

// ===== 반응형 유틸리티 =====
export const responsiveStyles = {
  text: {
    h1: "text-2xl md:text-3xl lg:text-4xl xl:text-5xl",
    h2: "text-xl md:text-2xl lg:text-3xl xl:text-4xl",
    h3: "text-lg md:text-xl lg:text-2xl xl:text-3xl",
    body: "text-sm md:text-base lg:text-lg",
  },
  grid: {
    cols1: "grid-cols-1",
    cols2: "grid-cols-1 md:grid-cols-2",
    cols3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    cols4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  },
  padding: {
    mobile: "p-4",
    tablet: "p-4 md:p-6",
    desktop: "p-4 md:p-6 lg:p-8",
  },
} as const;

// ===== 애니메이션 스타일 =====
export const animationStyles = {
  fadeIn: "animate-in fade-in duration-300",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  hover: "transition-all duration-200 hover:scale-105",
  focus: "focus:ring-2 focus:ring-primary/20 focus:outline-none",
} as const;

// ===== 접근성 스타일 =====
export const accessibilityStyles = {
  focusVisible:
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  srOnly: "sr-only",
  skipLink:
    "absolute -top-40 left-6 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md focus:top-4",
} as const;

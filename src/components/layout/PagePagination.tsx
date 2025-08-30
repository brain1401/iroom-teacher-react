import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

/**
 * 페이지네이션 컴포넌트 Props
 */
type PagePaginationProps = {
  /** 현재 페이지 번호 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 변경 핸들러 */
  onPageChange: (page: number) => void;
  /** 한 번에 표시할 페이지 번호 개수 (기본값: 5) */
  maxVisiblePages?: number;
  /** 컴포넌트 클래스명 */
  className?: string;
};

/**
 * 페이지네이션 컴포넌트
 * @description 페이지 목록을 표시하고 페이지 이동을 처리하는 컴포넌트
 *
 * 주요 기능:
 * - 현재 페이지 하이라이트
 * - 이전/다음 페이지 이동
 * - 페이지 번호 직접 클릭
 * - 반응형 페이지 번호 표시
 *
 * @example
 * ```tsx
 * <PagePagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * ```
 */
export function PagePagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className,
}: PagePaginationProps) {
  // 페이지 번호 배열 생성
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 표시 가능한 개수보다 적으면 모든 페이지 표시
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 현재 페이지를 중심으로 좌우 페이지 번호 계산
    const halfVisible = Math.floor(maxVisiblePages / 2);
    let startPage = Math.max(1, currentPage - halfVisible);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // 끝 페이지가 전체 페이지보다 작으면 시작 페이지 조정
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  const visiblePages = getVisiblePages();

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        {/* 이전 페이지 버튼 */}
        <PaginationItem>
          <PaginationPrevious
            onClick={() => handlePageChange(currentPage - 1)}
            className={cn(
              "cursor-pointer",
              currentPage <= 1 && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>

        {/* 첫 페이지 (생략 표시가 필요한 경우) */}
        {visiblePages[0] > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(1)}
                className="cursor-pointer"
              >
                1
              </PaginationLink>
            </PaginationItem>
            {visiblePages[0] > 2 && (
              <PaginationItem>
                <span className="px-2 text-muted-foreground">...</span>
              </PaginationItem>
            )}
          </>
        )}

        {/* 페이지 번호들 */}
        {visiblePages.map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => handlePageChange(page)}
              isActive={page === currentPage}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* 마지막 페이지 (생략 표시가 필요한 경우) */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <>
            {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
              <PaginationItem>
                <span className="px-2 text-muted-foreground">...</span>
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationLink
                onClick={() => handlePageChange(totalPages)}
                className="cursor-pointer"
              >
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>
        )}

        {/* 다음 페이지 버튼 */}
        <PaginationItem>
          <PaginationNext
            onClick={() => handlePageChange(currentPage + 1)}
            className={cn(
              "cursor-pointer",
              currentPage >= totalPages && "pointer-events-none opacity-50",
            )}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";

type ScrollToTopProps = {
  /** 스크롤을 감지하고 이동시킬 대상 컨테이너 참조 */
  targetRef?: RefObject<HTMLElement>;
  /** 버튼 노출 임계치 (px) */
  threshold?: number;
  /** 추가 클래스 */
  className?: string;
};

/**
 * 최상단 이동 버튼
 * @description 스크롤이 threshold 이상 발생 시 화면 우하단에 노출되는 상단 이동 버튼
 */
export function ScrollToTop({ targetRef, threshold = 200, className }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = targetRef?.current ?? window;
    const getScrollTop = () => (el instanceof Window ? window.scrollY : (el as HTMLElement).scrollTop);
    const onScroll = () => {
      setVisible(getScrollTop() > threshold);
    };

    // 초기 상태 동기화
    onScroll();

    if (el instanceof Window) {
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    } else if (el) {
      el.addEventListener("scroll", onScroll, { passive: true });
      return () => el.removeEventListener("scroll", onScroll as EventListener);
    }
    return () => {};
  }, [targetRef, threshold]);

  const scrollToTop = () => {
    const el = targetRef?.current;
    if (el) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!visible) return null;

  return (
    <Button
      aria-label="맨 위로"
      onClick={scrollToTop}
      className={
        "fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full p-0 bg-[var(--color-brand-point)] text-white hover:bg-[var(--color-brand-point)] " +
        (className ?? "")
      }
    >
      ▲
    </Button>
  );
}

export default ScrollToTop;



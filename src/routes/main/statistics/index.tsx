import { isShowHeaderAtom } from '@/atoms/ui';
import { createFileRoute } from '@tanstack/react-router'
import { useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';

export const Route = createFileRoute('/main/statistics/')({
  component: RouteComponent,
})

function RouteComponent() {

  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  return (
    <div>
      <div className="text-5xl font-bold">통계</div>
    </div>
  );
}

import { isShowHeaderAtom } from '@/atoms/ui';
import { createFileRoute } from '@tanstack/react-router'
import { useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';

export const Route = createFileRoute('/main/')({
  component: RouteComponent,
})

function RouteComponent() {

  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(true);
  }, [setIsShowHeader]);

  return (
    <div>
      <div className="text-5xl font-bold">메인</div>
    </div>
  );
}

import { isShowHeaderAtom } from '@/atoms/ui';
import { Card } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router'
import { useSetAtom } from 'jotai';
import { useLayoutEffect } from 'react';

export const Route = createFileRoute('/main/test-management/')({
  component: RouteComponent,
})

function RouteComponent() {

  const setIsShowHeader = useSetAtom(isShowHeaderAtom);

  useLayoutEffect(() => {
    setIsShowHeader(false);
  }, [setIsShowHeader]);

  return (
    <Card>
      <div className="text-[2.5rem] font-bold">시험 관리</div>
    </Card>
  );
}

import { isShowHeaderAtom } from '@/atoms/ui';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <Card>
      <div className="text-5xl font-bold">메인</div>
    </Card>
  );
}

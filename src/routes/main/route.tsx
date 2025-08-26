import HeaderTitle from '@/components/layout/HeaderTitle'
import SideMenu from '@/components/layout/SideMenu'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { isShowHeaderAtom } from '@/atoms/ui'

export const Route = createFileRoute('/main')({
  component: RouteComponent,
})

function RouteComponent() {

  return (
    <div className="flex w-full">
      <SideMenu />
      <div className="flex-1 w-full">
         <HeaderTitle />
        <Outlet />
      </div>
    </div>
  )
}

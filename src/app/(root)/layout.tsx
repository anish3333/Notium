import Drawer from '@/components/Drawer'
import Sidebar from '@/components/Sidebar'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 ">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Drawer />
        </header>
        <main className='w-fit'>{children}</main>
      </div>
    </div>
  )
}

export default layout
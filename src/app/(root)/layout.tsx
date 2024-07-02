import Drawer from '@/components/Drawer'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full overflow-x-hidden">
      <div>
        <Sidebar />
      </div>
      <div className="flex-1 ">
        <Navbar />
        <main className='sm:pl-[4rem] w-full'>{children}</main>
      </div>
    </div>
  )
}

export default layout
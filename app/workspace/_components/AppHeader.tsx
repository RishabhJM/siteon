import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserButton } from '@clerk/nextjs'
import { User } from 'lucide-react'
import React from 'react'
import ThemeToggle from '@/app/_components/ThemeToggle'

function AppHeader() {
  return (
    <div className='flex justify-between items-center border-b border-border bg-background/80 p-3 shadow-sm backdrop-blur'>
        <SidebarTrigger className='rounded-xl' />
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <UserButton />
        </div>
    </div>
  )
}

export default AppHeader

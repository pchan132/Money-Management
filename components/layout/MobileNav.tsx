'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, BarChart2, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'History', icon: ArrowLeftRight },
  { href: '/transactions/new', label: 'Add', icon: PlusCircle, highlight: true },
  { href: '/reports', label: 'Reports', icon: BarChart2 },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="grid grid-cols-4 h-16">
        {navItems.map(({ href, label, icon: Icon, highlight }) => {
          const isActive =
            pathname === href ||
            (href !== '/transactions/new' &&
              href !== '/dashboard' &&
              pathname.startsWith(href + '/'))

          if (highlight) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1"
              >
                <div className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center -mt-5 shadow-lg ring-4 ring-white">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-indigo-600 mt-0.5">{label}</span>
              </Link>
            )
          }

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                isActive ? 'text-indigo-600' : 'text-gray-500'
              )}
            >
              <Icon
                className={cn('h-5 w-5', isActive ? 'text-indigo-600' : 'text-gray-400')}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

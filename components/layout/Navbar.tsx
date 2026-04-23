import type { Session } from 'next-auth'
import { signOut } from '@/actions/auth'
import { LogOut } from 'lucide-react'

interface NavbarProps {
  user: Session['user']
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-gray-500">Welcome,</span>
          <span className="font-medium text-gray-900 truncate max-w-[200px]">{user.email}</span>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </form>
      </div>
    </header>
  )
}

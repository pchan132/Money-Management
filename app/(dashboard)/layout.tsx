import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import MobileNav from '@/components/layout/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area — offset for sidebar on lg+ */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Navbar user={session.user} />
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  )
}

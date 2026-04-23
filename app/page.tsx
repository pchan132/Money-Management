import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

// Root — redirect based on auth state
export default async function RootPage() {
  const session = await auth()
  redirect(session?.user ? '/dashboard' : '/login')
}

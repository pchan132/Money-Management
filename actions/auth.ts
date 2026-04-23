'use server'

import { redirect } from 'next/navigation'
import { signIn as nextAuthSignIn, signOut as nextAuthSignOut } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import type { ActionState } from '@/types'
import { AuthError } from 'next-auth'

export async function signIn(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  try {
    await nextAuthSignIn('credentials', { email, password, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'Invalid email or password.' }
    }
    throw e
  }

  redirect('/dashboard')
}

export async function signUp(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  const email = (formData.get('email') as string)?.trim().toLowerCase()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!email || !password || !confirmPassword) {
    return { error: 'All fields are required.' }
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return { error: 'An account with this email already exists.' }
  }

  const hashedPassword = await bcrypt.hash(password, 12)

  await prisma.user.create({
    data: { email, password: hashedPassword },
  })

  // Auto sign-in after registration
  try {
    await nextAuthSignIn('credentials', { email, password, redirect: false })
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: 'Account created but sign-in failed. Please log in.' }
    }
    throw e
  }

  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  await nextAuthSignOut({ redirectTo: '/login' })
}


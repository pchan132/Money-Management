# Money Manager — Developer Guide

คู่มือนี้อธิบายโครงสร้างโค้ด, การทำงานของแต่ละระบบ, และแนวทางสำหรับนักพัฒนาที่ต้องการทำต่อหรือเพิ่มฟีเจอร์ใหม่

---

## สารบัญ

1. [Tech Stack](#1-tech-stack)
2. [โครงสร้างโปรเจค](#2-โครงสร้างโปรเจค)
3. [Environment Variables](#3-environment-variables)
4. [Database & Prisma ORM](#4-database--prisma-orm)
5. [ระบบ Authentication (NextAuth v5)](#5-ระบบ-authentication-nextauth-v5)
6. [Middleware & Route Protection](#6-middleware--route-protection)
7. [Server Actions](#7-server-actions)
8. [App Router & Pages](#8-app-router--pages)
9. [Components](#9-components)
10. [Types](#10-types)
11. [Utilities](#11-utilities)
12. [การเพิ่มฟีเจอร์ใหม่](#12-การเพิ่มฟีเจอร์ใหม่)

---

## 1. Tech Stack

| เทคโนโลยี | เวอร์ชัน | บทบาท |
|---|---|---|
| Next.js | 16.2.4 | Framework หลัก (App Router) |
| TypeScript | 5.6 | Type safety ทั้งโปรเจค |
| Tailwind CSS | 3.4 | Styling |
| Prisma | 7.8 | ORM สำหรับ query database |
| PostgreSQL (Supabase) | — | Database host |
| NextAuth v5 (beta) | 5.0-beta | Authentication |
| `@auth/prisma-adapter` | 2.x | เชื่อม NextAuth กับ Prisma |
| `@prisma/adapter-pg` + `pg` | 7.8 / 8.x | Driver adapter สำหรับ Prisma 7 |
| bcryptjs | 3.x | Hash password |
| recharts | 2.x | Charts |
| date-fns | 4.x | จัดการวันที่ |
| lucide-react | 0.46 | Icons |

---

## 2. โครงสร้างโปรเจค

```
money-manager/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group — หน้า auth (ไม่มี layout ของ dashboard)
│   │   ├── layout.tsx          # Layout เรียบง่ายสำหรับหน้า login/register
│   │   ├── login/page.tsx      # หน้า Login
│   │   └── register/page.tsx   # หน้า Register
│   ├── (dashboard)/            # Route group — หน้าหลัก (ต้อง login ก่อน)
│   │   ├── layout.tsx          # Layout ของ dashboard: Sidebar + Navbar
│   │   ├── dashboard/page.tsx  # หน้า Dashboard (summary + charts)
│   │   ├── transactions/       # หน้า Transactions
│   │   │   ├── page.tsx        # รายการ transactions ทั้งหมด
│   │   │   ├── new/page.tsx    # เพิ่ม transaction ใหม่
│   │   │   └── [id]/edit/      # แก้ไข transaction
│   │   └── reports/page.tsx    # หน้า Reports
│   ├── api/auth/[...nextauth]/ # NextAuth API handler
│   │   └── route.ts
│   ├── globals.css             # Global styles (Tailwind directives)
│   ├── layout.tsx              # Root layout (html, body, font)
│   └── page.tsx                # Root redirect → /dashboard หรือ /login
│
├── actions/                    # Next.js Server Actions
│   ├── auth.ts                 # signIn, signUp, signOut
│   ├── categories.ts           # getCategories
│   └── transactions.ts         # CRUD + dashboard/report queries
│
├── auth.config.ts              # NextAuth config แบบ Edge-safe (ไม่มี Node.js deps)
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Top bar (email + sign out)
│   │   ├── Sidebar.tsx         # Desktop sidebar navigation
│   │   └── MobileNav.tsx       # Bottom navigation สำหรับ mobile
│   ├── dashboard/
│   │   ├── SummaryCards.tsx    # 4 summary cards (balance, income, expense, monthly)
│   │   ├── RecentTransactions.tsx
│   │   └── MonthlyChart.tsx    # Bar chart รายเดือน
│   ├── transactions/
│   │   ├── TransactionForm.tsx # Form เพิ่ม/แก้ไข transaction
│   │   ├── TransactionList.tsx # รายการพร้อม pagination
│   │   ├── TransactionItem.tsx # แถวเดียวใน list
│   │   └── FilterBar.tsx       # Filter by type/category/date
│   ├── reports/
│   │   ├── MonthlyBarChart.tsx
│   │   └── CategoryPieChart.tsx
│   └── ui/                     # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       └── LoadingSpinner.tsx
│
├── lib/
│   ├── auth.ts                 # NextAuth full config (Node.js runtime เท่านั้น)
│   ├── prisma.ts               # PrismaClient singleton (ใช้ PrismaPg adapter)
│   └── utils.ts                # cn(), formatCurrency(), date helpers
│
├── middleware.ts               # Edge middleware สำหรับ route protection
├── next.config.ts              # Next.js config (serverExternalPackages)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.sql                # Seed 14 default categories
├── prisma.config.ts            # Prisma 7 config (อ่าน DATABASE_URL จาก .env.local)
├── supabase/
│   └── schema.sql              # Original Supabase SQL (reference เท่านั้น)
├── types/
│   ├── index.ts                # TypeScript interfaces ทั้งหมด
│   └── next-auth.d.ts          # Augment session.user.id
└── .env.local                  # Environment variables (ไม่ commit)
```

---

## 3. Environment Variables

ไฟล์ `.env.local` ต้องมีค่าดังนี้:

```dotenv
# PostgreSQL — Transaction pooler (PgBouncer port 6543) สำหรับ runtime queries
DATABASE_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# PostgreSQL — Direct connection (port 5432) สำหรับ prisma db push/pull/migrate
DIRECT_URL="postgresql://postgres.PROJECT_ID:PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-byte-hex>   # สร้างด้วย: openssl rand -hex 32
```

> **หมายเหตุ:** `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ไม่จำเป็นอีกต่อไป เพราะไม่ได้ใช้ Supabase Auth แล้ว

---

## 4. Database & Prisma ORM

### 4.1 Schema Overview

```
users ──< transactions
  └───< accounts          (NextAuth OAuth accounts)
  └───< sessions          (NextAuth JWT sessions)

categories ──< transactions
```

**`users`** — ผู้ใช้ทั้งหมด ID เป็น `cuid()` ฟิลด์ `password` เป็น `String?` เพราะรองรับ OAuth ในอนาคต (ถ้า user สมัครด้วย Google จะไม่มี password)

**`categories`** — ตาราง lookup ไม่ผูกกับ user (shared) ใส่ seed ไว้ 14 หมวดหมู่ใน `supabase/seed.sql`

**`transactions`** — ผูกกับ `user_id` ทุก query ต้องกรองด้วย `user_id` เสมอ (app-layer security เพราะไม่มี RLS)

### 4.2 Prisma 7 Setup

Prisma 7 เปลี่ยน default engine เป็น `"client"` (WASM-based) ซึ่งต้องใช้ **driver adapter**:

```
prisma.config.ts        ← โหลด DATABASE_URL จาก .env.local สำหรับ CLI
lib/prisma.ts           ← สร้าง PrismaClient พร้อม PrismaPg adapter
```

**`prisma.config.ts`** — Prisma CLI (db push, studio, generate) ไม่อ่าน `.env.local` เอง จึงต้อง load เอง:

```ts
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
export default defineConfig({ datasource: { url: process.env.DATABASE_URL! } });
```

**`lib/prisma.ts`** — singleton pattern ป้องกัน connection leak ใน dev hot-reload:

```ts
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
new PrismaClient({ adapter })
```

### 4.3 คำสั่ง Database

```bash
npm run db:push       # sync schema → database (ไม่สร้าง migration files)
npm run db:pull       # pull schema จาก database ที่มีอยู่
npm run db:generate   # regenerate Prisma Client หลังแก้ schema
npm run db:studio     # เปิด Prisma Studio (GUI สำหรับ browse data)
```

---

## 5. ระบบ Authentication (NextAuth v5)

### 5.1 ภาพรวม

ใช้ **Credentials Provider** (email + password) + **JWT session strategy**

```
auth.config.ts     ← Edge-safe config (ใช้ใน middleware)
lib/auth.ts        ← Full config (ใช้ใน Server Actions, Server Components)
```

เหตุผลที่ต้องแยก 2 ไฟล์: `middleware.ts` ทำงานบน **Edge Runtime** ซึ่งไม่รองรับ Node.js modules เช่น `crypto` (ที่ `bcryptjs` และ `pg` ใช้) จึงต้องแยก config ที่ไม่มี dependencies เหล่านี้ไว้ต่างหาก

### 5.2 auth.config.ts (Edge-safe)

```ts
export const authConfig: NextAuthConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login', error: '/login' },
  providers: [],   // ← ว่างไว้ ไม่มี Node.js deps
  callbacks: {
    authorized({ auth, request }) {
      // logic redirect login/dashboard
    }
  }
}
```

### 5.3 lib/auth.ts (Node.js runtime)

```ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,           // spread config จาก auth.config.ts
  adapter: PrismaAdapter(prisma),
  providers: [Credentials({ authorize: bcrypt.compare })],
  callbacks: {
    jwt({ token, user }) { token.id = user.id },
    session({ session, token }) { session.user.id = token.id }
  }
})
```

**exports ที่ใช้งาน:**
- `handlers` → ใส่ใน `app/api/auth/[...nextauth]/route.ts`
- `auth` → ใช้ใน Server Components/Actions เพื่อดึง session
- `signIn` / `signOut` → ใช้ใน `actions/auth.ts`

### 5.4 actions/auth.ts

| Function | หน้าที่ |
|---|---|
| `signIn(formData)` | ตรวจ email/password → เรียก NextAuth signIn → redirect `/dashboard` |
| `signUp(formData)` | validate → เช็ค email ซ้ำ → bcrypt hash → `prisma.user.create` → auto signIn |
| `signOut()` | เรียก NextAuth signOut → redirect `/login` |

### 5.5 types/next-auth.d.ts

Augment NextAuth `Session` type เพื่อให้ TypeScript รู้จัก `session.user.id`:

```ts
declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user']
  }
}
```

---

## 6. Middleware & Route Protection

**`middleware.ts`** ทำงานก่อนทุก request บน Edge Runtime:

```ts
export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|...).*)']
}
```

Logic การ redirect อยู่ใน `authConfig.callbacks.authorized`:

| สถานะ | เส้นทาง | ผลลัพธ์ |
|---|---|---|
| ไม่ได้ login | `/dashboard/*` | redirect → `/login` |
| ไม่ได้ login | `/login`, `/register` | ผ่านได้ |
| login แล้ว | `/login`, `/register` | redirect → `/dashboard` |
| login แล้ว | `/dashboard/*` | ผ่านได้ |

Dashboard layout (`app/(dashboard)/layout.tsx`) ยัง double-check session อีกครั้งด้วย `auth()` เป็น defense-in-depth

---

## 7. Server Actions

ทุก action ใช้ `'use server'` directive ทำงานบน Node.js runtime ฝั่ง server

### 7.1 actions/transactions.ts

**Auth helper:**
```ts
async function getAuthUserId(): Promise<string | null> {
  const session = await auth()
  return session?.user?.id ?? null
}
```
ทุก function เรียก `getAuthUserId()` ก่อนเสมอ ถ้าไม่ได้ login return `{ error: 'Unauthorized' }`

**Read functions:**

| Function | คำอธิบาย |
|---|---|
| `getTransactions(filters?)` | ดึง transactions พร้อม filter type/category/date |
| `getTransactionById(id)` | ดึง 1 transaction (ตรวจ user_id ด้วย) |
| `getDashboardSummary()` | aggregate income/expense รวมทั้งหมด + เดือนนี้ |
| `getMonthlyReport()` | aggregate รายเดือน 6 เดือนย้อนหลัง |
| `getCategoryExpenses(start, end)` | aggregate แยกตาม category + คำนวณ % |

**Write functions:**

| Function | คำอธิบาย |
|---|---|
| `createTransaction(formData)` | validate → `prisma.transaction.create` → revalidate → redirect |
| `updateTransaction(id, formData)` | `prisma.transaction.updateMany` (where user_id ป้องกัน unauthorized) |
| `deleteTransaction(id)` | `prisma.transaction.deleteMany` (where user_id) |

**mapTransaction()** — แปลง Prisma type (`Decimal`, `Date`) → plain TypeScript type (`number`, `string`)

### 7.2 actions/categories.ts

```ts
export async function getCategories(): Promise<Category[]>
```
ดึง categories ทั้งหมดเรียงตาม `name` ไม่ต้อง auth (public lookup table)

---

## 8. App Router & Pages

### 8.1 Root Page (`app/page.tsx`)

```ts
const session = await auth()
redirect(session?.user ? '/dashboard' : '/login')
```
เป็นแค่ redirect ไม่ render อะไร

### 8.2 Auth Pages (`app/(auth)/`)

- `login/page.tsx` — `'use client'`, ใช้ `useActionState(signIn, null)`
- `register/page.tsx` — `'use client'`, ใช้ `useActionState(signUp, null)`

Pattern `useActionState`:
```ts
const [state, action] = useActionState(signIn, null)
// state.error → แสดง error message
// action → ใส่ใน <form action={action}>
```

### 8.3 Dashboard Layout (`app/(dashboard)/layout.tsx`)

Server Component ที่:
1. เรียก `auth()` ตรวจ session
2. ถ้าไม่มี session → `redirect('/login')`
3. Render `<Sidebar>`, `<Navbar user={session.user}>`, `<MobileNav>`

### 8.4 Dashboard Page

Server Component ดึง `getDashboardSummary()`, `getTransactions({ limit })`, `getMonthlyReport()` แบบ parallel ด้วย `Promise.all()`

### 8.5 Transactions Pages

- `transactions/page.tsx` — Server Component, รับ `searchParams` สำหรับ filter
- `transactions/new/page.tsx` — render `<TransactionForm>`
- `transactions/[id]/edit/page.tsx` — ดึง transaction แล้วส่งเป็น initial data ให้ `<TransactionForm>`

---

## 9. Components

### 9.1 Layout Components

**`Navbar.tsx`**
- รับ `user: Session['user']` เป็น prop
- แสดง email + ปุ่ม sign out (ใช้ `<form action={signOut}>`)

**`Sidebar.tsx`** / **`MobileNav.tsx`**
- ไม่ใช้ auth โดยตรง เป็นแค่ navigation links
- Sidebar แสดงบน desktop (lg+), MobileNav แสดงบน mobile (bottom bar)

### 9.2 Transaction Components

**`TransactionForm.tsx`**
- `'use client'` component
- ใช้ `useActionState` กับ `createTransaction` หรือ `updateTransaction`
- รับ `categories[]` และ `initialData?` เป็น prop
- Controlled inputs สำหรับ type, amount, category, note, date

**`FilterBar.tsx`**
- `'use client'` component
- Update URL searchParams โดยใช้ `useRouter` + `useSearchParams`
- Parent page อ่าน filter จาก `searchParams` แล้วส่งไปยัง `getTransactions()`

### 9.3 UI Primitives (`components/ui/`)

Component เหล่านี้ wrap HTML elements พร้อม Tailwind class:

```ts
// ตัวอย่างการใช้
<Button variant="primary" size="sm">Save</Button>
<Input name="email" type="email" error={state?.error} />
<Badge variant="income">+฿1,000</Badge>
<Card className="p-4">...</Card>
```

---

## 10. Types

**`types/index.ts`** — interfaces หลักทั้งหมด:

```ts
TransactionType     = 'income' | 'expense'
Category            // id, name, icon, color, created_at
Transaction         // id, user_id, type, amount, category_id, note, created_at
TransactionWithCategory  // Transaction + categories: Category | null
TransactionFilters  // type?, category_id?, startDate?, endDate?
DashboardSummary    // totalIncome, totalExpense, balance, monthlyIncome, monthlyExpense
MonthlyData         // month (label), income, expense
CategoryExpense     // id, name, icon, color, total, percentage
ActionState         // error?, success? — return type ของ Server Actions
```

**`types/next-auth.d.ts`** — เพิ่ม `id` เข้าไปใน `Session['user']` ของ NextAuth

---

## 11. Utilities (`lib/utils.ts`)

| Function | คำอธิบาย |
|---|---|
| `cn(...classes)` | merge Tailwind classes (clsx + tailwind-merge) |
| `formatCurrency(amount)` | format เป็น USD string เช่น `$1,234.50` |
| `formatDate(dateString)` | format เป็น `Jan 1, 2025` |
| `getCurrentMonthRange()` | return `{ startDate, endDate }` ของเดือนนี้ |
| `getMonthRange(year, month)` | return range ของเดือนที่ระบุ |
| `getLastNMonths(n)` | return array ของ N เดือนย้อนหลัง |

> ถ้าต้องการเปลี่ยน currency หรือ locale แก้ที่ `formatCurrency()` ใน `lib/utils.ts`

---

## 12. การเพิ่มฟีเจอร์ใหม่

### 12.1 เพิ่ม Model ใหม่ใน Database

1. แก้ `prisma/schema.prisma` เพิ่ม model
2. รัน `npm run db:push` เพื่อ sync database
3. รัน `npm run db:generate` เพื่อ regenerate client
4. สร้าง Server Action ใหม่ใน `actions/`

### 12.2 เพิ่มหน้าใหม่ใน Dashboard

1. สร้างโฟลเดอร์ใน `app/(dashboard)/your-page/page.tsx`
2. เพิ่ม link ใน `components/layout/Sidebar.tsx` และ `components/layout/MobileNav.tsx`
3. หน้าจะถูก protect โดย middleware และ dashboard layout อัตโนมัติ

### 12.3 เพิ่ม OAuth Provider (เช่น Google)

1. ติดตั้ง: `npm install @auth/google`
2. เพิ่ม env: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
3. เพิ่ม provider ใน `lib/auth.ts`:
   ```ts
   import Google from 'next-auth/providers/google'
   providers: [Google, Credentials({ ... })]
   ```
4. ตาราง `Account` และ `Session` ใน schema รองรับ OAuth ไว้แล้ว

### 12.4 เพิ่มฟิลด์ใหม่ใน Transaction

1. แก้ `prisma/schema.prisma` เพิ่มฟิลด์ใน `Transaction`
2. รัน `npm run db:push` และ `npm run db:generate`
3. แก้ interface `Transaction` ใน `types/index.ts`
4. แก้ `mapTransaction()` ใน `actions/transactions.ts`
5. แก้ `TransactionForm.tsx` เพิ่ม input ใหม่

### 12.5 Pattern ของ Server Action ใหม่

```ts
'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ActionState } from '@/types'

export async function myAction(
  _prevState: ActionState | null,
  formData: FormData
): Promise<ActionState | null> {
  // 1. ตรวจ auth ก่อนเสมอ
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  // 2. อ่านและ validate input
  const value = formData.get('field') as string
  if (!value) return { error: 'Field is required.' }

  // 3. Query database
  try {
    await prisma.someModel.create({ data: { userId: session.user.id, value } })
  } catch (e) {
    return { error: (e as Error).message }
  }

  // 4. Revalidate cache แล้ว redirect
  revalidatePath('/some-page')
  redirect('/some-page')
}
```

### 12.6 Security Checklist

- ✅ ทุก write action ต้องเรียก `auth()` และตรวจ `userId`
- ✅ ทุก query ที่เป็น user-specific ต้องมี `where: { user_id: userId }`
- ✅ ใช้ `updateMany` / `deleteMany` แทน `update` / `delete` เพื่อให้ `user_id` เป็นเงื่อนไขด้วย
- ✅ ไม่มี Supabase RLS อีกต่อไป — app-layer security ผ่าน Prisma query เป็นตัวป้องกันเดียว
- ✅ Password hash ด้วย bcrypt cost factor 12

---

## ข้อควรระวัง

**Prisma 7 + Edge Runtime:**
- อย่า import จาก `lib/prisma.ts` หรือ `lib/auth.ts` ใน `middleware.ts`
- Middleware ใช้ได้เฉพาะ `auth.config.ts` ที่ไม่มี Node.js dependencies

**`serverExternalPackages` ใน `next.config.ts`:**
- `pg`, `bcryptjs`, `@prisma/client`, `.prisma/client` ต้อง external เพื่อป้องกันไม่ให้ bundle เข้า Edge

**Database URL:**
- `DATABASE_URL` ใช้ port `6543` (PgBouncer) สำหรับ runtime
- `DIRECT_URL` ใช้ port `5432` สำหรับ `prisma db push` เท่านั้น (ยังไม่ได้ใช้ใน prisma.config.ts — สามารถเพิ่ม `directUrl` ได้ถ้าต้องการ migrate)

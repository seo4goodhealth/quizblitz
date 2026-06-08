import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user) {
            throw new Error('No account found with this email')
          }

          const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
          if (!isValid) {
            throw new Error('Invalid password')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          }
        } catch (error: any) {
          // If it's our custom error, re-throw it
          if (error.message === 'No account found with this email' || error.message === 'Invalid password') {
            throw error
          }
          // Database connection error
          console.error('Auth database error:', error)
          throw new Error('Service temporarily unavailable. Please try again later.')
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        ;(session.user as any).name = token.name as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

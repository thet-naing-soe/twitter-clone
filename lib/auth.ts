import { type NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  // Database adapter - Prisma နဲ့ database connect လုပ်ဖို့
  adapter: PrismaAdapter(prisma),

  // Authentication providers 
  providers: [
    // Email provider 
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Session configuration
  session: {
    strategy: 'jwt', // JWT tokens 
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
     session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },

     jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },

  // Custom pages configuration
  pages: {
    signIn: '/login', 
  },

  // Secret key for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
}

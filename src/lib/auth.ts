import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Kakao from 'next-auth/providers/kakao'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          Kakao({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
        session.user.role =
          (token.role as 'CUSTOMER' | 'ADMIN' | 'SELLER') || 'CUSTOMER'
      }
      return session
    },
    jwt({ token, user }) {
      if (user) {
        token.role = 'CUSTOMER' // 기본 역할 설정
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
})

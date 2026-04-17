import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/db";
import { generateToken } from "@/lib/auth-server";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/',
    error: '/',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        return true; 
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // This is triggered on initial sign in or token refresh
      if (account?.provider === 'google' && profile) {
        const email = profile.email;
        const name = profile.name;
        const profilePicture = profile.picture;

        try {
          // Cari user di database kita (Prisma)
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          // Jika belum ada, auto-register
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: name,
                email: email,
                password: 'GOOGLE_OAUTH_DUMMY_PASSWORD_' + Math.random().toString(36).substring(7),
                role: 'MEMBER',
                profilePicture: profilePicture
              }
            });
          }

          // Generate custom JWT sistem lama
          const systemToken = generateToken(dbUser);
          
          // Inject custom properties ke token NextAuth
          token.systemToken = systemToken;
          token.userRole = dbUser.role;
          token.dbUserId = dbUser.id;
        } catch (error) {
          console.error("Error connecting Google identity to DB:", error);
          return null; // Membatalkan login jika database gagal
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Pass token properties ke objek sesi yang bisa dibaca client React
      if (token?.systemToken) {
        session.user.role = token.userRole;
        session.user.id = token.dbUserId;
        session.systemToken = token.systemToken; 
      }
      return session;
    }
  }
});

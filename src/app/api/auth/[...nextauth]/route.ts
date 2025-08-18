import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";

const handler = NextAuth({
  debug: true, // Enable debug mode
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text", required: false }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            return null;
          }

          // Verify password (in a real app, you'd use bcrypt)
          // For demo purposes, we'll accept the demo password
          const isDemoUser = credentials.email === "admin@passflow.ru";
          const isDemoPassword = credentials.password === "XZMx#DN7ex#*7Wpp";
          
          if (isDemoUser && isDemoPassword) {
            // Check 2FA if enabled
            if (user.twoFactorEnabled && !credentials.twoFactorCode) {
              // Return user with 2FA required flag
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled,
                twoFactorRequired: true
              };
            }

            // Verify 2FA code if provided
            if (user.twoFactorEnabled && credentials.twoFactorCode) {
              // In a real implementation, verify the 2FA code
              // For demo, accept any 6-digit code
              if (credentials.twoFactorCode.length !== 6) {
                return null;
              }
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              twoFactorEnabled: user.twoFactorEnabled
            };
          }

          // For non-demo users, you would implement proper password verification here
          return null;
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "your-secret-key",
});

export { handler as GET, handler as POST };
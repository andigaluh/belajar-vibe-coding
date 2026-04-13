import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Fallback to localhost if NEXTAUTH_URL is not set
          const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
          const res = await fetch(`${baseUrl}/api/v1/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
              rememberMe: credentials.rememberMe === 'true',
            }),
            headers: { "Content-Type": "application/json" }
          });

          const user = await res.json();

          if (res.ok && user && !user.error) {
            // Return user object + token
            return {
              id: user.data.user_id,
              name: user.data.name,
              email: user.data.email,
              accessToken: user.data.token,
            };
          }
          return null;
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days as global baseline, backend JWT controls specific expiry
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
});

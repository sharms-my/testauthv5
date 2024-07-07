import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { db } from "./lib/db";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  theme: {
    logo: "/logo.png",
  },
  adapter: PrismaAdapter(db) as Adapter,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  providers: [
    Google,
    Resend({
      from: "no-reply@tutorial.codinginflow.com",
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Add your logic to authorize the user
        const user = await prisma.user.findUnique({
          where: {
            email: credentials?.username,
          },
        });
        console.log("the user is", user);
        //const isMatched = await compare(credentials?.password, user.password);
        if (user && user.password === credentials?.password) {
          return user;
        } else {
          return null;
        }
      },
    }),
  ],
});

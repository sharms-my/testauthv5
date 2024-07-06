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
  callbacks: {
    session({ session, user }) {
      session.user.role = user.role;
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
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        let user: any = await db.user.findUnique({
          where: {
            email,
          },
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email,
            },
          });
        } else {
          return user;
        }

        return user;
      },
    }),
  ],
});

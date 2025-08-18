import { DefaultSession, DefaultUser } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      twoFactorEnabled: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: UserRole;
    twoFactorEnabled: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    twoFactorEnabled: boolean;
  }
}
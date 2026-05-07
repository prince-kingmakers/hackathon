import mockUsers from "../../mock/users.json";
import type { MockUserRecord, UserDetails, UserPersona } from "@/types/user";

/** Default persona when `id` query is omitted. */
export const DEFAULT_ID: UserPersona = "casino";

const isPersona = (value: string): value is UserPersona =>
  value === "casino" || value === "virtuals" || value === "both";

const users = mockUsers as MockUserRecord[];

const userByPersona = new Map<UserPersona, MockUserRecord>(
  users.map((u) => [u.userId, u]),
);

/** Unknown ids fall back to the default casino persona. */
export const getUserDetailsById = (id: string | undefined): UserDetails => {
  const trimmed = id?.trim();
  const match =
    trimmed && isPersona(trimmed) && userByPersona.has(trimmed)
      ? userByPersona.get(trimmed)!
      : userByPersona.get(DEFAULT_ID)!;
  return {
    userId: match.userId,
    balance: match.balance,
    firstName: match.firstName,
  };
};

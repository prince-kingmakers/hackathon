export type UserPersona = "casino" | "virtuals" | "both";

export type MockUserRecord = {
  userId: UserPersona;
  balance: number;
};

export type UserDetails = {
  userId: UserPersona;
  balance: number;
};

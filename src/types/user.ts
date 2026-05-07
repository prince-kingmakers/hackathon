export type UserPersona = "casino" | "virtuals" | "both";

export type MockUserRecord = {
  userId: UserPersona;
  balance: number;
  firstName: string;
  promotions: string[];
};

export type UserDetails = {
  userId: UserPersona;
  balance: number;
  firstName: string;
  promotions: string[];
};

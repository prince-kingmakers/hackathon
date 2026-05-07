import type { UserPersona } from "@/types/user";

export type GameImage = {
  url: string;
  alt: string;
};

export type VerticalRecord = {
  id: "casino" | "virtuals";
  name: string;
};

export type CategoryRecord = {
  id: string;
  name: string;
  description?: string;
  verticalId: VerticalRecord["id"];
};

export type GameRecord = {
  id: string;
  name: string;
  image: GameImage;
  url: string;
  categoryId: string;
  time?: string;
  isExclusive?: boolean;
  isNew?: boolean;
};

export type BetRecord = {
  betId: string;
  userId: UserPersona;
  placedAt: string;
  stake: number;
  gameId: string;
};

export type GameTileBase = {
  id: string;
  name: string;
  image: GameImage;
  url: string;
  isExclusive?: boolean;
  isNew?: boolean;
};

export type CasinoGameTile = GameTileBase & {
  kind: "casino";
};

export type VirtualGameTile = GameTileBase & {
  kind: "virtuals";
  time: string;
};

export type GameTile = CasinoGameTile | VirtualGameTile;

export type CategoryByStakeRow = {
  name: string;
  description?: string;
  items: GameTile[];
};

export type PersonalizedHomeFeedSlice = {
  id: UserPersona;
  recentlyPlayed: GameTile[];
  categoriesByStake: CategoryByStakeRow[];
  recommendedNotPlayed?: GameTile[];
  exploreNewVertical?: GameTile[];
};

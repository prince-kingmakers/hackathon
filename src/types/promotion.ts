import type { BannerImage } from "@/types/banners";

// When a consumer needs a single target for a promotion, prefer `gameId`;
// if unset, fall back to `categoryId`; if unset, fall back to `verticalId`.
export type Promotion = {
  id: string;
  image: BannerImage;
  gameId?: string;
  categoryId?: string;
  verticalId?: string;
};

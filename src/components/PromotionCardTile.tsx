"use client";

import { BadgeChip } from "@/components/gameCardTileShared";
import type { GameImage, HomeSliceVertical } from "@/types/personalization";
import Image from "next/image";
import Link from "next/link";

type PromotionCardTileProps = {
  image: GameImage;
  href: string;
  vertical: HomeSliceVertical;
};

const PromotionCardTile = ({ image, href, vertical }: PromotionCardTileProps) => {
  const heightClass =
    vertical === "casino"
      ? "h-[100px] lg:h-[130px]"
      : "h-[126px] lg:h-[130px]";

  return (
    <Link
      href={href}
      className={`promotion-rail-tile relative block ${heightClass} w-full overflow-hidden rounded-xl outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-backdrop`}
    >
      <BadgeChip label="Just for you" className="!capitalize" />
      <Image
        src={image.url}
        alt={image.alt}
        fill
        className="object-cover"
        unoptimized
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{
          backgroundColor: "color-mix(in srgb, var(--bk-backdrop) 10%, transparent)",
        }}
        aria-hidden
      />
    </Link>
  );
};

export default PromotionCardTile;

import { BadgeChip, getBadgeLabel } from "@/components/gameCardTileShared";
import type { CasinoGameTile } from "@/types/personalization";
import Image from "next/image";
import Link from "next/link";

type CasinoGameCardTileProps = {
  item: CasinoGameTile;
};

const CasinoGameCardTile = ({ item }: CasinoGameCardTileProps) => {
  const badge = getBadgeLabel(item);
  const gameClass = `game-${item.id}`;

  return (
    <Link
      href={item.url}
      className={`recently-played-card ${gameClass} relative block h-[100px] lg:h-[130px] overflow-hidden rounded-xl text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-backdrop`}
    >
      {badge ? <BadgeChip label={badge} /> : null}
      <Image
        src={item.image.url}
        alt={item.image.alt}
        fill
        sizes="130px"
        className="object-cover"
        unoptimized
      />
    </Link>
  );
};

export default CasinoGameCardTile;

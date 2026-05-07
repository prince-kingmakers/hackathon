import { BadgeChip, formatCountdown, getBadgeLabel } from "@/components/gameCardTileShared";
import type { VirtualGameTile } from "@/types/personalization";
import Image from "next/image";
import Link from "next/link";

type VirtualGameCardTileProps = {
  item: VirtualGameTile;
  nowMs: number;
};

const VirtualGameCardTile = ({ item, nowMs }: VirtualGameCardTileProps) => {
  const badge = getBadgeLabel(item);
  const countdown = formatCountdown(item.time, nowMs);
  const gameClass = `game-${item.id}`;

  return (
    <Link
      href={item.url}
      className={`recently-played-card ${gameClass} relative block min-h-[80px] lg:min-h-[100px] overflow-hidden rounded-xl text-white outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-bk-backdrop`}
    >
      {badge ? <BadgeChip label={badge} /> : null}

      <div className="relative h-[50px] lg:h-[70px] w-full">
        <Image
          src={item.image.url}
          alt={item.image.alt}
          fill
          sizes="80px"
          className="object-contain p-2"
          unoptimized
        />
      </div>

      <div className="flex items-center justify-between gap-3 p-3">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-wide text-white/70">Next round</span>
          <span className="text-sm font-semibold text-white">{countdown}</span>
        </div>
        <span className="rounded-full border border-white/50 bg-transparent px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          Play
        </span>
      </div>
    </Link>
  );
};

export default VirtualGameCardTile;

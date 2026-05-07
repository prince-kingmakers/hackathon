"use client";

import GameCardTile from "@/components/GameCardTile";
import PromotionCardTile from "@/components/PromotionCardTile";
import { railSlideClassForHomeItem } from "@/components/gameCardTileShared";
import type { GameTile, HomeRailItem, HomeSliceVertical } from "@/types/personalization";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

type RecommendedRailProps = {
  items: HomeRailItem[];
  recentlyPlayed: GameTile[];
  vertical: HomeSliceVertical;
};

const recommendedHeading = (recentlyPlayed: GameTile[]) => {
  const name = recentlyPlayed.find((g) => g.name.trim())?.name.trim();
  if (!name) {
    return "Recommended";
  }
  return `We see your ${name} vibe, try these`;
};

const RecommendedRail = ({ items, recentlyPlayed, vertical }: RecommendedRailProps) => {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: false,
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  if (items.length === 0) {
    return null;
  }

  const heading = recommendedHeading(recentlyPlayed);

  return (
    <section className="mt-1 px-3 pb-6 md:px-0" aria-label={heading}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <h2 className="max-w-full text-pretty text-lg font-semibold leading-snug text-bk-backdrop">
          {heading}
        </h2>
      </div>

      <div className="embla">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-3">
            {items.map((item) => (
              <div
                key={item.kind === "promotion" ? `promo-${item.id}` : item.id}
                className={`embla__slide min-w-0 shrink-0 grow-0 ${railSlideClassForHomeItem(item)}`}
              >
                {item.kind === "promotion" ? (
                  <PromotionCardTile
                    image={item.image}
                    href={item.url}
                    vertical={vertical}
                  />
                ) : (
                  <GameCardTile item={item} nowMs={nowMs} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecommendedRail;

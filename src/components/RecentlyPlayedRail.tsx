"use client";

import GameCardTile from "@/components/GameCardTile";
import type { GameTile } from "@/types/personalization";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

const MAX_VISIBLE_ITEMS = 5;

type RecentlyPlayedRailProps = {
  items: GameTile[];
};

const RecentlyPlayedRail = ({ items }: RecentlyPlayedRailProps) => {
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

  const visibleItems = items.slice(0, MAX_VISIBLE_ITEMS);
  const hasMoreItems = items.length > MAX_VISIBLE_ITEMS;

  return (
    <section className="mt-6 px-3 pb-6 md:px-0" aria-label="Recently Played – Oya, continue!">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-bk-backdrop">Recently Played – Oya, continue!</h2>
        {hasMoreItems ? (
          <button type="button" className="text-sm font-medium text-bk-brand underline">
            View all
          </button>
        ) : null}
      </div>

      <div className="embla">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-3">
            {visibleItems.map((item) => (
              <div
                key={item.id}
                className={`embla__slide min-w-0 shrink-0 grow-0 ${
                  item.kind === "casino"
                    ? "basis-[120px] flex-[0_0_120px] lg:basis-[180px] lg:flex-[0_0_180px]"
                    : "basis-[150px] flex-[0_0_150px] lg:basis-[250px] lg:flex-[0_0_250px]"
                }`}
              >
                <GameCardTile item={item} nowMs={nowMs} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentlyPlayedRail;

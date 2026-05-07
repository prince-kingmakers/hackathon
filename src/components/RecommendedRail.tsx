"use client";

import GameCardTile from "@/components/GameCardTile";
import type { GameTile } from "@/types/personalization";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

type RecommendedRailProps = {
  items: GameTile[];
};

const RecommendedRail = ({ items }: RecommendedRailProps) => {
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

  return (
    <section className="mt-1 px-3 pb-6 md:px-0" aria-label="Recommended">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-bk-backdrop">Recommended</h2>
      </div>

      <div className="embla">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className={`embla__slide min-w-0 shrink-0 grow-0 ${
                  item.kind === "casino"
                    ? "basis-[180px] flex-[0_0_180px]"
                    : "basis-[250px] flex-[0_0_250px]"
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

export default RecommendedRail;

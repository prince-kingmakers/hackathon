"use client";

import GameCardTile from "@/components/GameCardTile";
import type { CategoryByStakeRow } from "@/types/personalization";
import useEmblaCarousel from "embla-carousel-react";
import { useEffect, useState } from "react";

const MAX_VISIBLE_ITEMS = 5;

type CategoryStakeRowProps = {
  row: CategoryByStakeRow;
  nowMs: number;
};

const CategoryStakeRow = ({ row, nowMs }: CategoryStakeRowProps) => {
  const [emblaRef] = useEmblaCarousel({
    align: "start",
    dragFree: true,
    loop: false,
  });

  if (row.items.length === 0) {
    return null;
  }

  const visibleItems = row.items.slice(0, MAX_VISIBLE_ITEMS);
  const hasMoreItems = row.items.length > MAX_VISIBLE_ITEMS;

  return (
    <div className="mb-6 last:mb-0">
      <div className="mb-1 flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-bk-backdrop">{row.name}</h2>
        {hasMoreItems ? (
          <button type="button" className="shrink-0 text-sm font-medium text-bk-brand underline">
            View all
          </button>
        ) : null}
      </div>
      {row.description ? (
        <p className="mb-3 text-sm text-bk-backdrop/70">{row.description}</p>
      ) : null}

      <div className="embla">
        <div className="embla__viewport overflow-hidden" ref={emblaRef}>
          <div className="embla__container flex gap-3">
            {visibleItems.map((item) => (
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
    </div>
  );
};

type CategoriesByStakeRailProps = {
  rows: CategoryByStakeRow[];
};

const CategoriesByStakeRail = ({ rows }: CategoriesByStakeRailProps) => {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(timerId);
  }, []);

  const visibleRows = rows.filter((row) => row.items.length > 0);

  if (visibleRows.length === 0) {
    return null;
  }

  return (
    <section className="mt-1 px-3 pb-6 md:px-0">
      {visibleRows.map((row) => (
        <CategoryStakeRow key={row.name} row={row} nowMs={nowMs} />
      ))}
    </section>
  );
};

export default CategoriesByStakeRail;

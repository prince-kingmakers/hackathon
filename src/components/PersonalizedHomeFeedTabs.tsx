"use client";

import CategoriesByStakeRail from "@/components/CategoriesByStakeRail";
import ExploreNewVerticalRail from "@/components/ExploreNewVerticalRail";
import RecentlyPlayedRail from "@/components/RecentlyPlayedRail";
import RecommendedRail from "@/components/RecommendedRail";
import type { PersonalizedHomeFeedSlice } from "@/types/personalization";
import { useEffect, useState } from "react";

type PersonalizedHomeFeedTabsProps = {
  slices: PersonalizedHomeFeedSlice[];
};

const verticalLabel = (id: string) => {
  if (id === "virtuals") return "Virtuals";
  if (id === "casino") return "Casino";
  return id.charAt(0).toUpperCase() + id.slice(1);
};

const FeedRails = ({ slice }: { slice: PersonalizedHomeFeedSlice | undefined }) => {
  if (!slice) {
    return null;
  }

  return (
    <>
      <RecentlyPlayedRail items={slice.recentlyPlayed ?? []} />
      <CategoriesByStakeRail rows={slice.categoriesByStake ?? []} />
      <RecommendedRail items={slice.recommendedNotPlayed ?? []} />
      <ExploreNewVerticalRail items={slice.exploreNewVertical ?? []} />
    </>
  );
};

const PersonalizedHomeFeedTabs = ({ slices }: PersonalizedHomeFeedTabsProps) => {
  const [activeSliceId, setActiveSliceId] = useState(slices[0]?.id ?? "");

  useEffect(() => {
    if (!slices.some((slice) => slice.id === activeSliceId)) {
      setActiveSliceId(slices[0]?.id ?? "");
    }
  }, [activeSliceId, slices]);

  if (slices.length <= 1) {
    return <FeedRails slice={slices[0]} />;
  }

  const activeSlice = slices.find((slice) => slice.id === activeSliceId) ?? slices[0];

  return (
    <section className="mt-4" aria-label="Personalized vertical tabs">
      <div
        role="tablist"
        aria-label="Home vertical switcher"
        className="mx-3 mb-4 inline-flex md:mx-0"
      >
        {slices.map((slice) => {
          const selected = slice.id === activeSlice.id;
          const tabId = `home-vertical-tab-${slice.id}`;
          const panelId = `home-vertical-panel-${slice.id}`;

          return (
            <button
              key={slice.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveSliceId(slice.id)}
              className={`px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "-mb-px border-b-2 border-bk-primary-light text-bk-primary-light"
                  : "border-b-0 text-bk-backdrop hover:text-bk-primary-light"
              }`}
            >
              {verticalLabel(slice.id)}
            </button>
          );
        })}
      </div>

      <div
        id={`home-vertical-panel-${activeSlice.id}`}
        role="tabpanel"
        aria-labelledby={`home-vertical-tab-${activeSlice.id}`}
      >
        <FeedRails slice={activeSlice} />
      </div>
    </section>
  );
};

export default PersonalizedHomeFeedTabs;

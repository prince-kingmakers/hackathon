"use client";

import CategoriesByStakeRail from "@/components/CategoriesByStakeRail";
import ExploreNewVerticalRail from "@/components/ExploreNewVerticalRail";
import RecentlyPlayedRail from "@/components/RecentlyPlayedRail";
import RecommendedRail from "@/components/RecommendedRail";
import type { PersonalizedHomeFeedSlice } from "@/types/personalization";
import { useState } from "react";

type PersonalizedHomeFeedTabsProps = {
  slices: PersonalizedHomeFeedSlice[];
  firstName: string;
};

const verticalLabel = (id: string) => {
  if (id === "virtuals") return "Virtuals";
  if (id === "casino") return "Games";
  return id.charAt(0).toUpperCase() + id.slice(1);
};

const FeedRails = ({
  slice,
  firstName,
}: {
  slice: PersonalizedHomeFeedSlice | undefined;
  firstName: string;
}) => {
  if (!slice) {
    return null;
  }

  return (
    <>
      <h1 className="mx-3 mb-4 text-center text-2xl font-bold text-bk-backdrop md:mx-0 mt-4">
        <span className="font-extrabold text-bk-primary-light">{firstName}</span>, our No.1{" "}
        {verticalLabel(slice.id)} fan!
      </h1>
      <RecentlyPlayedRail items={slice.recentlyPlayed ?? []} />
      <CategoriesByStakeRail rows={slice.categoriesByStake ?? []} />
      <RecommendedRail
        items={slice.recommendedNotPlayed ?? []}
        recentlyPlayed={slice.recentlyPlayed ?? []}
      />
      <ExploreNewVerticalRail items={slice.exploreNewVertical ?? []} />
    </>
  );
};

const PersonalizedHomeFeedTabs = ({ slices, firstName }: PersonalizedHomeFeedTabsProps) => {
  const [activeSliceId, setActiveSliceId] = useState(slices[0]?.id ?? "");

  const resolvedActiveSliceId = slices.some((slice) => slice.id === activeSliceId)
    ? activeSliceId
    : (slices[0]?.id ?? "");

  if (slices.length <= 1) {
    return <FeedRails slice={slices[0]} firstName={firstName} />;
  }

  const activeSlice =
    slices.find((slice) => slice.id === resolvedActiveSliceId) ?? slices[0];

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
        <FeedRails slice={activeSlice} firstName={firstName} />
      </div>
    </section>
  );
};

export default PersonalizedHomeFeedTabs;

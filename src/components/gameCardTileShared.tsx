import type { GameTile, HomeRailItem } from "@/types/personalization";

export const BADGE_CLASS =
  "inline-flex rounded-full bg-[#d71920] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-white lg:px-2 lg:py-0.5 lg:text-[11px]";

export const formatCountdown = (targetTime: string, nowMs: number) => {
  const targetMs = Date.parse(targetTime);
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return "Live";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const getBadgeLabel = (item: GameTile) => {
  if (item.isExclusive) {
    return "Exclusive";
  }
  if (item.isNew) {
    return "New";
  }
  return null;
};

export const BadgeChip = ({ label, className }: { label: string, className?: string }) => (
  <span className={`absolute left-2 top-2 z-10 ${BADGE_CLASS} ${className}`}>{label}</span>
);

export const railSlideClassForHomeItem = (item: HomeRailItem): string => {
  if (item.kind === "promotion") {
    return "basis-[250px] flex-[0_0_250px] lg:basis-[310px] lg:flex-[0_0_310px]";
  }
  return item.kind === "casino"
    ? "basis-[120px] flex-[0_0_120px] lg:basis-[180px] lg:flex-[0_0_180px]"
    : "basis-[150px] flex-[0_0_150px] lg:basis-[250px] lg:flex-[0_0_250px]";
};

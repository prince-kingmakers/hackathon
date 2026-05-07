import type { GameTile } from "@/types/personalization";

export const BADGE_CLASS =
  "inline-flex rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#d71920]";

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

export const BadgeChip = ({ label }: { label: string }) => (
  <span className={`absolute left-2 top-2 z-10 ${BADGE_CLASS}`}>{label}</span>
);

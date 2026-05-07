"use client";

import type { CasinoGameTile, GameTile, VirtualGameTile } from "@/types/personalization";
import CasinoGameCardTile from "./CasinoGameCardTile";
import VirtualGameCardTile from "./VirtualGameCardTile";

type GameCardTileProps = {
  item: GameTile;
  nowMs: number;
};

const GameCardTile = ({ item, nowMs }: GameCardTileProps) => {
  if (item.kind === "virtuals") {
    return <VirtualGameCardTile item={item as VirtualGameTile} nowMs={nowMs} />;
  }

  return <CasinoGameCardTile item={item as CasinoGameTile} />;
};

export default GameCardTile;

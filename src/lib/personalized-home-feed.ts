import betsData from "../../mock/bets.json";
import categoriesData from "../../mock/categories.json";
import gamesData from "../../mock/games.json";
import promotionsData from "../../mock/promotions.json";
import verticalsData from "../../mock/verticals.json";
import { DEFAULT_ID, getUserDetailsById } from "@/lib/mock-users";
import type {
  BetRecord,
  CategoryByStakeRow,
  CategoryRecord,
  GameRecord,
  GameTile,
  HomeRailItem,
  PersonalizedHomeFeedSlice,
  PromotionRailItem,
  VerticalRecord,
} from "@/types/personalization";
import type { Promotion } from "@/types/promotion";
import type { UserPersona } from "@/types/user";

const MAX_RECENTLY_PLAYED = 5;
const MAX_CATEGORIES_BY_STAKE_ROWS = 2;
const MAX_CATEGORIES_BY_STAKE_ITEMS = 5;
const MAX_RECOMMENDED_NOT_PLAYED = 5;
const MAX_PROMOTION_TILES_PER_RAIL = 3;
const MAX_EXPLORE_NEW_VERTICAL = 5;
const MAX_VIRTUAL_ROUND_AHEAD_MS = 2 * 60 * 1000;

const bets = betsData as BetRecord[];
const categories = categoriesData as CategoryRecord[];
const games = gamesData as GameRecord[];
const promotionsCatalog = promotionsData as Promotion[];
const verticals = verticalsData as VerticalRecord[];

const isPersona = (value: string): value is UserPersona =>
  value === "casino" || value === "virtuals" || value === "both";

const resolvePersona = (id: string | undefined): UserPersona => {
  const trimmed = id?.trim();
  return trimmed && isPersona(trimmed) ? trimmed : DEFAULT_ID;
};

const categoriesById = new Map(categories.map((category) => [category.id, category]));
const gamesById = new Map(games.map((game) => [game.id, game]));
const verticalIds = new Set(verticals.map((vertical) => vertical.id));

type SliceVertical = VerticalRecord["id"];

const createVirtualRoundTime = () =>
  new Date(Date.now() + Math.floor(Math.random() * MAX_VIRTUAL_ROUND_AHEAD_MS)).toISOString();

const toGameTile = (game: GameRecord): GameTile | null => {
  const category = categoriesById.get(game.categoryId);
  if (!category || !verticalIds.has(category.verticalId)) {
    return null;
  }

  const baseTile = {
    id: game.id,
    name: game.name,
    image: game.image,
    url: game.url,
    isExclusive: game.isExclusive,
    isNew: game.isNew,
  };

  if (category.verticalId === "virtuals") {
    return {
      ...baseTile,
      kind: "virtuals",
      time: createVirtualRoundTime(),
    };
  }

  return {
    ...baseTile,
    kind: "casino",
  };
};

const getUniqueRecentGames = (persona: UserPersona, vertical?: VerticalRecord["id"]) => {
  const seenGameIds = new Set<string>();

  return bets
    .filter((bet) => {
      if (bet.userId !== persona) {
        return false;
      }

      if (!vertical) {
        return true;
      }

      return resolveGameVertical(bet.gameId) === vertical;
    })
    .sort((a, b) => Date.parse(b.placedAt) - Date.parse(a.placedAt))
    .filter((bet) => {
      if (seenGameIds.has(bet.gameId)) {
        return false;
      }
      seenGameIds.add(bet.gameId);
      return true;
    })
    .map((bet) => gamesById.get(bet.gameId))
    .filter((game): game is GameRecord => Boolean(game))
    .slice(0, MAX_RECENTLY_PLAYED);
};

const getBetsForPersona = (persona: UserPersona) =>
  bets.filter((bet) => bet.userId === persona);

const toCategoryByStakeRows = (
  persona: UserPersona,
  excludedGameIds: Set<string>,
  vertical?: SliceVertical,
): CategoryByStakeRow[] => {
  const betsForPersona = getBetsForPersona(persona);

  const gameStakeTotals = new Map<string, number>();
  for (const bet of betsForPersona) {
    if (excludedGameIds.has(bet.gameId)) {
      continue;
    }

    gameStakeTotals.set(bet.gameId, (gameStakeTotals.get(bet.gameId) ?? 0) + bet.stake);
  }

  const categoryStakeTotals = new Map<string, number>();
  for (const [gameId, totalStake] of gameStakeTotals.entries()) {
    const game = gamesById.get(gameId);
    if (!game) {
      continue;
    }

    const category = categoriesById.get(game.categoryId);
    if (!category || !verticalIds.has(category.verticalId)) {
      continue;
    }

    if (vertical && category.verticalId !== vertical) {
      continue;
    }

    categoryStakeTotals.set(
      category.id,
      (categoryStakeTotals.get(category.id) ?? 0) + totalStake,
    );
  }

  const topCategories = [...categoryStakeTotals.entries()]
    .sort(([, aStake], [, bStake]) => bStake - aStake)
    .slice(0, MAX_CATEGORIES_BY_STAKE_ROWS)
    .map(([categoryId]) => categoriesById.get(categoryId))
    .filter((category): category is CategoryRecord => Boolean(category));

  return topCategories
    .map((category) => {
      const items = [...gameStakeTotals.entries()]
        .flatMap(([gameId, totalStake]) => {
          const game = gamesById.get(gameId);
          if (!game || game.categoryId !== category.id) {
            return [];
          }

          return [{ game, totalStake }];
        })
        .sort((a, b) => b.totalStake - a.totalStake)
        .map(({ game }) => toGameTile(game))
        .filter((tile): tile is GameTile => Boolean(tile))
        .slice(0, MAX_CATEGORIES_BY_STAKE_ITEMS);

      return {
        categoryId: category.id,
        name: category.name,
        description: category.description,
        items,
      };
    })
    .filter((category) => category.items.length > 0);
};

const resolveGameVertical = (gameId: string): SliceVertical | null => {
  const game = gamesById.get(gameId);
  if (!game) {
    return null;
  }

  const category = categoriesById.get(game.categoryId);
  if (!category || !verticalIds.has(category.verticalId)) {
    return null;
  }

  return category.verticalId;
};

const promotionMatchesVertical = (promo: Promotion, vertical: SliceVertical): boolean => {
  if (promo.verticalId) {
    return promo.verticalId === vertical;
  }
  if (promo.gameId) {
    return resolveGameVertical(promo.gameId) === vertical;
  }
  if (promo.categoryId) {
    const cat = categoriesById.get(promo.categoryId);
    return cat?.verticalId === vertical;
  }
  return false;
};

const promotionMatchesCategory = (promo: Promotion, categoryId: string): boolean => {
  if (promo.categoryId) {
    return promo.categoryId === categoryId;
  }
  if (promo.gameId) {
    return gamesById.get(promo.gameId)?.categoryId === categoryId;
  }
  return false;
};

const resolvePromotionUrl = (promo: Promotion): string | null => {
  if (promo.gameId) {
    return gamesById.get(promo.gameId)?.url ?? null;
  }
  if (promo.categoryId) {
    const firstInCategory = games.find((g) => g.categoryId === promo.categoryId);
    return firstInCategory?.url ?? null;
  }
  if (promo.verticalId === "virtuals") {
    return "/en-ng/virtuals";
  }
  if (promo.verticalId === "casino") {
    return "/en-ng/games";
  }
  return null;
};

const toPromotionRailItem = (promo: Promotion): PromotionRailItem | null => {
  const url = resolvePromotionUrl(promo);
  if (!url) {
    return null;
  }
  return {
    kind: "promotion",
    id: promo.id,
    image: promo.image,
    url,
  };
};

const takeNextPromotionRailItem = (
  usedPromoIds: Set<string>,
  vertical: SliceVertical,
  userPromoIds: Set<string>,
  rowCategoryId?: string,
): PromotionRailItem | null => {
  const tryTake = (categoryPhase: boolean): PromotionRailItem | null => {
    for (const promo of promotionsCatalog) {
      if (!userPromoIds.has(promo.id)) {
        continue;
      }
      if (usedPromoIds.has(promo.id)) {
        continue;
      }
      if (!promotionMatchesVertical(promo, vertical)) {
        continue;
      }
      if (categoryPhase) {
        if (!rowCategoryId || !promotionMatchesCategory(promo, rowCategoryId)) {
          continue;
        }
      }
      const item = toPromotionRailItem(promo);
      if (!item) {
        continue;
      }
      usedPromoIds.add(promo.id);
      return item;
    }
    return null;
  };

  if (rowCategoryId) {
    const categoryFirst = tryTake(true);
    if (categoryFirst) {
      return categoryFirst;
    }
  }

  return tryTake(false);
};

const countPromotionTiles = (items: HomeRailItem[]) =>
  items.filter((item) => item.kind === "promotion").length;

const padRailItems = (
  items: HomeRailItem[],
  maxRail: number,
  vertical: SliceVertical,
  userPromoIds: Set<string>,
  usedPromoIds: Set<string>,
  rowCategoryId?: string,
): HomeRailItem[] => {
  const gameTileCount = items.filter((item) => item.kind !== "promotion").length;
  const targetLength = Math.min(maxRail, gameTileCount + MAX_PROMOTION_TILES_PER_RAIL);
  const result = [...items];
  while (
    result.length < targetLength &&
    countPromotionTiles(result) < MAX_PROMOTION_TILES_PER_RAIL
  ) {
    const next = takeNextPromotionRailItem(
      usedPromoIds,
      vertical,
      userPromoIds,
      rowCategoryId,
    );
    if (!next) {
      break;
    }
    result.push(next);
  }
  return result;
};

const padCategoryRows = (
  rows: CategoryByStakeRow[],
  vertical: SliceVertical,
  userPromoIds: Set<string>,
  usedPromoIds: Set<string>,
): CategoryByStakeRow[] =>
  rows.map((row) => ({
    ...row,
    items: padRailItems(
      row.items,
      MAX_CATEGORIES_BY_STAKE_ITEMS,
      vertical,
      userPromoIds,
      usedPromoIds,
      row.categoryId,
    ),
  }));

const resolveVerticalOrder = (persona: UserPersona): SliceVertical[] => {
  if (persona === "casino" || persona === "virtuals") {
    return [persona];
  }

  const fallbackOrder: SliceVertical[] = ["virtuals", "casino"];
  const stakeByVertical = new Map<SliceVertical, number>(
    fallbackOrder.map((vertical) => [vertical, 0]),
  );

  for (const bet of getBetsForPersona(persona)) {
    const vertical = resolveGameVertical(bet.gameId);
    if (!vertical) {
      continue;
    }

    stakeByVertical.set(vertical, (stakeByVertical.get(vertical) ?? 0) + bet.stake);
  }

  return [...stakeByVertical.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([vertical]) => vertical);
};

const toRecommendedNotPlayed = (
  persona: UserPersona,
  vertical: SliceVertical,
): GameTile[] => {
  const userPlayedGameIds = new Set(
    bets.filter((bet) => bet.userId === persona).map((bet) => bet.gameId),
  );

  const otherStakeByGameId = new Map<string, number>();
  for (const bet of bets) {
    if (bet.userId === persona) {
      continue;
    }

    otherStakeByGameId.set(
      bet.gameId,
      (otherStakeByGameId.get(bet.gameId) ?? 0) + bet.stake,
    );
  }

  return [...otherStakeByGameId.entries()]
    .flatMap(([gameId, totalOtherStake]) => {
      if (userPlayedGameIds.has(gameId)) {
        return [];
      }

      const game = gamesById.get(gameId);
      if (!game) {
        return [];
      }

      const category = categoriesById.get(game.categoryId);
      if (!category || category.verticalId !== vertical) {
        return [];
      }

      return [{ game, totalOtherStake }];
    })
    .sort((a, b) => b.totalOtherStake - a.totalOtherStake)
    .slice(0, MAX_RECOMMENDED_NOT_PLAYED)
    .map(({ game }) => toGameTile(game))
    .filter((tile): tile is GameTile => Boolean(tile));
};

const resolveOppositeVertical = (vertical: SliceVertical): SliceVertical =>
  vertical === "casino" ? "virtuals" : "casino";

const toExploreNewVertical = (persona: UserPersona): GameTile[] => {
  if (persona === "both") {
    return [];
  }

  const exploreVertical = resolveOppositeVertical(persona);
  const userPlayedGameIds = new Set(getBetsForPersona(persona).map((bet) => bet.gameId));
  const stakeByGameId = new Map<string, number>();

  for (const bet of bets) {
    const game = gamesById.get(bet.gameId);
    if (!game || userPlayedGameIds.has(game.id)) {
      continue;
    }

    const category = categoriesById.get(game.categoryId);
    if (!category || category.verticalId !== exploreVertical) {
      continue;
    }

    stakeByGameId.set(game.id, (stakeByGameId.get(game.id) ?? 0) + bet.stake);
  }

  return [...stakeByGameId.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, MAX_EXPLORE_NEW_VERTICAL)
    .map(([gameId]) => gamesById.get(gameId))
    .filter((game): game is GameRecord => Boolean(game))
    .map((game) => toGameTile(game))
    .filter((tile): tile is GameTile => Boolean(tile));
};

export const getPersonalizedHomeFeed = (
  id: string | undefined,
): PersonalizedHomeFeedSlice[] => {
  const persona = resolvePersona(id);
  const buildSlice = (
    sliceId: UserPersona,
    vertical: SliceVertical,
    includeExploreNewVertical: boolean,
  ): PersonalizedHomeFeedSlice => {
    const userPromoIds = new Set(getUserDetailsById(id).promotions);
    const usedPromoIds = new Set<string>();

    const recentlyPlayedGames = getUniqueRecentGames(persona, vertical);
    const excludedGameIds = new Set(recentlyPlayedGames.map((game) => game.id));
    const categoriesByStake = padCategoryRows(
      toCategoryByStakeRows(persona, excludedGameIds, vertical),
      vertical,
      userPromoIds,
      usedPromoIds,
    );
    let recommendedNotPlayed: HomeRailItem[] = toRecommendedNotPlayed(persona, vertical);
    recommendedNotPlayed = padRailItems(
      recommendedNotPlayed,
      MAX_RECOMMENDED_NOT_PLAYED,
      vertical,
      userPromoIds,
      usedPromoIds,
    );

    const slice: PersonalizedHomeFeedSlice = {
      id: sliceId,
      vertical,
      recentlyPlayed: recentlyPlayedGames
        .map((game) => toGameTile(game))
        .filter((tile): tile is GameTile => Boolean(tile)),
      categoriesByStake,
    };

    if (recommendedNotPlayed.length > 0) {
      slice.recommendedNotPlayed = recommendedNotPlayed;
    }

    if (includeExploreNewVertical) {
      const exploreNewVertical = toExploreNewVertical(persona);
      if (exploreNewVertical.length > 0) {
        slice.exploreNewVertical = exploreNewVertical;
      }
    }

    return slice;
  };

  if (persona === "both") {
    return resolveVerticalOrder(persona).map((vertical) => buildSlice(vertical, vertical, false));
  }

  return [buildSlice(persona, persona, true)];
};

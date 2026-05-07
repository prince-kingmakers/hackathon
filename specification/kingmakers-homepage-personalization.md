# KingMakers Mobile Homepage Personalization Spec

## 1. Overview

This document defines the personalized homepage experience for **KingMakers brands** (shared mobile web codebase—for example BetKing and SuperSportBet).

### Goals

- Reduce friction in accessing preferred betting content  
- Increase bet placement speed  
- Improve engagement and retention  
- Drive revenue through smart content prioritization  

### Brand labeling (BetKing)

**BetKing** labels the **casino** vertical as **Games** everywhere users see it: primary navigation, dual-vertical tabs, `verticals.json` **`name`** fields returned to the client, and headings such as “Explore …”. Other KingMakers brands (for example **SuperSportBet**) may keep **Casino** in product copy. Internal identifiers stay **`casino`** (`userId` persona values, vertical `id`, API query params, game `kind`, URLs under `/en-ng/casino/...` where routing is legacy).

This prototype’s mock CMS data targets BetKing: client-facing **`name`** strings use **Games** where they denote the casino vertical.

---

## 2. Core principles

1. Personalization first, but not exclusively  
2. Balance user preference with business goals  
3. Always allow discovery of new and high-margin products  
4. Avoid repetition across sections  
5. Keep UI simple, fast, and mobile-first  

---

## 3. Scope and verticals

KingMakers products cover **three verticals: sports, casino, and virtuals** (BetKing UI: **Games** for the casino vertical).

The homepage rails described in this document focus **casino and virtuals**.

### User personas

| Persona | Behavior |
|--------|----------|
| **Virtuals-only** | Plays virtuals; no meaningful casino history |
| **Casino-only** | Plays casino (labeled **Games** on BetKing); no meaningful virtuals history |
| **Both** | Plays both virtuals and casino |

The homepage adapts layout and optional navigation (see [Dual-vertical UX](#5-dual-vertical-ux)) based on these personas.

---

## 4. Homepage structure (ordered layout)

Sections appear **in this order**, top to bottom:

### 1. Menu / navigation

- **Desktop / tablet:** **Logo** on the **left**, **primary menu items** in the **center**, **wallet balance** and **profile** on the **right**.  
- **Mobile:** **Logo** top-left and **wallet + profile** top-right on one row; **primary navigation items** live in a **bottom** bar (thumb reach).

The standard primary navigation entries are **Sports**, **Casino** (BetKing: **Games**), **Virtuals**, and **Promotions**. Each entry's URL follows **`/en-ng/<segment>`** — for example `/en-ng/sports`, `/en-ng/games` (BetKing casino entry), `/en-ng/casino` (other brands), `/en-ng/virtuals`, `/en-ng/promotions`.

Wallet balance is shown in the header alongside the profile entry point.

### 2. Banners

Editorial promotional cards that apply to **all** users — these are **not** personalized. They appear in a horizontal carousel.

Banners are editorial advertising; user-eligible **promotions** are modeled separately in [`promotions.json`](#promotionsjson-expected-fields) and surfaced via `getUserDetails`.

### 3. Recently played

Up to **5** virtuals and/or casino titles the user has played most recently. Anything beyond the top 5 surfaces through [Categories sorted by stake](#4-categories-sorted-by-stake).

#### Card UI (applies to Recently played, Categories sorted by stake, Recommended, and Explore New)

Each rail is a horizontal scroller of cards.

- **Casino card** (BetKing: **Games** tile): the game's tile artwork (image only).
- **Virtuals card:** the league/game logo, the time until the next round, and a play button. When the round time is the current time or in the past, the card shows a **Live** indicator instead of a countdown.
- **Badge treatment (current increment):** cards can optionally show **Exclusive** or **New**. Badges use a white background, rounded corners, and red text. If both flags are present on an item, show **Exclusive** and hide **New**.

### 4. Categories sorted by stake

Up to **two** category rows per relevant context. Categories themselves are sorted by stake, and the games **within** each category are also sorted by stake.

Each row uses the same [card UI](#card-ui-applies-to-recently-played-categories-sorted-by-stake-recommended-and-explore-new) as Recently played.

### 5. Recommended

Popular titles **the user has not played** in the **same vertical** as the active tab or primary vertical, curated by AI based on the user's bet activity and high margin games.

Same card layout as Recently played.

### 6. Explore New

Cross-sells **new** content on the **opposite** vertical from the user's primary vertical (casino ↔ virtuals). Same card layout as Recently played.

**Visibility:** Show this rail only for **virtuals-only** or **casino-only** users. Users who play **both** verticals do not see this rail.

---

## 5. Dual-vertical UX

- **Virtuals-only** and **Casino-only** users: **no** homepage vertical tab strip beyond what the personalized payload requires (single implicit vertical).  
- **Both** verticals: show a **tab control** **Virtuals | Casino** — **BetKing:** **Virtuals | Games**.

### Tab-scoped vs global (default behavior)

| Area | Behavior |
|------|----------|
| Menu / navigation | Global |
| Banners | Global — editorial, same for all users |
| Recently played | Align with **active** tab where applicable |
| Categories by stake | Up to **two** rows **per active vertical tab** (limits from API) |
| Recommended | **Same vertical** as active tab / context |
| Explore New | **Not applicable** for dual-vertical users (omitted on server) |

If a section has no items for the active tab, hide or collapse that section.

---

## 6. Technical: APIs and load order

This section is **technical reference** for engineering (endpoints, payloads, ordering).

### Sequence on page load

**`getPersonalizedHomeFeed`** needs a resolved **`userId`** (or equivalent session context). It does **not** have to run after **`getUserDetails`** returns if identity is already known from the request (e.g. **query param**, cookie, or auth middleware) before any BFF calls.

When **`userId`** is available up front, fetch **all** of these **in parallel**:

1. **`getUserDetails`** — **`userId`** and **wallet balance** (may echo or validate the same identity).
2. **`getNavigationMenu`** — primary nav items (`id`, `name`, `url`).
3. **`getBanners`** — editorial banner carousel.
4. **`getPersonalizedHomeFeed`** — personalized homepage rails.

If **`userId`** is only known **after** **`getUserDetails`** (or session resolution) completes—e.g. you must call the user endpoint first to learn who is logged in—then run **`getPersonalizedHomeFeed`** in a **second** step once that identity is available.

**`getUserDetails`**, **`getNavigationMenu`**, and **`getBanners`** do not depend on each other. **`getPersonalizedHomeFeed`** depends only on having **`userId`** (or session), not on the order of the other three calls.

In this prototype, all four endpoints live under a dynamic Next.js locale segment (`src/app/[locale]/...`) and are called as `/{locale}/...` (e.g. `/en-ng/cms/navigation`). The locale is read from the route params on the homepage and threaded through both server-side fetches and the client-side balance refresh.

### User details

| Endpoint (illustrative) | Purpose |
|-------------------------|---------|
| **`getUserDetails`** | Returns **`userId`** and **wallet balance** |

**Implementation in this prototype**

- Route: `GET /{locale}/bff/user-details?id={persona}` (e.g. `/en-ng/bff/user-details?id=casino`)
- `{locale}` is a dynamic Next.js segment (`src/app/[locale]/bff/user-details/route.ts`); no allow-list yet
- Query param: **`id`** (optional) — one of **`casino`** | **`virtuals`** | **`both`**. Missing or unknown values fall back to **`casino`**.
- Response (`UserDetails`): `{ userId: "casino" | "virtuals" | "both"; balance: number; firstName: string; promotions: string[] }`. **`promotions`** is a list of promotion IDs assigned to the user; full promotion records live in `promotions.json` (see [Source JSON architecture](#source-json-architecture-for-personalization)).
- Source: `mock/users.json` via `getUserDetailsById` (`src/lib/mock-users.ts`)
- Caching: `force-dynamic` on the route; called with `cache: "no-store"` from the homepage server component (`src/app/[locale]/page.tsx`)

### Navigation menu

| Endpoint (illustrative) | Purpose |
|-------------------------|---------|
| **`getNavigationMenu`** | Primary menu items: **`id`**, **`name`**, **`url`** (e.g. Sports, Games on BetKing / Casino elsewhere, Virtuals, Promotions) |

**Implementation in this prototype**

- Route: `GET /{locale}/cms/navigation` (e.g. `/en-ng/cms/navigation`); no params
- `{locale}` is a dynamic Next.js segment (`src/app/[locale]/cms/navigation/route.ts`)
- Response (`NavigationMenuItem[]`): `{ id: string; name: string; url: string }[]`
- Source: `mock/navigation.json` (BetKing-facing: Sports, **Games**, Virtuals, Promotions); item URLs are returned already locale-prefixed (e.g. `/en-ng/sports`, `/en-ng/games`)
- Caching: `force-dynamic`; called with `cache: "no-store"` from `src/app/[locale]/page.tsx`

### Banners

| Endpoint (illustrative) | Purpose |
|-------------------------|---------|
| **`getBanners`** | Editorial banner list: `{ id, url, image }[]` where **`image`** is `{ url, alt }` |

**Implementation in this prototype**

- Route: `GET /{locale}/cms/banners` (e.g. `/en-ng/cms/banners`); no params
- `{locale}` is a dynamic Next.js segment (`src/app/[locale]/cms/banners/route.ts`)
- Response (`BannerItem[]`): `{ id: string; url: string; image: { url: string; alt: string } }[]`
- Source: `mock/banners.json`
- Caching: `force-dynamic`; called with `cache: "no-store"` from `src/app/[locale]/page.tsx`

### Personalized homepage rails

One endpoint, **`getPersonalizedHomeFeed`**, returns personalized rails **excluding** user details, navigation, and banners.

#### Current implementation increment (this prototype step)

- Route: `GET /{locale}/bff/personalized-home-feed?id={persona}`
- The response is **non-exhaustive** in the example below: the prototype returns additional rails (e.g. `categoriesByStake`, `recommendedNotPlayed`, `exploreNewVertical`) when applicable.

```json
[
  {
    "id": "virtuals",
    "recentlyPlayed": []
  }
]
```

- `recentlyPlayed` is capped at **5** items, sorted by most recent `placedAt` descending, deduplicated by `gameId`.

#### Response shape: tabbed vertical payloads

The endpoint returns an **array of objects**. Each object has:

- **`id`** — stable identifier for that slice (e.g. vertical or segment).  
- **Rail fields** as keys on the same object, including for example **`recentlyPlayed`**, **`categoriesByStake`**, **`recommendedNotPlayed`**, **`exploreNewVertical`**, etc. (exact key set per platform).

**UI rule:** If the array contains **more than one** object, show **tabs**—one tab per object, keyed by **`id`**. Each tab’s body renders the rails (`recentlyPlayed`, …) on that object. If there is **only one** object, **do not** show that tab chrome; render its rails directly.

#### Payload fields (per object in the array)

Field names are logical; JSON keys follow platform standards.

| Field | Description |
|-------|-------------|
| `recentlyPlayed` | Tiles the user has played; **casino** vs **virtuals** per tagged union or parallel lists (implementation choice). |
| `categoriesByStake` | Array of `{ categoryId, name, description, items[] }`; **`categoryId`** matches `categories.json` and is used server-side when inserting promotion tiles next to the matching stake-sorted row. For **virtuals** categories `description` is required, for **casino** categories it is optional. **`items`** use [tile shapes](#tile-shapes). Sorted/limited **server-side**. |
| `recommendedNotPlayed` | **Same structure as `recentlyPlayed`** for the **same vertical** as this slice; omit section if empty. |
| `exploreNewVertical` | Same tile shapes as **`recentlyPlayed`**; cross-sell **opposite** vertical. **Omitted entirely server-side** for users who play **both** verticals. |

#### Promotion tiles in category and recommended rails

Mixed **`items`** arrays may contain game tiles and **`kind: "promotion"`** tiles (see [Tile shapes](#tile-shapes)). Rules below are **server-side** for this prototype.

- **Eligibility:** Only promotion IDs assigned to the user (`UserDetails.promotions` / `users.json`) are candidates; full records come from `promotions.json`.
- **`categoriesByStake` rows:** When padding **`categoriesByStake[*].items`**, prefer promotions that belong to **that row’s category** before broader matches:
  - **Phase A:** `promotion.categoryId` equals the row’s **`categoryId`**, or `promotion.gameId` resolves to a game whose **`categoryId`** equals the row’s category.
  - **Phase B:** Any remaining user-eligible promotion that still matches the slice **vertical** (via `verticalId`, or game/category resolved to a vertical).
- **`recommendedNotPlayed`:** There is no single category context — use **vertical-aligned** promotion selection only (same as Phase B above).
- **Caps:** At most **3** promotion tiles per rail after padding. Target length is **`min(MAX_ITEMS_PER_RAIL, initialGameTileCount + 3)`**, where **`MAX_ITEMS_PER_RAIL`** is **5** for both category rows and recommended (e.g. **1** game tile → up to **3** promos → **4** items total; **2** game tiles → up to **3** promos → **5** items total when the cap allows).
- **Dedup:** Within one feed slice (one tab), each promotion **`id`** appears **at most once** across padded rails (`recentlyPlayed` is games-only; dedup applies wherever promotion tiles are mixed into rails).

### Client assumptions

Ordering, caps (e.g. max category rows, max items per rail), **`exploreNewVertical`** omission for dual-vertical users, and **de-duplication across rails** are **enforced server-side**. The client **renders** what it receives and hides empty sections.

#### Source JSON architecture for personalization

For maintainability, personalization data is split into small domain files and composed in `getPersonalizedHomeFeed`:

- `verticals.json` — vertical catalog metadata
- `categories.json` — category catalog keyed to verticals
- `games.json` — canonical game catalog keyed to categories
- `bets.json` — user betting events that link users to games
- `promotions.json` — promotion catalog; user records carry assigned promotion IDs

The BFF joins these sources and emits the tabbed rails payload in [Response shape: tabbed vertical payloads](#response-shape-tabbed-vertical-payloads).

##### `verticals.json`: expected fields

`id` and `name` are the **minimum required** fields.

```json
[
  {
    "id": "casino",
    "name": "Games"
  },
  {
    "id": "virtuals",
    "name": "Virtuals"
  }
]
```

Notes:

- Required: `id`, `name`
- `id` values are stable keys used across games, bets, tabs, and rail composition.
- **`name`** is client-facing; BetKing uses **Games** for `id: "casino"`. Other brands may use **Casino**.
- Vertical ordering is **not static metadata**. The server computes tab/rail order per user from stake totals in `bets.json` (highest total stake first).

##### `categories.json`: expected fields

`id`, `name`, and `verticalId` are the **minimum required** fields. `description` is conditionally required by vertical.

```json
[
  {
    "id": "cat-live-casino",
    "name": "Live Games",
    "verticalId": "casino"
  },
  {
    "id": "cat-football-virtuals",
    "name": "Football Virtuals",
    "description": "Fast football rounds and popular leagues",
    "verticalId": "virtuals"
  }
]
```

Notes:

- Required: `id`, `name`, `verticalId`
- Required for virtuals categories: `description` (secondary helper text shown under the category name)
- Optional for casino categories: `description`
- `verticalId` must match an `id` in `verticals.json`.
- `id` values are stable keys used by games (`categoryId`) and rail composition.
- In rendered rails, category heading text comes from `name`; `description` is lower-emphasis supporting copy when available.
- BetKing: prefer **Games** over **Casino** in user-visible **`name`** strings (example above).

##### `games.json`: expected fields

Each game should have a stable identity and category mapping. Virtual-specific data (for example `time`) is included only for games in virtuals categories.

```json
[
  {
    "id": "vg-premier-league",
    "name": "Premier League Virtual",
    "image": { "url": "https://...", "alt": "Premier League Virtual" },
    "url": "/en-ng/virtuals/premier-league",
    "categoryId": "cat-football-virtuals",
    "time": "2026-05-07T09:00:00Z",
    "isExclusive": true,
    "isNew": false
  }
]
```

Notes:

- Required for all games: `id`, `name`, `image`, `url`, `categoryId`
- Required only for virtuals cards: `time` (next round start time)
- Optional item badge flags: `isExclusive`, `isNew`
- `categoryId` must match an `id` in `categories.json`.
- Vertical context is resolved via `game.categoryId -> category.verticalId`.
- For mock data used in this prototype, each virtual `time` must be in the future and no more than 2 minutes ahead of `now`.
- Badge priority in UI: `isExclusive` overrides `isNew` when both are true.

##### `bets.json`: expected fields

Your proposed shape is correct and should include user linkage so bets can be filtered per user.

```json
[
  {
    "betId": "b-10001",
    "userId": "casino",
    "placedAt": "2026-05-07T08:25:00Z",
    "stake": 2500,
    "gameId": "vg-premier-league"
  }
]
```

Notes:

- Required: `betId`, `userId`, `placedAt`, `stake`, `gameId`
- `userId` links to the persona/user from user-details source.
- `gameId` links to a record in `games.json`.

##### `promotions.json`: expected fields

`id` and **`image`** are **required**. **`image`** follows the [global image shape](#images): `{ url, alt }`. At least one of `gameId`, `categoryId`, or `verticalId` should be set so the promotion has a target.

```json
[
  {
    "id": "promo-zama-fruits",
    "categoryId": "zama-fruits-promotion-casino",
    "image": {
      "url": "https://imagedelivery.net/Vd-cIddpsfJ7XHHMXJuIbA/77cbc0fd-35c8-438a-1f2f-e6975b727e00/height=140",
      "alt": "Zama Fruits"
    }
  }
]
```

Notes:

- Required: `id`, `image` (`{ url, alt }` — see [Images](#images))
- Optional targets: `gameId`, `categoryId`, `verticalId` — multiple may be set
- **Resolution priority** when a consumer needs a single target: prefer **`gameId`**; if unset, use **`categoryId`**; if unset, use **`verticalId`**
- `gameId` must match an `id` in `games.json`; `categoryId` in `categories.json`; `verticalId` in `verticals.json`
- Users are linked to promotions via `users.json` `promotions: string[]` (IDs); the resolved list is surfaced on `getUserDetails`
- **Personalized feed:** **`categoryId`** and **`gameId`** on a promotion let the server place tiles **next to the matching stake-sorted category row** (Phase A); promotions that only set **`verticalId`** are used as filler after category-scoped matches when padding (Phase B). See [Promotion tiles in category and recommended rails](#promotion-tiles-in-category-and-recommended-rails).

---

## 7. Open questions

_None — banner treatment resolved:_ homepage banners are **editorial advertising**, **not** user-personalized, and apply to **all** users (see [Banners](#2-banners) and **`getBanners`**).

**Resolved for this spec:**

- Dual-vertical tabs: **BetKing** labels the casino vertical **Games** (other brands may use **Casino**).  
- **Max two stake-sorted category rows** apply **per active vertical tab** when the user plays both verticals.

---

## Technical appendix: Global conventions

_Product readers can skip this section; it defines shared UI and payload rules for engineers._

### Images

Any **image** in API payloads is an **object** with:

- **`url`** — asset location (use **`url`** consistently; do not alternate with `src`).  
- **`alt`** — required for accessibility and fallback context.

Example: `{ "url": "...", "alt": "..." }`.

### Carousels

**Banners** and **every content rail** use the **same horizontal carousel** interaction:

- **Desktop:** draggable (pointer drag) along the horizontal axis.  
- **Mobile:** scrollable (touch swipe / momentum scroll).

### Tile shapes

All thumbnails use **`image`: `{ url, alt }`**.

**Casino item** (BetKing UI: **Games** product tile)

```json
{
  "id": "string",
  "image": { "url": "string", "alt": "string" },
  "url": "string"
}
```

**Virtuals item**

```json
{
  "id": "string",
  "image": { "url": "string", "alt": "string" },
  "url": "string",
  "time": "ISO-8601 or agreed datetime — next virtual start",
  "isExclusive": "boolean (optional)",
  "isNew": "boolean (optional)"
}
```

If `time` is the current time or in the past, the client renders the card as **Live**; otherwise it renders the countdown to `time`. There is no separate `isLive` field.

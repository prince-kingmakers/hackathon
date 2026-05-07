# KingMakers Mobile Homepage Personalization Spec

## 1. Overview

This document defines the personalized homepage experience for **KingMakers brands** (shared mobile web codebase—for example BetKing and SuperSportBet).

### Goals

- Reduce friction in accessing preferred betting content  
- Increase bet placement speed  
- Improve engagement and retention  
- Drive revenue through smart content prioritization  

---

## 2. Core principles

1. Personalization first, but not exclusively  
2. Balance user preference with business goals  
3. Always allow discovery of new and high-margin products  
4. Avoid repetition across sections  
5. Keep UI simple, fast, and mobile-first  

---

## 3. Scope and verticals

KingMakers products cover **three verticals: sports, casino, and virtuals.**

The homepage rails described in this document focus **casino and virtuals**.

### User personas

| Persona | Behavior |
|--------|----------|
| **Virtuals-only** | Plays virtuals; no meaningful casino history |
| **Casino-only** | Plays casino; no meaningful virtuals history |
| **Both** | Plays both virtuals and casino |

The homepage adapts layout and optional navigation (see [Dual-vertical UX](#5-dual-vertical-ux)) based on these personas.

---

## 4. Homepage structure (ordered layout)

Sections appear **in this order**, top to bottom:

### 1. Menu / navigation

- **Desktop / tablet:** **Logo** on the **left**, **primary menu items** in the **center**, **wallet balance** and **profile** on the **right**.  
- **Mobile:** **Logo** top-left and **wallet + profile** top-right on one row; **primary navigation items** live in a **bottom** bar (thumb reach).

The standard primary navigation entries are **Sports**, **Casino**, **Virtuals**, and **Promotions**. Each entry's URL follows the convention **`/en-ng/<name-lowercase>`** — for example `/en-ng/sports`, `/en-ng/casino`, `/en-ng/virtuals`, `/en-ng/promotions`.

Wallet balance is shown in the header alongside the profile entry point.

### 2. Banners

Editorial promotional cards that apply to **all** users — these are **not** personalized. They appear in a horizontal carousel.

### 3. Recently played

Up to **5** virtuals and/or casino titles the user has played most recently. Anything beyond the top 5 surfaces through [Categories sorted by stake](#4-categories-sorted-by-stake).

#### Card UI (applies to Recently played, Categories sorted by stake, Recommended, and Explore New)

Each rail is a horizontal scroller of cards.

- **Casino card:** the game's tile artwork (image only).
- **Virtuals card:** the league/game logo, the time until the next round, and a play button. When the round time is the current time or in the past, the card shows a **Live** indicator instead of a countdown.

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
- **Both** verticals: show a **tab control** **Virtuals | Casino** so the user switches context.

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
- Response (`UserDetails`): `{ userId: "casino" | "virtuals" | "both"; balance: number }`
- Source: `mock/users.json` via `getUserDetailsById` (`src/lib/mock-users.ts`)
- Caching: `force-dynamic` on the route; called with `cache: "no-store"` from the homepage server component (`src/app/[locale]/page.tsx`)

### Navigation menu

| Endpoint (illustrative) | Purpose |
|-------------------------|---------|
| **`getNavigationMenu`** | Primary menu items: **`id`**, **`name`**, **`url`** (e.g. Sports, Casino, Virtuals, Promotions) |

**Implementation in this prototype**

- Route: `GET /{locale}/cms/navigation` (e.g. `/en-ng/cms/navigation`); no params
- `{locale}` is a dynamic Next.js segment (`src/app/[locale]/cms/navigation/route.ts`)
- Response (`NavigationMenuItem[]`): `{ id: string; name: string; url: string }[]`
- Source: `mock/navigation.json` (Sports, Casino, Virtuals, Promotions); item URLs are returned already locale-prefixed (e.g. `/en-ng/sports`)
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
| `categoriesByStake` | Array of `{ title, subtitle, items[] }`; **`items`** use [tile shapes](#tile-shapes). Sorted/limited **server-side**. |
| `recommendedNotPlayed` | **Same structure as `recentlyPlayed`** for the **same vertical** as this slice; omit section if empty. |
| `exploreNewVertical` | Same tile shapes as **`recentlyPlayed`**; cross-sell **opposite** vertical. **Omitted entirely server-side** for users who play **both** verticals. |

### Client assumptions

Ordering, caps (e.g. max category rows, max items per rail), **`exploreNewVertical`** omission for dual-vertical users, and **de-duplication across rails** are **enforced server-side**. The client **renders** what it receives and hides empty sections.

---

## 7. Open questions

_None — banner treatment resolved:_ homepage banners are **editorial advertising**, **not** user-personalized, and apply to **all** users (see [Banners](#2-banners) and **`getBanners`**).

**Resolved for this spec:**

- Dual-vertical tabs use **Casino** (not ambiguous “Games” labeling).  
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

**Casino item**

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
  "time": "ISO-8601 or agreed datetime — next virtual start"
}
```

If `time` is the current time or in the past, the client renders the card as **Live**; otherwise it renders the countdown to `time`. There is no separate `isLive` field.

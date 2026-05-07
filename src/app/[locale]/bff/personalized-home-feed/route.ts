import { getPersonalizedHomeFeed } from "@/lib/personalized-home-feed";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export const GET = (request: NextRequest) => {
  const id = request.nextUrl.searchParams.get("id") ?? undefined;
  return Response.json(getPersonalizedHomeFeed(id));
};

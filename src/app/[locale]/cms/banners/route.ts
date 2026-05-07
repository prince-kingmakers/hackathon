import bannerList from "../../../../../mock/banners.json";

export const dynamic = "force-dynamic";

export const GET = async () => Response.json(bannerList);

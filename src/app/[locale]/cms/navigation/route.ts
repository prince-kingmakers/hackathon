import navigationList from "../../../../../mock/navigation.json";

export const dynamic = "force-dynamic";

export const GET = async () => Response.json(navigationList);

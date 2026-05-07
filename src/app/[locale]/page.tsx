import AppNavigation from "@/components/AppNavigation";
import BannerCarousel from "@/components/BannerCarousel";
import PersonalizedHomeFeedTabs from "@/components/PersonalizedHomeFeedTabs";
import { DEFAULT_ID } from "@/lib/mock-users";
import type { BannerItem } from "@/types/banners";
import type { NavigationMenuItem } from "@/types/navigation";
import type { PersonalizedHomeFeedSlice } from "@/types/personalization";
import type { UserDetails } from "@/types/user";
import { headers } from "next/headers";

const requestOrigin = async () => {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
};

type HomePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
};

export default async function Home(props: HomePageProps) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const rawId = searchParams.id;
  const idFromQuery = typeof rawId === "string" ? rawId : rawId?.[0];
  const resolvedId = idFromQuery?.trim() || DEFAULT_ID;

  const origin = await requestOrigin();

  const [bannersRes, navRes, userRes, personalizedFeedRes] = await Promise.all([
    fetch(`${origin}/${locale}/cms/banners`, { cache: "no-store" }),
    fetch(`${origin}/${locale}/cms/navigation`, { cache: "no-store" }),
    fetch(
      `${origin}/${locale}/bff/user-details?id=${encodeURIComponent(resolvedId)}`,
      { cache: "no-store" },
    ),
    fetch(
      `${origin}/${locale}/bff/personalized-home-feed?id=${encodeURIComponent(resolvedId)}`,
      { cache: "no-store" },
    ),
  ]);

  const banners = (await bannersRes.json()) as BannerItem[];
  const navigationItems = (await navRes.json()) as NavigationMenuItem[];
  const user = (await userRes.json()) as UserDetails;
  const personalizedFeed = (await personalizedFeedRes.json()) as PersonalizedHomeFeedSlice[];
  console.log(personalizedFeed);
  return (
    <div className="flex min-h-screen flex-col bg-bk-page-bg">
      <AppNavigation
        key={user.userId}
        items={navigationItems}
        userId={user.userId}
        balance={user.balance}
        locale={locale}
      />
      <main className="lg:w-[1200px] w-full mx-auto">
        <BannerCarousel banners={banners} />
        <PersonalizedHomeFeedTabs slices={personalizedFeed} />
      </main>
    </div>
  );
}

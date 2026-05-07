"use client";

import type { NavigationMenuItem } from "@/types/navigation";
import type { UserPersona } from "@/types/user";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LOGO_SRC =
  "https://imagedelivery.net/Vd-cIddpsfJ7XHHMXJuIbA/1aa28e1e-4070-41d9-3f28-c0fbcc94d300/public";

const normalizePath = (p: string) =>
  p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p;

const isActiveRoute = (pathname: string, href: string) => {
  const p = normalizePath(pathname);
  const h = normalizePath(href);
  return p === h || p.startsWith(`${h}/`);
};

const UserIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4" />
  </svg>
);

const BalanceRefreshIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="currentColor"
    viewBox="0 0 24 24"
    className={className}
    aria-hidden
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="m19 8-4 4h3c0 3.31-2.69 6-6 6a5.9 5.9 0 0 1-2.8-.7l-1.46 1.46A7.93 7.93 0 0 0 12 20c4.42 0 8-3.58 8-8h3zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46A7.93 7.93 0 0 0 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4z" />
  </svg>
);

const formatBalance = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

type AppNavigationProps = {
  items: NavigationMenuItem[];
  userId: UserPersona;
  balance: number;
  locale: string;
};

const AppNavigation = ({ items, userId, balance: initialBalance, locale }: AppNavigationProps) => {
  const pathname = usePathname();
  const [balance, setBalance] = useState(initialBalance);
  const [refreshing, setRefreshing] = useState(false);
  const localeBasePath = `/${locale}`;

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(
        `/${locale}/bff/user-details?id=${encodeURIComponent(userId)}`,
        { cache: "no-store" },
      );
      if (!res.ok) return;
      const data: { balance?: number } = await res.json();
      if (typeof data.balance === "number") setBalance(data.balance);
    } finally {
      setRefreshing(false);
    }
  };

  const linkClass = (href: string) => {
    const active = isActiveRoute(pathname, href);
    return active
      ? "rounded-md bg-bk-primary-light px-3 py-1.5 text-sm font-medium uppercase tracking-wide text-white"
      : "rounded-md px-3 py-1.5 text-sm font-medium uppercase tracking-wide text-bk-hybrid-secondary hover:text-white";
  };

  const mobileLinkClass = (href: string) => {
    const active = isActiveRoute(pathname, href);
    return active
      ? "flex flex-1 flex-col items-center justify-center bg-bk-primary-light py-2 text-xs font-medium text-white"
      : "flex flex-1 flex-col items-center justify-center py-2 text-xs font-medium text-bk-hybrid-secondary hover:text-white";
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 min-h-14 w-full bg-bk-backdrop text-white shadow-[0_4px_6px_rgba(0,0,0,0.1)]"
        role="banner"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 md:grid-cols-[auto_1fr_auto] md:gap-4 md:py-3">
            <div className="flex min-w-0 items-center">
              <Link href={localeBasePath} className="mx-1 shrink-0" aria-label="BetKing home">
                <Image
                  src={LOGO_SRC}
                  alt="BetKing"
                  width={88}
                  height={32}
                  className="h-8 w-[88px] object-contain"
                  priority
                  unoptimized
                />
              </Link>
            </div>

            <nav
              aria-label="Primary"
              className="hidden min-h-[46px] min-w-0 items-center justify-center overflow-x-auto md:flex"
            >
              <div className="flex flex-nowrap items-center justify-center gap-1 sm:gap-2">
                {items.map((item) => (
                  <Link key={item.id} href={item.url} className={linkClass(item.url)}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </nav>

            <div className="flex items-center justify-end gap-2 md:gap-3">
              <div
                className="flex max-w-[min(100%,220px)] items-center gap-1.5 rounded-md bg-bk-primary-light px-2 py-1 text-sm text-white"
                role="group"
                aria-label="Wallet balance"
              >
                <span className="shrink-0 font-medium">₦</span>
                <span className="min-w-0 truncate tabular-nums">{formatBalance(balance)}</span>
                <button
                  type="button"
                  aria-label="Refresh balance"
                  disabled={refreshing}
                  className="ml-0.5 shrink-0 rounded p-0.5 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white disabled:opacity-50"
                  onClick={handleRefreshBalance}
                >
                  <BalanceRefreshIcon className="w-[18px] -my-0.5 shrink-0" />
                </button>
              </div>

              <Link
                href={`${localeBasePath}/my-accounts`}
                className="shrink-0 rounded p-1 text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                aria-label="My account"
              >
                <UserIcon className="shrink-0" />
              </Link>
            </div>
          </div>

          <nav
            aria-label="Primary"
            className="flex md:hidden"
          >
            {items.map((item) => (
              <Link key={item.id} href={item.url} className={mobileLinkClass(item.url)}>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  );
};

export default AppNavigation;

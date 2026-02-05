"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, MessageSquare, Plus, Search } from "lucide-react";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navigation = [
    { name: t("nav.browse"), href: "/listings" },
    { name: t("nav.sell"), href: "/listings/new", requireAuth: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl">🍎</span>
          <span className="text-xl font-semibold tracking-tight">
            {t("common.appName")}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => {
            if (item.requireAuth && !session) return null;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <LocaleSwitcher />

          {status === "loading" ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          ) : session ? (
            <>
              {/* Messages */}
              <Link href="/messages" className="hidden md:block">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare className="h-5 w-5" />
                </Button>
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={session.user?.image || undefined} />
                    <AvatarFallback>
                      {session.user?.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-xl bg-card p-2 shadow-lg ring-1 ring-black ring-opacity-5">
                      <Link
                        href="/dashboard"
                        className="block rounded-lg px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t("nav.dashboard")}
                      </Link>
                      <Link
                        href="/messages"
                        className="block rounded-lg px-4 py-2 text-sm text-foreground hover:bg-accent md:hidden"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t("nav.messages")}
                      </Link>
                      <Link
                        href="/profile"
                        className="block rounded-lg px-4 py-2 text-sm text-foreground hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        {t("nav.profile")}
                      </Link>
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => signOut()}
                        className="block w-full rounded-lg px-4 py-2 text-left text-sm text-destructive hover:bg-accent"
                      >
                        {t("auth.logout")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hidden md:flex md:items-center md:space-x-2">
              <Link href="/login">
                <Button variant="ghost">{t("auth.login")}</Button>
              </Link>
              <Link href="/register">
                <Button>{t("auth.register")}</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden",
          mobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 border-t px-4 py-4">
          {navigation.map((item) => {
            if (item.requireAuth && !session) return null;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="block rounded-lg px-4 py-2 text-base font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            );
          })}
          {!session && (
            <>
              <Link
                href="/login"
                className="block rounded-lg px-4 py-2 text-base font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("auth.login")}
              </Link>
              <Link
                href="/register"
                className="block rounded-lg px-4 py-2 text-base font-medium text-foreground hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("auth.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

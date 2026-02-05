"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { name: t("home"), href: "/", icon: Home },
    { name: t("browse"), href: "/listings", icon: Search },
    { name: t("sell"), href: "/listings/new", icon: PlusCircle, requireAuth: true },
    { name: t("messages"), href: "/messages", icon: MessageSquare, requireAuth: true },
    { name: t("profile"), href: session ? "/profile" : "/login", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-lg md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          if (item.requireAuth && !session) return null;
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

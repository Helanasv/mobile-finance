"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, ReceiptText, Target } from "lucide-react";

import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Главная", icon: LayoutGrid },
  { href: "/history", label: "История", icon: ReceiptText },
  { href: "/budgets", label: "Бюджеты", icon: Target },
];

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-40 border-t bg-background/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      <div className="grid grid-cols-4 items-end">
        {ITEMS.slice(0, 1).map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href} />
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="mx-auto -mt-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-emerald-900/40"
          aria-label="Добавить операцию"
        >
          <Plus className="size-7" />
        </button>

        {ITEMS.slice(1).map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 py-1 text-[11px] font-medium",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

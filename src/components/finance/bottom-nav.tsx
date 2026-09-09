"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, PiggyBank, Plus, ReceiptText, Target } from "lucide-react";

import { useT } from "@/components/finance/finance-context";
import { cn } from "@/lib/utils";

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const t = useT();
  const left = [
    { href: "/", label: t.home, icon: LayoutGrid },
    { href: "/history", label: t.history, icon: ReceiptText },
  ];
  const right = [
    { href: "/goals", label: t.goals, icon: PiggyBank },
    { href: "/budgets", label: t.budgets, icon: Target },
  ];

  return (
    <nav className="sticky bottom-0 z-40 px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))] pt-1">
      <div className="relative grid grid-cols-5 items-end rounded-3xl border border-amber-200/15 bg-card/90 px-0.5 py-2 shadow-[0_-8px_40px_rgba(0,0,0,0.35)] backdrop-blur-md">
        {left.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`)
            }
          />
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="mx-auto -mt-9 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(212,175,110,0.35)]"
          aria-label={t.addTx}
        >
          <Plus className="size-7" />
        </button>

        {right.map((item) => (
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
        "flex flex-col items-center gap-1 py-1 text-[10px] font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Plus, ReceiptText, Target } from "lucide-react";

import { useT } from "@/components/finance/finance-context";
import { cn } from "@/lib/utils";

export function BottomNav({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  const t = useT();
  const items = [
    { href: "/", label: t.home, icon: LayoutGrid },
    { href: "/history", label: t.history, icon: ReceiptText },
    { href: "/budgets", label: t.budgets, icon: Target },
  ];

  return (
    <nav className="sticky bottom-0 z-40 border-t bg-background/90 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md">
      <div className="grid grid-cols-4 items-end">
        {items.slice(0, 1).map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href} />
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="mx-auto -mt-7 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-emerald-900/40"
          aria-label={t.addTx}
        >
          <Plus className="size-7" />
        </button>

        {items.slice(1).map((item) => (
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

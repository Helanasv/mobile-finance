"use client";

import { useMemo } from "react";

import { useFinance, useT } from "@/components/finance/finance-context";
import { reserveScenes } from "@/lib/finance";

export function ReserveScenes({ compact = false }: { compact?: boolean }) {
  const { state } = useFinance();
  const t = useT();
  const scenes = useMemo(() => reserveScenes(state), [state]);

  if (scenes.saved <= 0) {
    if (compact) return null;
    return <p className="text-sm text-muted-foreground">{t.scenesEmpty}</p>;
  }

  const lines = [
    scenes.rentMonths != null ? t.scenesRent(scenes.rentMonths) : null,
    scenes.foodWeeks != null ? t.scenesFood(scenes.foodWeeks) : null,
    scenes.days != null ? t.cushionDaysLine(scenes.days) : null,
  ].filter(Boolean) as string[];

  if (compact) {
    return <p className="mt-0.5 text-sm text-muted-foreground">{lines.join(" · ")}</p>;
  }

  return (
    <section className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
      <p className="text-sm font-medium">{t.scenesTitle}</p>
      <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </section>
  );
}

"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import {
  averageCategoryDaily,
  cushionDays,
  spendableUntilPayday,
  typicalSubscriptionAmount,
  whatIfPreview,
} from "@/lib/finance";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Fork = "off" | "noCafe" | "sub" | "save";

export function WhatIfCard() {
  const { state, addToCushion } = useFinance();
  const t = useT();
  const locale = useLocale();
  const [fork, setFork] = useState<Fork>("off");
  const [saveDraft, setSaveDraft] = useState(0);

  const base = useMemo(() => spendableUntilPayday(state), [state]);
  const cushion = useMemo(() => cushionDays(state), [state]);
  const cafeDaily = useMemo(() => averageCategoryDaily(state, "cafe"), [state]);
  const subAmount = useMemo(() => typicalSubscriptionAmount(state), [state]);
  const maxSave = Math.max(0, Math.floor(base.spendable));

  const input = {
    skipCafe: fork === "noCafe",
    extraBill: fork === "sub" ? subAmount : 0,
    extraSave: fork === "save" ? saveDraft : 0,
  };
  const preview = useMemo(
    () => whatIfPreview(state, input),
    [state, input.skipCafe, input.extraBill, input.extraSave],
  );

  const changed = fork !== "off";

  return (
    <section className="rounded-[1.6rem] border border-amber-200/20 bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {t.whatIfTitle}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{t.whatIfHint}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            { id: "off" as const, label: t.whatIfOff },
            { id: "noCafe" as const, label: t.whatIfNoCafe, disabled: cafeDaily <= 0 },
            { id: "sub" as const, label: t.whatIfSub },
            { id: "save" as const, label: t.whatIfSave, disabled: maxSave < 100 },
          ] as const
        ).map((chip) => (
          <button
            key={chip.id}
            type="button"
            disabled={"disabled" in chip ? chip.disabled : false}
            onClick={() => {
              setFork(chip.id);
              if (chip.id === "save" && saveDraft === 0) {
                setSaveDraft(Math.min(maxSave, 3000) || maxSave);
              }
            }}
            className={cn(
              "min-h-10 rounded-full px-3 text-sm font-medium",
              fork === chip.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground",
              "disabled" in chip && chip.disabled && "opacity-40",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {fork === "save" && maxSave >= 100 ? (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>{t.whatIfSaveLabel}</span>
            <span className="tabular-nums">
              {formatMoney(saveDraft, state.currency, locale)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxSave}
            step={100}
            value={saveDraft}
            onChange={(event) => setSaveDraft(Number(event.target.value))}
            className="w-full accent-primary"
          />
        </div>
      ) : null}

      {fork === "noCafe" && preview.cafeKept > 0 ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {t.whatIfNoCafeHint(formatMoney(preview.cafeKept, state.currency, locale))}
        </p>
      ) : null}
      {fork === "sub" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          {t.whatIfSubHint(formatMoney(subAmount, state.currency, locale))}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Metric
          label={t.whatIfPerDay}
          before={
            base.perDay != null && base.perDay > 0
              ? formatMoney(base.perDay, state.currency, locale)
              : "—"
          }
          after={
            preview.perDay != null
              ? formatMoney(preview.perDay, state.currency, locale)
              : "—"
          }
          changed={changed}
        />
        <Metric
          label={t.whatIfCushion}
          before={cushion.days != null ? t.cushionDaysLine(cushion.days) : "—"}
          after={
            preview.cushionDays != null ? t.cushionDaysLine(preview.cushionDays) : "—"
          }
          changed={changed}
        />
      </div>

      {!changed ? (
        <p className="mt-3 text-xs text-muted-foreground">{t.whatIfSame}</p>
      ) : null}

      {fork === "save" && saveDraft > 0 ? (
        <Button
          type="button"
          className="mt-4 h-11 w-full rounded-xl"
          onClick={() => {
            addToCushion(saveDraft);
            setFork("off");
            setSaveDraft(0);
            toast.success(t.briefingSaved);
          }}
        >
          {t.whatIfApplySave}
        </Button>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  before,
  after,
  changed,
}: {
  label: string;
  before: string;
  after: string;
  changed: boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      {changed ? (
        <>
          <p className="mt-1 text-xs text-muted-foreground line-through">{before}</p>
          <p className="text-sm font-semibold leading-snug">{after}</p>
        </>
      ) : (
        <p className="mt-1 text-sm font-semibold leading-snug">{before}</p>
      )}
    </div>
  );
}

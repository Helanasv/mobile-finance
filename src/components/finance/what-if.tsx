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

  const preview = useMemo(
    () =>
      whatIfPreview(state, {
        skipCafe: fork === "noCafe",
        extraBill: fork === "sub" ? subAmount : 0,
        extraSave: fork === "save" ? saveDraft : 0,
      }),
    [state, fork, subAmount, saveDraft],
  );

  const changed = fork !== "off";
  const story =
    fork === "noCafe"
      ? t.whatIfNoCafeWhy
      : fork === "sub"
        ? t.whatIfSubWhy
        : fork === "save"
          ? t.whatIfSaveWhy
          : t.whatIfOffWhy;

  const options: { id: Fork; label: string; why: string; disabled?: boolean }[] = [
    { id: "off", label: t.whatIfOff, why: t.whatIfOffWhy },
    {
      id: "noCafe",
      label: t.whatIfNoCafe,
      why: cafeDaily <= 0 ? t.whatIfCafeMissing : t.whatIfNoCafeWhy,
      disabled: cafeDaily <= 0,
    },
    { id: "sub", label: t.whatIfSub, why: t.whatIfSubWhy },
    {
      id: "save",
      label: t.whatIfSave,
      why: maxSave < 100 ? t.whatIfNoFreeSave : t.whatIfSaveWhy,
      disabled: maxSave < 100,
    },
  ];

  return (
    <section className="rounded-[1.6rem] border border-amber-200/20 bg-card p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {t.whatIfTitle}
      </p>

      <div className="mt-4 space-y-2">
        {options.map((option) => {
          const selected = fork === option.id;
          return (
            <button
              key={option.id}
              type="button"
              disabled={option.disabled}
              onClick={() => {
                setFork(option.id);
                if (option.id === "save" && saveDraft === 0) {
                  setSaveDraft(Math.min(maxSave, 3000) || maxSave);
                }
              }}
              className={cn(
                "w-full rounded-2xl border px-3 py-3 text-left",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background",
                option.disabled && "opacity-45",
              )}
            >
              <p className="text-sm font-medium">{option.label}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-relaxed",
                  selected ? "text-background/75" : "text-muted-foreground",
                )}
              >
                {option.why}
              </p>
            </button>
          );
        })}
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
          nowLabel={t.whatIfNow}
          thenLabel={t.whatIfThen}
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
          nowLabel={t.whatIfNow}
          thenLabel={t.whatIfThen}
          before={cushion.days != null ? t.daysLabel(cushion.days) : "—"}
          after={
            preview.cushionDays != null ? t.daysLabel(preview.cushionDays) : "—"
          }
          changed={changed}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{story}</p>

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
  nowLabel,
  thenLabel,
  before,
  after,
  changed,
}: {
  label: string;
  nowLabel: string;
  thenLabel: string;
  before: string;
  after: string;
  changed: boolean;
}) {
  return (
    <div className="rounded-2xl bg-muted/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
        {nowLabel}
      </p>
      <p className={cn("text-sm font-semibold leading-snug", changed && "text-muted-foreground")}>
        {before}
      </p>
      {changed ? (
        <>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-primary">{thenLabel}</p>
          <p className="text-sm font-semibold leading-snug">{after}</p>
        </>
      ) : null}
    </div>
  );
}

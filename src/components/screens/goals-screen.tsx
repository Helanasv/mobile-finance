"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ReserveScenes } from "@/components/finance/reserve-scenes";
import { useFinance, useLocale, useT } from "@/components/finance/finance-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { forecastNextMonth, monthsToGoal, averageDailySpend, daysOfHabit, cushionGoal } from "@/lib/finance";
import { formatMoney, parseAmount } from "@/lib/format";

export function GoalsScreen() {
  const { ready, state, addGoal, addToGoal, deleteGoal } = useFinance();
  const t = useT();
  const locale = useLocale();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deposits, setDeposits] = useState<Record<string, string>>({});
  const leftover = forecastNextMonth(state)?.leftover ?? 0;
  const daily = averageDailySpend(state);
  const cushion = cushionGoal(state);

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-3xl bg-muted" />;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <header>
        <p className="text-xs font-medium tracking-[0.18em] text-primary/80 uppercase">
          {t.appName}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight">{t.goals}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.goalsHint}</p>
      </header>

      <ReserveScenes />

      <form
        className="space-y-3 rounded-[1.6rem] border border-amber-200/15 bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const title = name.trim();
          const value = parseAmount(target);
          if (!title) {
            toast.error(t.goalNameError);
            return;
          }
          if (!Number.isFinite(value) || value <= 0) {
            toast.error(t.amountError);
            return;
          }
          addGoal({ name: title, target: value, saved: 0 });
          setName("");
          setTarget("");
          toast.success(t.goalAdded);
        }}
      >
        <Input
          placeholder={t.goalName}
          className="h-11 rounded-xl"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          inputMode="decimal"
          placeholder={`${t.goalTarget}, ${state.currency}`}
          className="h-11 rounded-xl"
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        />
        <Button type="submit" className="h-11 w-full rounded-xl">
          {t.addGoal}
        </Button>
      </form>

      {state.goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed px-6 py-12 text-center">
          <p className="font-medium">{t.emptyTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.goalEmpty}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {state.goals.map((goal) => {
            const ratio = goal.target > 0 ? goal.saved / goal.target : 0;
            const done = goal.saved >= goal.target;
            const months = monthsToGoal(goal, leftover);
            const habitDays = cushion?.id === goal.id ? daysOfHabit(goal.saved, daily) : null;
            const isCushion = cushion?.id === goal.id;
            return (
              <li key={goal.id} className="rounded-[1.6rem] border border-amber-200/15 bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{goal.name}</p>
                    <p className="mt-1 text-sm tabular-nums text-muted-foreground">
                      {formatMoney(goal.saved, state.currency, locale)} {t.of}{" "}
                      {formatMoney(goal.target, state.currency, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-destructive"
                    onClick={() => {
                      deleteGoal(goal.id);
                      toast.success(t.goalDeleted);
                    }}
                  >
                    {t.delete}
                  </button>
                </div>
                <Progress className="mt-3 h-1.5" value={Math.min(100, ratio * 100)} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {done ? t.goalDone : months == null ? t.goalMonthsUnknown : t.goalMonths(months)}
                </p>
                {isCushion ? (
                  <p className="mt-1 text-sm text-primary">
                    {habitDays != null
                      ? t.cushionDaysLine(habitDays)
                      : goal.saved > 0
                        ? t.cushionDaysUnknown
                        : t.cushionDaysEmpty}
                  </p>
                ) : null}
                {!done ? (
                  <form
                    className="mt-3 flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const value = parseAmount(deposits[goal.id] ?? "");
                      if (!Number.isFinite(value) || value <= 0) {
                        toast.error(t.amountError);
                        return;
                      }
                      addToGoal(goal.id, value);
                      setDeposits((current) => ({ ...current, [goal.id]: "" }));
                      toast.success(t.goalUpdated);
                    }}
                  >
                    <Input
                      inputMode="decimal"
                      placeholder={t.addToGoal}
                      className="h-10 rounded-xl"
                      value={deposits[goal.id] ?? ""}
                      onChange={(event) =>
                        setDeposits((current) => ({
                          ...current,
                          [goal.id]: event.target.value,
                        }))
                      }
                    />
                    <Button type="submit" className="h-10 rounded-xl">
                      {t.ok}
                    </Button>
                  </form>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

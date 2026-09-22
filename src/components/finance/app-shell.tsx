"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { BottomNav } from "@/components/finance/bottom-nav";
import { FinanceProvider, useFinance } from "@/components/finance/finance-context";
import { LanguageScreen } from "@/components/finance/language-screen";
import { TransactionForm } from "@/components/finance/transaction-form";
import type { Transaction } from "@/lib/types";

type ShellTx = {
  edit: (tx: Transaction) => void;
  add: (opts?: { fromTodayNorm?: boolean }) => void;
};

const ShellTxContext = createContext<ShellTx>({
  edit: () => {},
  add: () => {},
});

export function useEditTransaction() {
  return useContext(ShellTxContext).edit;
}

export function useAddTransaction() {
  return useContext(ShellTxContext).add;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <FinanceProvider>
      <AppShellInner>{children}</AppShellInner>
    </FinanceProvider>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { ready, state } = useFinance();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [fromTodayNorm, setFromTodayNorm] = useState(false);
  const needsSetup = ready && !state.setupComplete;

  useEffect(() => {
    const boot = document.getElementById("dostatok-boot");
    if (boot) boot.hidden = true;
  }, []);

  useEffect(() => {
    if (state.locale) {
      document.documentElement.lang = state.locale;
    }
  }, [state.locale]);

  function openNew(opts?: { fromTodayNorm?: boolean }) {
    setEditing(null);
    setFromTodayNorm(opts?.fromTodayNorm === true);
    setOpen(true);
  }

  function openEdit(tx: Transaction) {
    setFromTodayNorm(false);
    setEditing(tx);
    setOpen(true);
  }

  return (
    <div className="flex min-h-dvh justify-center bg-[#120f0c]">
      <div className="flex min-h-dvh w-full max-w-md flex-col border-x border-amber-200/10 bg-background shadow-[0_0_90px_rgba(212,175,110,0.12)]">
        {needsSetup ? (
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
            <LanguageScreen />
          </main>
        ) : (
          <>
            <TransactionForm
              key={`${editing?.id ?? "new"}-${fromTodayNorm ? "today" : "plain"}-${open ? "open" : "closed"}`}
              open={open}
              initial={editing}
              fromTodayNorm={fromTodayNorm}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) {
                  setEditing(null);
                  setFromTodayNorm(false);
                }
              }}
            />
            <ShellTxContext.Provider value={{ edit: openEdit, add: openNew }}>
              <main className="min-h-0 flex-1 overflow-y-auto px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
                {children}
              </main>
            </ShellTxContext.Provider>
            <BottomNav onAdd={() => openNew()} />
          </>
        )}
      </div>
    </div>
  );
}

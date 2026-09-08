"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { BottomNav } from "@/components/finance/bottom-nav";
import { FinanceProvider, useFinance } from "@/components/finance/finance-context";
import { LanguageScreen } from "@/components/finance/language-screen";
import { TransactionForm } from "@/components/finance/transaction-form";
import type { Transaction } from "@/lib/types";

const EditContext = createContext<(tx: Transaction) => void>(() => {});

export function useEditTransaction() {
  return useContext(EditContext);
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
  const needsLanguage = ready && !state.locale;

  useEffect(() => {
    if (state.locale) {
      document.documentElement.lang = state.locale;
    }
  }, [state.locale]);

  function openNew() {
    setEditing(null);
    setOpen(true);
  }

  function openEdit(tx: Transaction) {
    setEditing(tx);
    setOpen(true);
  }

  return (
    <div className="flex min-h-svh justify-center bg-zinc-950">
      <div className="flex min-h-svh w-full max-w-md flex-col border-x border-white/5 bg-background shadow-[0_0_80px_rgba(16,185,129,0.08)]">
        {needsLanguage ? (
          <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <LanguageScreen />
          </main>
        ) : (
          <>
            <TransactionForm
              key={editing?.id ?? "new"}
              open={open}
              initial={editing}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) setEditing(null);
              }}
            />
            <EditContext.Provider value={openEdit}>
              <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
                {children}
              </main>
            </EditContext.Provider>
            <BottomNav onAdd={openNew} />
          </>
        )}
      </div>
    </div>
  );
}

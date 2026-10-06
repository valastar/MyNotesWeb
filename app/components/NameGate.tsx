"use client";
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function NameGate({ onSubmit }: { onSubmit: (n: string) => void }) {
  const [value, setValue] = useState("");

  const submit = () => value.trim() && onSubmit(value);

  return (
    <main className="min-h-screen grid place-items-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-semibold tracking-tight">My Note</h1>
        <p className="mt-2 text-[var(--muted)]">¿Cómo te llamas?</p>

        <div className="mt-8 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 focus-within:border-[var(--accent)] transition-colors">
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Tu nombre"
            className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-[var(--muted)]"
          />
          <button
            onClick={submit}
            disabled={!value.trim()}
            className="rounded-lg bg-[var(--accent)] p-2 text-black disabled:opacity-30 transition-opacity"
            aria-label="Entrar"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useClases } from "@/lib/useClases";

export default function ClasesPage() {
  const { clases, ready, agregar, borrar } = useClases();
  const [nombre, setNombre] = useState("");

  const crear = () => {
    if (!nombre.trim()) return;
    agregar(nombre);
    setNombre("");
  };

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} /> Inicio
      </Link>

      <h1 className="mt-6 text-3xl font-semibold tracking-tight">Clases</h1>
      <p className="mt-2 text-[var(--muted)]">Todas tus materias en un solo lugar.</p>

      <div className="mt-8 flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 focus-within:border-[var(--accent)] transition-colors">
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && crear()}
          placeholder="Nueva clase (ej. Cálculo Diferencial)"
          className="flex-1 bg-transparent px-3 py-2 outline-none placeholder:text-[var(--muted)]"
        />
        <button
          onClick={crear}
          disabled={!nombre.trim()}
          className="rounded-lg bg-[var(--accent)] p-2 text-black disabled:opacity-30 transition-opacity"
          aria-label="Agregar clase"
        >
          <Plus size={18} />
        </button>
      </div>

      {clases.length === 0 ? (
        <p className="mt-10 text-center text-[var(--muted)]">Aún no tienes clases. Crea la primera arriba.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {clases.map((c) => (
            <div key={c.id} className="group relative">
              <Link
                href={`/clases/${c.id}`}
                className="block rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
              >
                <span className="block h-2 w-8 rounded-full" style={{ background: c.color }} />
                <h3 className="mt-4 font-medium">{c.nombre}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">Notas · PDFs · Fotos · Audios</p>
              </Link>
              <button
                onClick={() => borrar(c.id)}
                className="absolute right-3 top-3 rounded-md p-1.5 text-[var(--muted)] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                aria-label="Borrar clase"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
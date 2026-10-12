"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useNotas } from "@/lib/useNotas";

type Props = { scope: string; base: string; backHref: string; backLabel: string; titulo: string };

const preview = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);

export default function NotasList({ scope, base, backHref, backLabel, titulo }: Props) {
  const router = useRouter();
  const { notas, ready, crear, borrar } = useNotas(scope);

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
        <button
        onClick={async () => {
            const id = await crear();
            if (id) router.push(`${base}/${id}`);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-black"
        >
        <Plus size={16} /> Nueva nota
        </button>
      </div>

      {notas.length === 0 ? (
        <p className="mt-16 text-center text-[var(--muted)]">Aún no hay notas. Crea la primera.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {notas.map((n) => (
            <div key={n.id} className="group relative">
              <Link
                href={`${base}/${n.id}`}
                className="block rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 pr-12 transition hover:bg-[var(--surface-hover)]"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="truncate font-medium">{n.titulo || "Sin título"}</h3>
                  <span className="shrink-0 text-xs text-[var(--muted)]">
                    {new Date(n.actualizada).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-[var(--muted)]">{preview(n.contenido) || "Nota vacía"}</p>
              </Link>
              <button
                onClick={() => borrar(n.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[var(--muted)] opacity-0 transition hover:text-red-400 group-hover:opacity-100"
                aria-label="Borrar nota"
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
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, FileType, Image, Mic } from "lucide-react";
import { useClases } from "@/lib/useClases";

const carpetas = [
  { slug: "notas", titulo: "Notas", icon: FileText },
  { slug: "pdfs", titulo: "PDFs", icon: FileType },
  { slug: "fotos", titulo: "Fotos", icon: Image },
  { slug: "audios", titulo: "Audios", icon: Mic },
];

export default function ClasePage() {
  const { id } = useParams<{ id: string }>();
  const { clases, ready } = useClases();
  const clase = clases.find((c) => c.id === id);

  if (!ready) return null;
  if (!clase) {
    return (
      <main className="p-10 text-[var(--muted)]">
        Clase no encontrada. <Link href="/clases" className="underline">Volver</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/clases" className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} /> Clases
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-3 w-3 rounded-full" style={{ background: clase.color }} />
        <h1 className="text-3xl font-semibold tracking-tight">{clase.nombre}</h1>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {carpetas.map(({ slug, titulo, icon: Icon }) => (
          <Link
            key={slug}
            href={`/clases/${id}/${slug}`}
            className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
          >
            <Icon size={22} className="text-[var(--accent)]" />
            <h3 className="mt-4 font-medium">{titulo}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">0 elementos</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
"use client";
import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Trash2, Upload } from "lucide-react";
import { useArchivos, type Archivo } from "@/lib/useArchivos";

export type Tipo = "pdfs" | "fotos" | "audios";

const config: Record<Tipo, { titulo: string; accept: string; vacio: string }> = {
  pdfs: { titulo: "PDFs", accept: "application/pdf", vacio: "Aún no hay PDFs." },
  fotos: { titulo: "Fotos", accept: "image/*", vacio: "Aún no hay fotos." },
  audios: { titulo: "Audios", accept: "audio/*", vacio: "Aún no hay audios." },
};

const peso = (b: number) =>
  b > 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`;

export default function ArchivosFolder({ claseId, tipo }: { claseId: string; tipo: Tipo }) {
  const { titulo, accept, vacio } = config[tipo];
  const { archivos, ready, subiendo, subir, borrar } = useArchivos(claseId, tipo);
  const input = useRef<HTMLInputElement>(null);

  if (!ready) return null;

  const botonBorrar = (a: Archivo, clase = "") => (
    <button
      onClick={() => borrar(a)}
      className={`rounded-md p-1.5 text-[var(--muted)] transition hover:text-red-400 ${clase}`}
      aria-label="Borrar"
    >
      <Trash2 size={16} />
    </button>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href={`/clases/${claseId}`} className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} /> Clase
      </Link>

      <div className="mt-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{titulo}</h1>
        <button
          onClick={() => input.current?.click()}
          disabled={subiendo}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-black disabled:opacity-50"
        >
          <Upload size={16} /> {subiendo ? "Subiendo…" : "Subir"}
        </button>
        <input
          ref={input}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            if (files.length) subir(files);
            e.target.value = "";
          }}
        />
      </div>

      {archivos.length === 0 ? (
        <p className="mt-16 text-center text-[var(--muted)]">{vacio}</p>
      ) : tipo === "fotos" ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {archivos.map((a) => (
            <div key={a.id} className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <a href={a.url} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.nombre} className="aspect-square w-full object-cover" />
              </a>
              {botonBorrar(a, "absolute right-2 top-2 bg-black/60 opacity-0 group-hover:opacity-100")}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {archivos.map((a) => (
            <div key={a.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-3">
                <FileText size={20} className="shrink-0 text-[var(--accent)]" />
                {tipo === "pdfs" ? (
                  <a href={a.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-medium hover:underline">
                    {a.nombre}
                  </a>
                ) : (
                  <span className="min-w-0 flex-1 truncate font-medium">{a.nombre}</span>
                )}
                <span className="shrink-0 text-xs text-[var(--muted)]">{peso(a.tamano)}</span>
                {botonBorrar(a)}
              </div>
              {tipo === "audios" && <audio controls src={a.url} className="mt-3 w-full" />}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
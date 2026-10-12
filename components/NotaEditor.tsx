"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { ArrowLeft, Bold, Italic, Heading1, Heading2, List, ListOrdered } from "lucide-react";
import { useNotas, type Nota } from "@/lib/useNotas";

type Props = { scope: string; notaId: string; backHref: string };

export default function NotaEditor({ scope, notaId, backHref }: Props) {
  const { notas, ready, actualizar } = useNotas(scope);
  const nota = notas.find((n) => n.id === notaId);

  if (!ready) return null;
  if (!nota) {
    return (
      <main className="p-10 text-[var(--muted)]">
        Nota no encontrada. <Link href={backHref} className="underline">Volver</Link>
      </main>
    );
  }
  return <Editor nota={nota} backHref={backHref} onChange={(c) => actualizar(notaId, c)} />;
}

function Editor({
  nota,
  backHref,
  onChange,
}: {
  nota: Nota;
  backHref: string;
  onChange: (c: { titulo?: string; contenido?: string }) => void;
}) {
  const [titulo, setTitulo] = useState(nota.titulo);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guardarConRetraso = (c: { titulo?: string; contenido?: string }) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(c), 400);
  };

  const editor = useEditor({
    extensions: [StarterKit, Placeholder.configure({ placeholder: "Empieza a escribir…" })],
    content: nota.contenido,
    immediatelyRender: false,
    onUpdate: ({ editor }) => guardarConRetraso({ contenido: editor.getHTML() }),
  });

  const btn = (activo: boolean) =>
    `rounded-md p-2 transition ${activo ? "bg-[var(--surface-hover)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)]">
        <ArrowLeft size={16} /> Notas
      </Link>

      <input
        value={titulo}
        onChange={(e) => {
          setTitulo(e.target.value);
          guardarConRetraso({ titulo: e.target.value });
        }}
        placeholder="Sin título"
        className="mt-6 w-full bg-transparent text-4xl font-semibold tracking-tight outline-none placeholder:text-[var(--border)]"
      />

      {editor && (
        <div className="mt-6 flex gap-1 border-b border-[var(--border)] pb-2">
          <button className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></button>
          <button className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></button>
          <button className={btn(editor.isActive("heading", { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 size={16} /></button>
          <button className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></button>
          <button className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></button>
          <button className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></button>
        </div>
      )}

      <div className="mt-6">
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}
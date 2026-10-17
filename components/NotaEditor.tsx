"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import {
  useEditor,
  EditorContent,
  type Editor as TipTapEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { FontSize } from "./fontSize";
import {
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ImagePlus,
  Sigma,
  ScanText,
  Braces,
  TableIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AArrowUp,
  AArrowDown,
} from "lucide-react";
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";
import { leerTexto } from "@/lib/ocr";
import { Llave } from "./llaves";
import { useNotas, type Nota } from "@/lib/useNotas";

type Props = { scope: string; notaId: string; backHref: string };

const SIMBOLOS: Record<string, string[]> = {
  Cálculo: [
    "√",
    "∛",
    "∜",
    "∫",
    "∬",
    "∮",
    "∂",
    "∇",
    "∑",
    "∏",
    "∞",
    "Δ",
    "′",
    "″",
    "→",
    "≈",
  ],
  Álgebra: [
    "²",
    "³",
    "ⁿ",
    "₁",
    "₂",
    "ₙ",
    "±",
    "×",
    "÷",
    "≠",
    "≤",
    "≥",
    "≡",
    "∝",
    "½",
    "π",
    "θ",
    "α",
    "β",
    "γ",
    "λ",
    "μ",
    "σ",
    "φ",
    "ω",
  ],
  "Mate discretas": [
    "∈",
    "∉",
    "⊂",
    "⊆",
    "⊃",
    "⊇",
    "∪",
    "∩",
    "∅",
    "∀",
    "∃",
    "¬",
    "∧",
    "∨",
    "⇒",
    "⇔",
    "⊕",
    "ℕ",
    "ℤ",
    "ℚ",
    "ℝ",
    "ℂ",
    "∴",
    "∵",
  ],
  Figuras: [
    "○",
    "●",
    "□",
    "■",
    "△",
    "▲",
    "◇",
    "★",
    "☆",
    "←",
    "→",
    "↑",
    "↓",
    "↔",
    "⇐",
    "⇒",
    "⇔",
    "↦",
    "✓",
    "✗",
  ],
};

// Reduce la imagen para no inflar la base de datos
function comprimir(file: File, max = 1000): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * k;
      c.height = img.height * k;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/jpeg", 0.8));
    };
    img.src = url;
  });
}

export default function NotaEditor({ scope, notaId, backHref }: Props) {
  const { notas, ready, actualizar } = useNotas(scope);
  const nota = notas.find((n) => n.id === notaId);

  if (!ready) return null;
  if (!nota) {
    return (
      <main className="p-10 text-[var(--muted)]">
        Nota no encontrada.{" "}
        <Link href={backHref} className="underline">
          Volver
        </Link>
      </main>
    );
  }
  return (
    <Editor
      nota={nota}
      backHref={backHref}
      onChange={(c) => actualizar(notaId, c)}
    />
  );
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
  const [panel, setPanel] = useState(false);
  const [grupo, setGrupo] = useState("Cálculo");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const inputFoto = useRef<HTMLInputElement>(null);
  const [leyendo, setLeyendo] = useState(false);

  const guardarConRetraso = (c: { titulo?: string; contenido?: string }) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(c), 400);
  };

  const importarFoto = async (file: File) => {
    if (!editor) return;
    setLeyendo(true);
    try {
      const texto = await leerTexto(file);
      if (!texto) return alert("No se detectó texto en la foto.");
      const html = texto
        .split(/\n+/)
        .map((l) => `<p>${l.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</p>`)
        .join("");
      editor.chain().focus().insertContent(html).run();
    } catch {
      alert("No se pudo leer la foto.");
    } finally {
      setLeyendo(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph", "llaveLabel"] }),
      Image.configure({ HTMLAttributes: { class: "nota-img" } }),
      Placeholder.configure({ placeholder: "Empieza a escribir…" }),
      Llave,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: nota.contenido,
    immediatelyRender: false,
    onUpdate: ({ editor }) =>
      guardarConRetraso({ contenido: editor.getHTML() }),
  });

  const subirImagen = async (file?: File) => {
    if (!file || !editor) return;
    const src = await comprimir(file);
    editor.chain().focus().setImage({ src }).run();
  };

  const CAMBIAR_TAM = (e: TipTapEditor, delta: number) => {
    const actual =
      parseInt(e.getAttributes("textStyle").fontSize ?? "16", 10) || 16;
    const nuevo = Math.min(48, Math.max(10, actual + delta));
    e.chain()
      .focus()
      .setMark("textStyle", { fontSize: `${nuevo}px` })
      .run();
  };

  const btn = (activo: boolean) =>
    `rounded-md p-2 transition ${activo ? "bg-[var(--surface-hover)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`;

  // onMouseDown + preventDefault evita que el editor pierda el foco
  const tool = (
    activo: boolean,
    fn: (e: TipTapEditor) => void,
    icon: React.ReactNode,
    label: string,
  ) => (
    <button
      type="button"
      aria-label={label}
      className={btn(activo)}
      onMouseDown={(e) => {
        e.preventDefault();
        if (editor) fn(editor);
      }}
    >
      {icon}
    </button>
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--text)]"
      >
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
        <div className="sticky top-0 z-10 mt-6 bg-[var(--bg)] pb-2">
          <div className="flex flex-wrap gap-1 border-b border-[var(--border)] pb-2">
            {tool(
              editor.isActive("bold"),
              (e) => e.chain().focus().toggleBold().run(),
              <Bold size={16} />,
              "Negritas",
            )}
            {tool(
              editor.isActive("italic"),
              (e) => e.chain().focus().toggleItalic().run(),
              <Italic size={16} />,
              "Cursiva",
            )}
            {tool(
              editor.isActive("underline"),
              (e) => e.chain().focus().toggleUnderline().run(),
              <Underline size={16} />,
              "Subrayado",
            )}
            {tool(
              editor.isActive("strike"),
              (e) => e.chain().focus().toggleStrike().run(),
              <Strikethrough size={16} />,
              "Tachado",
            )}
            {tool(
              false,
              (e) => CAMBIAR_TAM(e, -2),
              <AArrowDown size={16} />,
              "Reducir texto",
            )}
            {tool(
              false,
              (e) => CAMBIAR_TAM(e, 2),
              <AArrowUp size={16} />,
              "Aumentar texto",
            )}

            {tool(
              editor.isActive({ textAlign: "left" }),
              (e) => e.chain().focus().setTextAlign("left").run(),
              <AlignLeft size={16} />,
              "Alinear a la izquierda",
            )}
            {tool(
              editor.isActive({ textAlign: "center" }),
              (e) => e.chain().focus().setTextAlign("center").run(),
              <AlignCenter size={16} />,
              "Centrar",
            )}
            {tool(
              editor.isActive({ textAlign: "right" }),
              (e) => e.chain().focus().setTextAlign("right").run(),
              <AlignRight size={16} />,
              "Alinear a la derecha",
            )}
            {tool(
              editor.isActive("heading", { level: 1 }),
              (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
              <Heading1 size={16} />,
              "Título 1",
            )}
            {tool(
              editor.isActive("heading", { level: 2 }),
              (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
              <Heading2 size={16} />,
              "Título 2",
            )}
            {tool(
              editor.isActive("bulletList"),
              (e) => e.chain().focus().toggleBulletList().run(),
              <List size={16} />,
              "Lista",
            )}
            {tool(
              editor.isActive("orderedList"),
              (e) => e.chain().focus().toggleOrderedList().run(),
              <ListOrdered size={16} />,
              "Lista numerada",
            )}

            {tool(
              editor.isActive("table"),
              (e) =>
                e
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run(),
              <TableIcon size={16} />,
              "Tabla",
            )}

            {editor.isActive("table") && (
              <div className="mt-2 flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2 text-sm">
                {[
                  [
                    "+ Fila arriba",
                    (e: TipTapEditor) => e.chain().focus().addRowBefore().run(),
                  ],
                  [
                    "+ Fila abajo",
                    (e: TipTapEditor) => e.chain().focus().addRowAfter().run(),
                  ],
                  [
                    "+ Columna izq.",
                    (e: TipTapEditor) =>
                      e.chain().focus().addColumnBefore().run(),
                  ],
                  [
                    "+ Columna der.",
                    (e: TipTapEditor) =>
                      e.chain().focus().addColumnAfter().run(),
                  ],
                  [
                    "− Fila",
                    (e: TipTapEditor) => e.chain().focus().deleteRow().run(),
                  ],
                  [
                    "− Columna",
                    (e: TipTapEditor) => e.chain().focus().deleteColumn().run(),
                  ],
                  [
                    "Borrar tabla",
                    (e: TipTapEditor) => e.chain().focus().deleteTable().run(),
                  ],
                ].map(([label, fn]) => (
                  <button
                    key={label as string}
                    type="button"
                    onMouseDown={(ev) => {
                      ev.preventDefault();
                      (fn as (e: TipTapEditor) => void)(editor);
                    }}
                    className={`rounded-md px-2 py-1 hover:bg-[var(--surface-hover)] ${
                      label === "Borrar tabla"
                        ? "text-red-400"
                        : "text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {label as string}
                  </button>
                ))}
              </div>
            )}

            {tool(
              editor.isActive("llave"),
              (e) => e.chain().focus().toggleLlave().run(),
              <Braces size={16} />,
              "Llave",
            )}

            <button
              className={btn(false)}
              onClick={() => inputFoto.current?.click()}
              disabled={leyendo}
              title="Foto a texto"
            >
              <ScanText size={16} />
            </button>
            {leyendo && (
              <span className="ml-2 self-center text-xs text-[var(--muted)]">
                Leyendo…
              </span>
            )}
            <input
              ref={inputFoto}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importarFoto(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              aria-label="Imagen"
              className={btn(false)}
              onMouseDown={(e) => {
                e.preventDefault();
                fileInput.current?.click();
              }}
            >
              <ImagePlus size={16} />
            </button>
            {tool(
              panel,
              () => setPanel((p) => !p),
              <Sigma size={16} />,
              "Símbolos",
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                subirImagen(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {panel && (
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <div className="flex flex-wrap gap-1 text-sm">
                {Object.keys(SIMBOLOS).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setGrupo(g);
                    }}
                    className={`rounded-md px-2 py-1 ${g === grupo ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-8 gap-1 sm:grid-cols-10">
                {SIMBOLOS[grupo].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      editor.chain().focus().insertContent(s).run();
                    }}
                    className="rounded-md py-1.5 text-lg hover:bg-[var(--surface-hover)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <EditorContent editor={editor} />
      </div>
    </main>
  );
}

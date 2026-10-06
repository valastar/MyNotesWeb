import Link from "next/link";
import { Zap, CalendarDays, GraduationCap, BookOpen } from "lucide-react";

const items = [
  { href: "/notas", title: "Notas rápidas", desc: "Conceptos de examen y apuntes al vuelo", icon: Zap },
  { href: "/calendario", title: "Calendario", desc: "Exámenes, entregas y pendientes", icon: CalendarDays },
  { href: "/clases", title: "Clases", desc: "Notas, PDFs, fotos y audios por materia", icon: GraduationCap },
  { href: "/libros", title: "Libros", desc: "Tus PDFs de libros en un solo lugar", icon: BookOpen },
];

export default function HomeGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ href, title, desc, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-0.5 hover:bg-[var(--surface-hover)]"
        >
          <Icon size={22} className="text-[var(--accent)]" />
          <h3 className="mt-4 font-medium">{title}</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{desc}</p>
        </Link>
      ))}
    </div>
  );
}
import NotasList from "@/components/NotasList";

export default function Page() {
  return <NotasList scope="rapidas" base="/notas" backHref="/" backLabel="Inicio" titulo="Notas rápidas" />;
}
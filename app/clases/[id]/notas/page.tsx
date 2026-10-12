"use client";
import { useParams } from "next/navigation";
import NotasList from "@/components/NotasList";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  return (
    <NotasList scope={id} base={`/clases/${id}/notas`} backHref={`/clases/${id}`} backLabel="Clase" titulo="Notas" />
  );
}
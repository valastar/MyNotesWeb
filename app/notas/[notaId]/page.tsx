"use client";
import { useParams } from "next/navigation";
import NotaEditor from "@/components/NotaEditor";

export default function Page() {
  const { notaId } = useParams<{ notaId: string }>();
  return <NotaEditor scope="rapidas" notaId={notaId} backHref="/notas" />;
}
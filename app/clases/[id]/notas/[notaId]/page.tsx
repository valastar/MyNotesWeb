"use client";
import { useParams } from "next/navigation";
import NotaEditor from "@/components/NotaEditor";

export default function Page() {
  const { id, notaId } = useParams<{ id: string; notaId: string }>();
  return <NotaEditor scope={id} notaId={notaId} backHref={`/clases/${id}/notas`} />;
}
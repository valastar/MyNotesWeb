"use client";
import { useParams, notFound } from "next/navigation";
import ArchivosFolder, { type Tipo } from "@/components/ArchivosFolder";

const validas = ["pdfs", "fotos", "audios"];

export default function CarpetaPage() {
  const { id, carpeta } = useParams<{ id: string; carpeta: string }>();
  if (!validas.includes(carpeta)) notFound();
  return <ArchivosFolder claseId={id} tipo={carpeta as Tipo} />;
}
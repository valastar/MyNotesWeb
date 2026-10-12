"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Clase = { id: string; nombre: string; color: string };

const COLORES = ["#d97757", "#6a9bcc", "#788c5d", "#c586c0", "#d4a72c", "#4db6ac"];

export function useClases() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase
      .from("clases")
      .select("id,nombre,color")
      .order("created_at")
      .then(({ data }) => {
        setClases(data ?? []);
        setReady(true);
      });
  }, []);

  const agregar = async (nombre: string) => {
    const color = COLORES[clases.length % COLORES.length];
    const { data } = await supabase
      .from("clases")
      .insert({ nombre: nombre.trim(), color })
      .select("id,nombre,color")
      .single();
    if (data) setClases((c) => [...c, data]);
  };

  const borrar = async (id: string) => {
    await supabase.from("clases").delete().eq("id", id);
    setClases((c) => c.filter((x) => x.id !== id));
  };

  return { clases, ready, agregar, borrar };
}
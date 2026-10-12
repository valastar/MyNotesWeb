"use client";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type Archivo = {
  id: string;
  nombre: string;
  path: string;
  tamano: number;
  url: string; // URL firmada temporal
};

export function useArchivos(claseId: string, carpeta: string) {
  const [archivos, setArchivos] = useState<Archivo[]>([]);
  const [ready, setReady] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  const conUrls = async (filas: Omit<Archivo, "url">[]): Promise<Archivo[]> => {
    if (filas.length === 0) return [];
    const { data } = await supabase.storage
      .from("archivos")
      .createSignedUrls(filas.map((f) => f.path), 3600);
    return filas.map((f, i) => ({ ...f, url: data?.[i]?.signedUrl ?? "" }));
  };

  useEffect(() => {
    supabase
      .from("archivos")
      .select("id,nombre,path,tamano")
      .eq("clase_id", claseId)
      .eq("carpeta", carpeta)
      .order("created_at", { ascending: false })
      .then(async ({ data }) => {
        setArchivos(await conUrls(data ?? []));
        setReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claseId, carpeta]);

  const subir = async (files: File[]) => {
    setSubiendo(true);
    const { data: sesion } = await supabase.auth.getSession();
    const userId = sesion.session?.user.id;
    if (!userId) return setSubiendo(false);

    const nuevos: Omit<Archivo, "url">[] = [];
    for (const file of files) {
      const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
      const path = `${userId}/${claseId}/${carpeta}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage.from("archivos").upload(path, file);
      if (error) {
        alert(`No se pudo subir ${file.name}: ${error.message}`);
        continue;
      }
      const { data } = await supabase
        .from("archivos")
        .insert({ clase_id: claseId, carpeta, nombre: file.name, path, tamano: file.size })
        .select("id,nombre,path,tamano")
        .single();
      if (data) nuevos.push(data);
    }
    setArchivos((prev) => [...prev]); // evita parpadeos mientras se firman las URLs
    const conUrl = await conUrls(nuevos);
    setArchivos((prev) => [...conUrl, ...prev]);
    setSubiendo(false);
  };

  const borrar = async (a: Archivo) => {
    await supabase.storage.from("archivos").remove([a.path]);
    await supabase.from("archivos").delete().eq("id", a.id);
    setArchivos((prev) => prev.filter((x) => x.id !== a.id));
  };

  return { archivos, ready, subiendo, subir, borrar };
}
import { supabase } from "./supabase";

async function reducir(file: File, max = 1800): Promise<string> {
  const bmp = await createImageBitmap(file);
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * escala);
  canvas.height = Math.round(bmp.height * escala);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export async function leerTexto(file: File): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const image = await reducir(file);

  const res = await fetch("/api/ocr", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
    body: JSON.stringify({ image }),
  });
  if (!res.ok) throw new Error("OCR falló");
  const { texto } = await res.json();
  return (texto as string).trim();
}

import { createClient } from "@supabase/supabase-js";

const MODELO = "gemini-3.8-flash";

const PROMPT = `Transcribe fielmente todo el texto de esta imagen (puede ser letra a mano).
Reglas:
- Escribe en español, respetando saltos de línea y el orden de lectura.
- Las fórmulas y símbolos matemáticos escríbelos con símbolos Unicode (∈, ∉, ≠, ≤, ≥, →, ⊆, ∪, ∩, ∀, ∃, √, ², ³, x₁, x₂, f(x₁) = f(x₂), etc.), sin LaTeX.
- Si una palabra es ilegible, escribe [ilegible].
- Devuelve SOLO la transcripción, sin comentarios ni explicaciones.`;

const MAX_INTENTOS = 3;

export async function POST(req: Request) {
  try {
    // 1. Verificar variables de entorno
    const apiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!apiKey) {
      return Response.json(
        {
          error:
            "Falta GEMINI_API_KEY en .env.local. Reinicia npm run dev.",
        },
        { status: 500 },
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "Faltan las variables de entorno de Supabase." },
        { status: 500 },
      );
    }

    // 2. Verificar sesión de Supabase
    const token = req.headers
      .get("authorization")
      ?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return Response.json(
        { error: "No autorizado" },
        { status: 401 },
      );
    }

    const sb = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await sb.auth.getUser(token);

    if (error || !data.user) {
      return Response.json(
        { error: "No autorizado" },
        { status: 401 },
      );
    }

    // 3. Obtener y validar la imagen
    const { image } = (await req.json()) as {
      image?: string;
    };

    if (!image || typeof image !== "string") {
      return Response.json(
        { error: "Falta la imagen." },
        { status: 400 },
      );
    }

    const partes = image.match(
      /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i,
    );

    if (!partes) {
      return Response.json(
        { error: "Imagen inválida o formato no compatible." },
        { status: 400 },
      );
    }

    const mimeType = partes[1].toLowerCase();
    const base64 = partes[2];

    // 4. Llamar a Gemini con reintentos automáticos
    let r: Response | undefined;

    for (let intento = 0; intento < MAX_INTENTOS; intento++) {
      r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: PROMPT },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      // Si Gemini responde correctamente, continuar
      if (r.ok) {
        break;
      }

      const reintentable = [429, 500, 503].includes(r.status);

      // No reintentar errores permanentes o si ya no quedan intentos
      if (!reintentable || intento === MAX_INTENTOS - 1) {
        const detalle = await r.text();

        console.error("Gemini error:", r.status, detalle);

        return Response.json(
          { error: `Gemini ${r.status}: ${detalle}` },
          { status: r.status === 429 ? 429 : 502 },
        );
      }

      // Esperar 1 segundo y luego 2 segundos
      const espera = 1000 * 2 ** intento;

      console.warn(
        `Gemini respondió ${r.status}. Reintento ${
          intento + 1
        }/${MAX_INTENTOS - 1} en ${espera / 1000}s.`,
      );

      await new Promise((resolve) => setTimeout(resolve, espera));
    }

    if (!r?.ok) {
      return Response.json(
        { error: "Gemini no está disponible temporalmente." },
        { status: 502 },
      );
    }

    // 5. Extraer la transcripción
    const json = await r.json();

    const texto = (json.candidates?.[0]?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join("\n");

    if (!texto.trim()) {
      console.error(
        "Gemini no devolvió texto:",
        JSON.stringify(json),
      );

      return Response.json(
        { error: "Gemini no devolvió ninguna transcripción." },
        { status: 502 },
      );
    }

    // 6. Devolver resultado
    return Response.json({ texto });
  } catch (e) {
    console.error("OCR route error:", e);

    return Response.json(
      { error: "Error interno al procesar la imagen." },
      { status: 500 },
    );
  }
}

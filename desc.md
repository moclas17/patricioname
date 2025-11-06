
# 🧩 Proyecto: Editor de fotos “Saco Naranja” en Next.js

> **Objetivo**  
> Construir una app con **Next.js (App Router + TypeScript)** que permita subir una foto y devolverla editada **solo** con: **saco/blazer naranja**, **camisa blanca** y **corbata negra**, **sin modificar nada más** (rostro, expresión, piel, cabello, manos, fondo, iluminación, encuadre).

---

## 🏗️ Requisitos

- Next.js 14 (App Router), React 18, TypeScript.
- SDK oficial de OpenAI (`openai`).
- Endpoint **POST** `/api/edit` que reciba `multipart/form-data` con `image`.
- Lógica de edición con `images.edits` y modelo `gpt-image-1`.
- UI con formulario, vista previa de original y editada, y manejo de errores/cargando.
- Resolución por defecto `1024x1024`.  
- **No alterar** nada fuera de la vestimenta.

---

## 📁 Estructura

```
next-saco-form/
├─ .env.local
├─ package.json
├─ next.config.js
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx
│  └─ api/
│     └─ edit/route.ts
└─ lib/
   └─ prompt.ts
```

---

## 📦 `package.json`

```json
{
  "name": "next-saco-form",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000"
  },
  "dependencies": {
    "next": "14",
    "react": "18",
    "react-dom": "18",
    "openai": "^4.60.0"
  }
}
```

---

## 🔐 `.env.local`

```
OPENAI_API_KEY=TU_API_KEY_AQUI
```

---

## ⚙️ `next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: { remotePatterns: [] },
  experimental: { serverActions: { bodySizeLimit: "20mb" } } // ayuda con imágenes grandes
};
module.exports = nextConfig;
```

---

## 🧠 Prompt reutilizable — `lib/prompt.ts`

```ts
export const promptEdicion = `
Agregar a la persona de la imagen un saco/blazer naranja, camisa blanca y corbata negra.
No modificar nada más: rostro, expresión, piel, cabello, manos, fondo, iluminación, encuadre y proporciones deben quedar idénticos.
El blazer debe verse realista (solapas, costuras, textura y caída natural) y respetar oclusiones con accesorios.
Corbata negra con nudo simple, centrada. La salida debe ser fotorealista y consistente con la luz de la escena.
`;
```

---

## 🛠️ API de edición — `app/api/edit/route.ts`

```ts
import OpenAI from "openai";
import { NextResponse } from "next/server";
import { promptEdicion } from "@/lib/prompt";

export const runtime = "nodejs"; // evitar edge para base64/binarios

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const image = form.get("image");

    if (!(image instanceof Blob)) {
      return NextResponse.json({ error: "Falta el archivo 'image'" }, { status: 400 });
    }
    // El SDK espera un nombre
    // @ts-ignore
    image.name = (image as any).name || "input.png";

    const result = await client.images.edits({
      model: "gpt-image-1",
      image,
      prompt: promptEdicion,
      size: "1024x1024",
      n: 1
    });

    const b64 = result.data[0].b64_json!;
    const buf = Buffer.from(b64, "base64");

    return new NextResponse(buf, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" }
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message || "Error procesando la imagen" },
      { status: 500 }
    );
  }
}
```

---

## 🧱 Layout — `app/layout.tsx`

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
```

---

## 🖼️ Formulario + Previews — `app/page.tsx`

```tsx
"use client";

import { useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [orig, setOrig] = useState<string>("");
  const [edited, setEdited] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  const onPick = (f: File) => {
    setFile(f);
    setOrig(URL.createObjectURL(f));
    setEdited("");
    setErr("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setErr("");
    setEdited("");

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await fetch("/api/edit", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setEdited(URL.createObjectURL(blob));
    } catch (e: any) {
      setErr(e?.message || "Error al editar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 960, margin: "32px auto", padding: 16 }}>
      <h1>Agregar saco naranja + camisa blanca + corbata negra</h1>
      <p>Solo se modifica la vestimenta. El resto queda intacto.</p>

      <form onSubmit={submit} style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
          required
        />
        <button
          type="submit"
          disabled={!file || loading}
          style={{
            background: "#f46b08",
            color: "#fff",
            padding: "12px 16px",
            border: 0,
            borderRadius: 10,
            cursor: !file || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Generando..." : "Generar imagen editada"}
        </button>
      </form>

      {err && <p style={{ color: "crimson" }}>{err}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3>Original</h3>
          {orig && <img src={orig} alt="original" style={{ width: "100%", borderRadius: 8 }} />}
        </div>
        <div>
          <h3>Editada</h3>
          {edited && <img src={edited} alt="editada" style={{ width: "100%", borderRadius: 8 }} />}
        </div>
      </div>
    </main>
  );
}
```

---

## ▶️ Ejecución

```bash
npm i
npm run dev
# abrir http://localhost:3000
```

---

## ✅ Criterios de aceptación

- [ ] Subo una imagen y obtengo una **previsualización** inmediata (“Original”).  
- [ ] Al enviar, veo **“Generando…”** y luego aparece la **imagen editada** (“Editada”).  
- [ ] La salida presenta **saco naranja, camisa blanca y corbata negra** con buen encaje.  
- [ ] **No** se altera rostro, expresión, piel, cabello, manos, fondo ni iluminación.  
- [ ] Errores de red/clave se muestran de forma clara.

---

## 🧪 Extras (opcionales)

- **Máscara**: permitir `mask` (PNG con **blanco** en zonas a editar y **negro** en lo demás) para proteger rostro/fondo.  
- **Descargar PNG**: botón que convoque `URL.revokeObjectURL` al limpiar.  
- **Arrastrar y soltar**: `onDrop/onDragOver` para UX más fluida.  
- **Size parametrizable**: selector `512/1024/2048`.

---

## 🔒 Notas

- Mantén la API Key en `.env.local`.  
- El runtime **nodejs** es necesario para manejar `Blob`/`Buffer` de imágenes.  
- Si el modelo altera algo que no debe, reforzar el `promptEdicion` o usar **máscara**.

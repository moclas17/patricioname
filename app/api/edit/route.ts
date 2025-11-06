import OpenAI from "openai";
import { NextResponse } from "next/server";
import { promptEdicion } from "@/lib/prompt";
import { toFile } from "openai/uploads";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta configurar OPENAI_API_KEY en el entorno del servidor." },
        { status: 500 }
      );
    }

    const client = new OpenAI({ apiKey });
    const form = await req.formData();
    const image = form.get("image");

    if (!(image instanceof Blob)) {
      return NextResponse.json({ error: "Falta el archivo 'image'" }, { status: 400 });
    }

    const filename =
      image instanceof File && typeof image.name === "string" && image.name.trim().length > 0
        ? image.name
        : "input.png";

    const uploadFile = await toFile(image, filename, {
      type: image.type || "image/png"
    });

    const result = await client.images.edit({
      model: "gpt-image-1",
      image: uploadFile,
      prompt: promptEdicion,
      size: "1024x1024",
      n: 1
    });

    if (!result.data || !result.data[0]?.b64_json) {
      throw new Error("No se recibió imagen editada de OpenAI");
    }

    const b64 = result.data[0].b64_json;
    const buffer = Buffer.from(b64, "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store"
      }
    });
  } catch (error: any) {
    console.error("Error en /api/edit:", error);
    if (error?.response) {
      console.error("Respuesta de OpenAI:", error.response?.data || error.response);
    }
    const apiMessage =
      error?.response?.data?.error?.message ||
      error?.error?.message ||
      error?.message ||
      "Error procesando la imagen";
    return NextResponse.json(
      { error: apiMessage },
      { status: 500 }
    );
  }
}

"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [editedUrl, setEditedUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Limpiar URLs de objetos cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (editedUrl) URL.revokeObjectURL(editedUrl);
    };
  }, [originalUrl, editedUrl]);

  const handlePick = async (picked: File) => {
    // Limpiar URL anterior antes de crear una nueva
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (editedUrl) URL.revokeObjectURL(editedUrl);

    setFile(picked);
    setOriginalUrl(URL.createObjectURL(picked));
    setEditedUrl("");
    setError("");

    await processImage(picked);
  };

  const processImage = async (imageFile: File) => {
    setLoading(true);
    setError("");

    if (editedUrl) {
      URL.revokeObjectURL(editedUrl);
      setEditedUrl("");
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch("/api/edit", { method: "POST", body: formData });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message);
      }
      const blob = await response.blob();
      setEditedUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      setError(err?.message || "Error al editar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        maxWidth: 960,
        margin: "32px auto",
        padding: 16,
        display: "grid",
        gap: 24
      }}
    >
      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          textAlign: "center"
        }}
      >
        <h1 style={{ fontSize: "2.5rem", lineHeight: 1.1 }}>POAPtricioname</h1>
        <p
          style={{
            fontSize: "1.1rem",
            color: "var(--foreground)",
            opacity: 0.8,
            maxWidth: 640,
            margin: "0 auto"
          }}
        >
          Miniapp para llevar el estilo de Patrcio de POAP a tus fotos
        </p>
      </header>

      <form style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          required
          disabled={loading}
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              handlePick(selected);
            }
          }}
        />
      </form>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3>Original</h3>
          {originalUrl && (
            <img src={originalUrl} alt="original" style={{ width: "100%", borderRadius: 8 }} />
          )}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}
        >
          <h3>Editada</h3>
          {loading && (
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: "100%",
                aspectRatio: "1",
                borderRadius: 8,
                border: "2px dashed rgba(244, 107, 8, 0.4)",
                background: "rgba(244, 107, 8, 0.05)"
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  border: "6px solid rgba(244, 107, 8, 0.2)",
                  borderTopColor: "#f46b08",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}
              />
            </div>
          )}
          {!loading && editedUrl && (
            <img src={editedUrl} alt="editada" style={{ width: "100%", borderRadius: 8 }} />
          )}
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";

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

  const handlePick = (picked: File) => {
    // Limpiar URL anterior antes de crear una nueva
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (editedUrl) URL.revokeObjectURL(editedUrl);

    setFile(picked);
    setOriginalUrl(URL.createObjectURL(picked));
    setEditedUrl("");
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);
    setError("");

    // Limpiar URL editada anterior antes de crear una nueva
    if (editedUrl) {
      URL.revokeObjectURL(editedUrl);
      setEditedUrl("");
    }

    const formData = new FormData();
    formData.append("image", file);

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
    <main style={{ maxWidth: 960, margin: "32px auto", padding: 16 }}>
      <h1>Agregar saco naranja + camisa blanca + corbata negra</h1>
      <p>Solo se modifica la vestimenta. El resto queda intacto.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (selected) {
              handlePick(selected);
            }
          }}
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

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <h3>Original</h3>
          {originalUrl && (
            <img src={originalUrl} alt="original" style={{ width: "100%", borderRadius: 8 }} />
          )}
        </div>
        <div>
          <h3>Editada</h3>
          {editedUrl && (
            <img src={editedUrl} alt="editada" style={{ width: "100%", borderRadius: 8 }} />
          )}
        </div>
      </div>
    </main>
  );
}

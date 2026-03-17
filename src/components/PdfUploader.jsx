import { useState } from "react";
import api from "../api/axios";

const MAX_SIZE = 3 * 1024 * 1024;

export default function PdfUploader() {

  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);

  const validateAndSet = (selected) => {
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF");
      return;
    }
    if (selected.size > MAX_SIZE) {
      alert("El archivo supera los 3MB");
      return;
    }
    setFile(selected);
  };

  const handleFileChange = (e) => {
    validateAndSet(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) {
      alert("Selecciona un archivo");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/api/presentations/pdf", formData);
      alert("PDF enviado correctamente");
      setFile(null);
    } catch (error) {
      console.error(error);
      alert("Error subiendo el archivo");
    }
  };

  return (
    <div>
      <label
        className={`pdf-dropzone ${dragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="pdf-icon">📄</div>
        <div className="pdf-text">
          Arrastra tu archivo PDF aquí o haz clic para seleccionarlo
        </div>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          hidden
        />
      </label>

      {file && <div className="file-name">{file.name}</div>}

      <button className="generate-btn" onClick={handleSubmit}>
        Generar Presentación
      </button>
    </div>
  );
}
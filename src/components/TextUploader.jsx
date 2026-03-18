import { useState } from "react";
import api from "../api/axios";

const MAX_CHAR = 20000;

export default function TextUploader() {

  const [text, setText] = useState("");

  const handleSubmit = async () => {

    if (!text.trim()) {
      alert("Debes escribir algún texto");
      return;
    }

    try {

      const res = await api.post("/api/presentations/text", {
        text: text
      });

      console.log(res.data);

      alert("Texto enviado correctamente");

      setText("");

    } catch (error) {

      console.error(error);
      alert("Error enviando el texto");

    }
  };

  return (
    <div className="text-uploader">

      <textarea
        placeholder="Escribe el contenido de tu presentación aquí..."
        value={text}
        maxLength={MAX_CHAR}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="char-counter">
        {text.length}/{MAX_CHAR}
      </div>

      <button className="generate-btn" onClick={handleSubmit}>
        Generar Presentación
      </button>

    </div>
  );
}
import React, { useState } from "react";
import "./SolicitudReceta.css";

const coberturas = [
  "AMEBPBA", "DASUTEN", "JERARQUICOS SALUD", "OSAPM", "OSPEPBA", "FUNDACION COMEI",
  "OSPJN", "AMFFA", "SADAIC", "OSETYA", "OPDEA", "CASA",
  "CAJA DE SEGURIDAD SOCIAL PARA ESCRIBANOS DE LA PROVINCIA DE BUENOS AIRES",
  "CAJA NOTARIAL COMPLEMENTARIA DE SEGURIDAD SOCIAL", "OSA", "CONFERENCIA EPISCOPAL ARGENTINA",
  "DASMI", "MOA", "SANCOR SALUD", "OSDE", "IOMA", "SWISS MEDICAL", "PAMI", "MEDIFÉ"
];

const especialidades = [
  "Clínica Médica",
  "Cirugía General",
  "Cardiología",
  "Diabetología",
  "Dermatología",
  "Endocrinología",
  "Gastroenterología",
  "Ginecología y Obstetricia",
  "Hepatología",
  "Nefrología",
  "Neurología",
  "Traumatología",
  "Urología",
];

const Turnos: React.FC<{ userData?: any }> = ({ userData }) => {
  const [obraSocial, setObraSocial] = useState("");
  const [obraSocialOtro, setObraSocialOtro] = useState("");
  const [nroAfiliado, setNroAfiliado] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [especialidadOtra, setEspecialidadOtra] = useState("");
  const [ordenMedica, setOrdenMedica] = useState<File | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const puedeEnviar =
    (obraSocial && obraSocial !== "Otro" || obraSocialOtro) &&
    nroAfiliado &&
    (especialidad && especialidad !== "Otro" || especialidadOtra) &&
    ordenMedica;

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) {
      setMensaje("Por favor, completa todos los campos obligatorios.");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("nombrePaciente", userData?.nombre ?? "");
      formData.append("apellidoPaciente", userData?.apellido ?? "");
      formData.append("dniPaciente", userData?.dni ?? "");
      formData.append("emailPaciente", userData?.email ?? "");
      formData.append("obraSocial", obraSocial === "Otro" ? obraSocialOtro : obraSocial);
      formData.append("nroAfiliado", nroAfiliado);
      formData.append("especialidad", especialidad === "Otro" ? especialidadOtra : especialidad);
      if (ordenMedica) formData.append("ordenMedica", ordenMedica);

      const response = await fetch("https://backend-recetas-38uj.onrender.com/enviar-turno", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setMensaje(
          "SU SOLICITUD HA SIDO ENVIADA CORRECTAMENTE!\nSERA CONTACTADO MEDIANTE EL CORREO ELECTRONICO DECLARADO CON LAS FECHAS Y HORARIOS DISPONIBLES DEL PROFESIONAL SELECCIONADO."
        );
        setObraSocial("");
        setObraSocialOtro("");
        setNroAfiliado("");
        setEspecialidad("");
        setEspecialidadOtra("");
        setOrdenMedica(null);
      } else {
        setMensaje("Error al enviar la solicitud. Intenta nuevamente.");
      }
    } catch (err) {
      setMensaje("Error de conexión. Intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: "url('/obrasociales.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {mensaje && (
        <div className="alert-custom">
          {mensaje.split("\n").map((line, i) => (
            <span key={i}>{line}</span>
          ))}
          <button onClick={() => setMensaje(null)} className="alert-close">X</button>
        </div>
      )}
      <form className="solicitud-form" onSubmit={handleEnviar}>
        <h2 style={{ color: "#fff", fontWeight: "bold", marginBottom: 18 }}>Solicitud de Turno Médico</h2>
        <div className="solicitud-row">
          <select
            value={obraSocial}
            onChange={e => setObraSocial(e.target.value)}
            required
            className="solicitud-input"
          >
            <option value="">Selecciona tu cobertura</option>
            {coberturas.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Otro">Otro</option>
          </select>
          {obraSocial === "Otro" && (
            <input
              type="text"
              placeholder="Especifica tu cobertura"
              value={obraSocialOtro}
              onChange={e => setObraSocialOtro(e.target.value)}
              className="solicitud-input"
              required
            />
          )}
          <input
            type="text"
            placeholder="N° de afiliado"
            value={nroAfiliado}
            onChange={e => setNroAfiliado(e.target.value)}
            required
            className="solicitud-input"
          />
        </div>
        <div className="solicitud-row">
          <select
            value={especialidad}
            onChange={e => setEspecialidad(e.target.value)}
            required
            className="solicitud-input"
          >
            <option value="">Especialidad</option>
            {especialidades.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
            <option value="Otro">Otro</option>
          </select>
          {especialidad === "Otro" && (
            <input
              type="text"
              placeholder="Especifica especialidad"
              value={especialidadOtra}
              onChange={e => setEspecialidadOtra(e.target.value)}
              className="solicitud-input"
              required
            />
          )}
        </div>
        <div className="solicitud-row">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={e => setOrdenMedica(e.target.files?.[0] ?? null)}
            required
            className="solicitud-input"
            style={{ background: "#fff", padding: "10px" }}
          />
        </div>
        <button type="submit" className="solicitud-btn" disabled={isLoading}>
          {isLoading ? "Solicitando..." : "Solicitar turno"}
        </button>
      </form>
    </div>
  );
};

export default Turnos;
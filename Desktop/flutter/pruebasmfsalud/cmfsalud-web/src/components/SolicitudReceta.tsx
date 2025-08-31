import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../firebase"; // Ajusta la ruta según tu proyecto
import "./SolicitudReceta.css";

const formasFarmaceuticas = [
  "COMPRIMIDOS", "JARABE/TONICO", "TABLETAS", "SOBRES", "CAPSULAS", "CREMA",
  "UNGUENTO", "SUSPENSION", "AMPOLLA", "SOLUCION", "GOTAS", "EMULSION",
  "FRASCO AMPOLLA", "LANCETAS"
];

interface MedicamentoFirestore {
  nombreGenerico: string;
  nombreComercial: string;
  dosis: string;
}

interface MedicamentoForm {
  nombreGenerico: string;
  nombreGenericoOtro?: string;
  nombreComercial: string;
  nombreComercialOtro?: string;
  dosis: string;
  dosisOtro?: string;
  formaFarmaceutica: string;
  formaFarmaceuticaOtro?: string;
  requerimientoMensual: string;
}

const SolicitudReceta: React.FC<{ userData?: any }> = ({ userData }) => {
  const [medicamentosFirestore, setMedicamentosFirestore] = useState<MedicamentoFirestore[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoForm[]>([
    {
      nombreGenerico: "",
      nombreGenericoOtro: "",
      nombreComercial: "",
      nombreComercialOtro: "",
      dosis: "",
      dosisOtro: "",
      formaFarmaceutica: "",
      formaFarmaceuticaOtro: "",
      requerimientoMensual: ""
    }
  ]);
  const [observaciones, setObservaciones] = useState("");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // --- FETCH DESDE FIRESTORE ---
  useEffect(() => {
    const fetchMedicamentos = async () => {
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "medicamentos"));
      const lista: MedicamentoFirestore[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        lista.push({
          nombreGenerico: data.nombreGenerico,
          nombreComercial: data.nombreComercial,
          dosis: data.dosis
        });
      });
      setMedicamentosFirestore(lista);
    };
    fetchMedicamentos();
  }, []);
  // --- FIN FETCH ---

  // Obtiene lista de genéricos ordenados
  const nombresGenericos = [
    ...Array.from(new Set(medicamentosFirestore.map(m => m.nombreGenerico))).sort(),
    "Otro (especificar)"
  ];

  // Obtiene lista de comerciales según genérico
  const getNombresComerciales = (nombreGenerico: string) => {
    if (!nombreGenerico || nombreGenerico === "Otro (especificar)") return ["Otro (especificar)"];
    const comerciales = medicamentosFirestore
      .filter(m => m.nombreGenerico === nombreGenerico)
      .map(m => m.nombreComercial);
    return [...Array.from(new Set(comerciales)).sort(), "Otro (especificar)"];
  };

  // Obtiene lista de dosis según genérico y comercial
  const getDosis = (nombreGenerico: string, nombreComercial: string) => {
    if (!nombreGenerico || !nombreComercial || nombreComercial === "Otro (especificar)") return ["Otro (especificar)"];
    const dosis = medicamentosFirestore
      .filter(m => m.nombreGenerico === nombreGenerico && m.nombreComercial === nombreComercial)
      .map(m => m.dosis);
    return [...Array.from(new Set(dosis)).sort(), "Otro (especificar)"];
  };

  // Formas farmacéuticas ordenadas + otro
  const formasFarmaceuticasOrdenadas = [...formasFarmaceuticas].sort();
  formasFarmaceuticasOrdenadas.push("Otro (especificar)");

  const handleMedicamentoChange = (index: number, field: keyof MedicamentoForm, value: string) => {
    const nuevos = [...medicamentos];
    nuevos[index][field] = value;
    setMedicamentos(nuevos);
  };

  const agregarMedicamento = () => {
    setMedicamentos([...medicamentos, {
      nombreGenerico: "",
      nombreGenericoOtro: "",
      nombreComercial: "",
      nombreComercialOtro: "",
      dosis: "",
      dosisOtro: "",
      formaFarmaceutica: "",
      formaFarmaceuticaOtro: "",
      requerimientoMensual: ""
    }]);
  };

  const quitarMedicamento = (index: number) => {
    if (medicamentos.length === 1) return;
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const puedeEnviar = medicamentos.every(m =>
    (m.nombreGenerico && (m.nombreGenerico !== "Otro (especificar)" || m.nombreGenericoOtro)) &&
    (m.nombreComercial && (m.nombreComercial !== "Otro (especificar)" || m.nombreComercialOtro)) &&
    (m.dosis && (m.dosis !== "Otro (especificar)" || m.dosisOtro)) &&
    (m.formaFarmaceutica && (m.formaFarmaceutica !== "Otro (especificar)" || m.formaFarmaceuticaOtro)) &&
    m.requerimientoMensual
  );

  const handleEnviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puedeEnviar) {
      setMensaje("Por favor, completa todos los campos de cada medicamento.");
      return;
    }
    setIsLoading(true);
    try {
      // Procesar medicamentos para enviar los valores correctos
      const medicamentosProcesados = medicamentos.map(med => ({
        nombreGenerico: med.nombreGenerico === "Otro (especificar)" ? med.nombreGenericoOtro : med.nombreGenerico,
        nombreComercial: med.nombreComercial === "Otro (especificar)" ? med.nombreComercialOtro : med.nombreComercial,
        dosis: med.dosis === "Otro (especificar)" ? med.dosisOtro : med.dosis,
        formaFarmaceutica: med.formaFarmaceutica === "Otro (especificar)" ? med.formaFarmaceuticaOtro : med.formaFarmaceutica,
        requerimientoMensual: med.requerimientoMensual
      }));

      const body = {
        nombrePaciente: userData?.nombre ?? "",
        apellidoPaciente: userData?.apellido ?? "",
        dniPaciente: userData?.dni ?? "",
        emailPaciente: userData?.email ?? "",
        obraSocial: userData?.obraSocial ?? "",
        nroAfiliado: userData?.nroAfiliado ?? "",
        medicamentos: medicamentosProcesados,
        observaciones,
      };
      const response = await fetch("https://backend-recetas-38uj.onrender.com/enviar-receta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        setMensaje("¡Solicitud enviada correctamente! Pronto recibirás tu receta por correo.");
        setMedicamentos([{
          nombreGenerico: "",
          nombreGenericoOtro: "",
          nombreComercial: "",
          nombreComercialOtro: "",
          dosis: "",
          dosisOtro: "",
          formaFarmaceutica: "",
          formaFarmaceuticaOtro: "",
          requerimientoMensual: ""
        }]);
        setObservaciones("");
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
    <div className="solicitud-bg">
      {mensaje && (
        <div className="alert-custom">
          {mensaje}
          <button onClick={() => setMensaje(null)} className="alert-close">X</button>
        </div>
      )}
      <form className="solicitud-form" onSubmit={handleEnviar}>
        <h2 style={{ color: "#fff", fontWeight: "bold", marginBottom: 18 }}>Solicitud de Receta Médica</h2>
        {medicamentos.map((med, idx) => (
          <div key={idx} style={{ width: "100%" }}>
            <div className="solicitud-row">
              <select
                value={med.nombreGenerico}
                onChange={e => handleMedicamentoChange(idx, "nombreGenerico", e.target.value)}
                required
                className="solicitud-input"
              >
                <option value="">Nombre genérico</option>
                {nombresGenericos.map(nombre => (
                  <option
                    key={nombre}
                    value={nombre}
                    style={nombre === "Otro (especificar)" ? { color: "#e67e22", fontWeight: "bold" } : {}}
                  >
                    {nombre}
                  </option>
                ))}
              </select>
              {med.nombreGenerico === "Otro (especificar)" && (
                <input
                  type="text"
                  placeholder="Especifica el nombre genérico"
                  value={med.nombreGenericoOtro}
                  onChange={e => handleMedicamentoChange(idx, "nombreGenericoOtro", e.target.value)}
                  required
                  className="solicitud-input"
                />
              )}
            </div>
            <div className="solicitud-row">
              <select
                value={med.nombreComercial}
                onChange={e => handleMedicamentoChange(idx, "nombreComercial", e.target.value)}
                required
                className="solicitud-input"
                disabled={!med.nombreGenerico}
              >
                <option value="">Nombre comercial</option>
                {getNombresComerciales(med.nombreGenerico).map(nombre => (
                  <option
                    key={nombre}
                    value={nombre}
                    style={nombre === "Otro (especificar)" ? { color: "#e67e22", fontWeight: "bold" } : {}}
                  >
                    {nombre}
                  </option>
                ))}
              </select>
              {med.nombreComercial === "Otro (especificar)" && (
                <input
                  type="text"
                  placeholder="Especifica el nombre comercial"
                  value={med.nombreComercialOtro}
                  onChange={e => handleMedicamentoChange(idx, "nombreComercialOtro", e.target.value)}
                  required
                  className="solicitud-input"
                />
              )}
            </div>
            <div className="solicitud-row">
              <select
                value={med.dosis}
                onChange={e => handleMedicamentoChange(idx, "dosis", e.target.value)}
                required
                className="solicitud-input"
                disabled={!med.nombreComercial}
              >
                <option value="">Dosis</option>
                {getDosis(med.nombreGenerico, med.nombreComercial).map(dosis => (
                  <option
                    key={dosis}
                    value={dosis}
                    style={dosis === "Otro (especificar)" ? { color: "#e67e22", fontWeight: "bold" } : {}}
                  >
                    {dosis}
                  </option>
                ))}
              </select>
              {med.dosis === "Otro (especificar)" && (
                <input
                  type="text"
                  placeholder="Especifica la dosis"
                  value={med.dosisOtro}
                  onChange={e => handleMedicamentoChange(idx, "dosisOtro", e.target.value)}
                  required
                  className="solicitud-input"
                />
              )}
            </div>
            <div className="solicitud-row">
              <select
                value={med.formaFarmaceutica}
                onChange={e => handleMedicamentoChange(idx, "formaFarmaceutica", e.target.value)}
                required
                className="solicitud-input"
              >
                <option value="">Forma farmacéutica</option>
                {formasFarmaceuticasOrdenadas.map(forma => (
                  <option
                    key={forma}
                    value={forma}
                    style={forma === "Otro (especificar)" ? { color: "#e67e22", fontWeight: "bold" } : {}}
                  >
                    {forma}
                  </option>
                ))}
              </select>
              {med.formaFarmaceutica === "Otro (especificar)" && (
                <input
                  type="text"
                  placeholder="Especifica la forma farmacéutica"
                  value={med.formaFarmaceuticaOtro}
                  onChange={e => handleMedicamentoChange(idx, "formaFarmaceuticaOtro", e.target.value)}
                  required
                  className="solicitud-input"
                />
              )}
            </div>
            <div className="solicitud-row">
              <input
                type="number"
                min={1}
                placeholder="Requerimiento mensual"
                value={med.requerimientoMensual}
                onChange={e => handleMedicamentoChange(idx, "requerimientoMensual", e.target.value)}
                required
                className="solicitud-input"
              />
            </div>
            {medicamentos.length > 1 && (
              <div style={{ width: "100%", margin: "12px 0" }}>
                <hr style={{ border: "none", borderTop: "2px solid #222", margin: 0 }} />
              </div>
            )}
          </div>
        ))}
        <button
          type="button"
          className="solicitud-btn"
          style={{ background: "#fff", color: "#043A66", marginBottom: 12, border: "1px solid #29E7B9" }}
          onClick={agregarMedicamento}
        >
          + Agregar medicamento
        </button>
        <div className="solicitud-row">
          <textarea
            placeholder="Observaciones (opcional)"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            className="solicitud-input"
            style={{ minHeight: 60, resize: "vertical" }}
          />
        </div>
        <button type="submit" className="solicitud-btn" disabled={isLoading}>
          {isLoading ? "Solicitando..." : "Solicitar receta"}
        </button>
      </form>
    </div>
  );
};

export default SolicitudReceta;
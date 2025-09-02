import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase.ts';
import { doc, getDoc } from 'firebase/firestore';
import { API_BASE } from '../config.ts';
import './SolicitudReceta.css';

const MEDS = [
  'Aspirina','Ibuprofeno','Paracetamol','Amoxicilina','Omeprazol','Metformina',
  'Losartan','Atorvastatina','Levotiroxina','Enalapril','Simvastatina','Clonazepam',
  'Sertralina','Ranitidina','Azitromicina','Diclofenac','Prednisona','Salbutamol',
  'Furosemida','Insulina','Otro'
].sort();

interface Medicamento {
  nombreComercial: string;
  nombreComercialOtro?: string;
  dosis: string;
  formaFarmaceutica: string;
  requerimientoMensual: string;
}

interface UserData {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono?: string;
  cobertura?: string;
  numeroAfiliado?: string;
}

const SolicitudReceta: React.FC = () => {
  const [meds, setMeds] = useState<Medicamento[]>([
    { nombreComercial: '', nombreComercialOtro: '', dosis: '', formaFarmaceutica: '', requerimientoMensual: '' }
  ]);
  const [observaciones, setObservaciones] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const u = auth.currentUser;
        if (!u) return;
        // Leer del perfil guardado por Register.tsx en la colección 'users'
        const snap = await getDoc(doc(db, 'users', u.uid));
        if (snap.exists()) {
          const d = snap.data() as any;
          // Normalizar claves: admitir tanto (nombre/apellido/telefono/numeroAfiliado) como (firstName/lastName/phone/afiliado)
          const normalizado: UserData = {
            nombre: d?.nombre ?? d?.firstName ?? u.displayName?.split(' ')[0] ?? '',
            apellido: d?.apellido ?? d?.lastName ?? u.displayName?.split(' ').slice(1).join(' ') ?? '',
            dni: d?.dni ?? '',
            email: d?.email ?? u.email ?? '',
            telefono: d?.telefono ?? d?.phone ?? '',
            cobertura: d?.cobertura ?? '',
            numeroAfiliado: d?.numeroAfiliado ?? d?.afiliado ?? '',
          };
          setUser(normalizado);
        }
      } catch (e) {
        console.error('Error cargando usuario', e);
      }
    };
    cargar();
  }, []);

  const setMed = (i: number, field: keyof Medicamento, value: string) => {
    const next = [...meds];
    (next[i] as any)[field] = value;
    setMeds(next);
  };

  const addMed = () => setMeds([...meds, { nombreComercial: '', nombreComercialOtro: '', dosis: '', formaFarmaceutica: '', requerimientoMensual: '' }]);
  const removeMed = (i: number) => meds.length > 1 && setMeds(meds.filter((_, idx) => idx !== i));

  const ready = meds.every(m => m.nombreComercial && (m.nombreComercial !== 'Otro' || m.nombreComercialOtro) && m.dosis && m.formaFarmaceutica && m.requerimientoMensual);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) { setMsg('Por favor, completa todos los campos de cada medicamento.'); return; }
    setLoading(true);
    try {
      // Normalizar medicamentos: si "Otro", usar el texto ingresado
      const medicamentos = meds.map((m) => ({
        nombreComercial: m.nombreComercial === 'Otro' ? (m.nombreComercialOtro || '') : m.nombreComercial,
        dosis: m.dosis,
        formaFarmaceutica: m.formaFarmaceutica,
        requerimientoMensual: m.requerimientoMensual,
      }));

      const payload = {
        nombrePaciente: user?.nombre ?? '',
        apellidoPaciente: user?.apellido ?? '',
        dniPaciente: user?.dni ?? '',
        emailPaciente: user?.email ?? '',
        telefonoPaciente: user?.telefono ?? '',
        obraSocial: user?.cobertura ?? '',
        nroAfiliado: user?.numeroAfiliado ?? '', // coincide con backend
        medicamentos,
        observaciones,
      };

      const res = await fetch(`${API_BASE}/enviar-receta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setMsg('Solicitud enviada correctamente. Pronto recibirás tu receta por correo.');
        setMeds([{ nombreComercial: '', nombreComercialOtro: '', dosis: '', formaFarmaceutica: '', requerimientoMensual: '' }]);
        setObservaciones('');
      } else {
        setMsg('Error al enviar la solicitud. Intenta nuevamente.');
      }
    } catch (err) {
      setMsg('Error de conexión. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="solicitud-bg"
      style={{
        backgroundImage: 'linear-gradient(180deg, rgba(3,19,35,.7), rgba(4,58,102,.7)), url(/coberturas.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: 'env(safe-area-inset-top) 16px env(safe-area-inset-bottom)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
    >
      {msg && (
        <div className="alert-custom">
          {msg}
          <button className="alert-close" onClick={() => setMsg(null)}>X</button>
        </div>
      )}

      <form className="solicitud-form" onSubmit={onSubmit}>
        <h2 className="solicitud-title">Solicitud de Receta Médica</h2>

        {user && (
          <div className="user-info-compact">
            <span>{user.nombre} {user.apellido} · DNI {user.dni}</span>
            <span>{user.cobertura || 'Particular'}{user.numeroAfiliado ? ` · Afiliado ${user.numeroAfiliado}` : ''}</span>
          </div>
        )}

        {meds.map((m, i) => (
          <div key={i} style={{ width: '100%' }}>
            <div className="solicitud-row">
              <select
                value={m.nombreComercial}
                onChange={(e) => setMed(i, 'nombreComercial', e.target.value)}
                required
                className="solicitud-input"
              >
                <option value="">Nombre comercial</option>
                {MEDS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {m.nombreComercial === 'Otro' && (
                <input
                  type="text"
                  placeholder="Especifica el medicamento"
                  value={m.nombreComercialOtro}
                  onChange={(e) => setMed(i, 'nombreComercialOtro', e.target.value)}
                  required
                  className="solicitud-input"
                />
              )}
            </div>

            <div className="solicitud-row cols-3">
              <input
                type="text"
                placeholder="Dosis"
                value={m.dosis}
                onChange={(e) => setMed(i, 'dosis', e.target.value)}
                required
                className="solicitud-input"
              />
              <input
                type="text"
                placeholder="Forma farmacéutica"
                value={m.formaFarmaceutica}
                onChange={(e) => setMed(i, 'formaFarmaceutica', e.target.value)}
                required
                className="solicitud-input"
              />
              <input
                type="number"
                min={1}
                placeholder="Requerimiento mensual"
                value={m.requerimientoMensual}
                onChange={(e) => setMed(i, 'requerimientoMensual', e.target.value)}
                required
                className="solicitud-input"
              />
            </div>

            {meds.length > 1 && (
              <div style={{ width: '100%', margin: '12px 0' }}>
                <hr style={{ border: 'none', borderTop: '2px solid #0a2a45', margin: 0, opacity: .4 }} />
              </div>
            )}

            {meds.length > 1 && (
              <div className="row-end">
                <button type="button" className="solicitud-btn ghost" onClick={() => removeMed(i)}>Quitar</button>
              </div>
            )}
          </div>
        ))}

        <button type="button" className="solicitud-btn secondary" onClick={addMed}>+ Agregar medicamento</button>

        <div className="solicitud-row">
          <textarea
            placeholder="Observaciones (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            className="solicitud-input"
            style={{ minHeight: 80, resize: 'vertical' }}
          />
        </div>

        <button type="submit" className="solicitud-btn" disabled={loading}>{loading ? 'Solicitando...' : 'Solicitar receta'}</button>
      </form>
    </div>
  );
};

export default SolicitudReceta;
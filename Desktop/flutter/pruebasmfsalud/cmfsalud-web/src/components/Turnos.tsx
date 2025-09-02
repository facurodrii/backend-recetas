import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase.ts';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Turnos.css';
import { API_BASE } from '../config.ts';

interface UserData {
  nombre: string;
  apellido: string;
  dni: string;
  fechaNacimiento: string;
  telefono: string;
  cobertura: string;
  numeroAfiliado: string;
  email: string;
}

const Turnos: React.FC = () => {
  const [especialidad, setEspecialidad] = useState('');
  const [fechaPreferida, setFechaPreferida] = useState('');
  const [horarioPreferido, setHorarioPreferido] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    cargarDatosUsuario();
  }, []);

  const cargarDatosUsuario = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const especialidades = [
    'Medicina General',
    'Cardiología',
    'Dermatología',
    'Ginecología',
    'Neurología',
    'Oftalmología',
    'Pediatría',
    'Psiquiatría',
    'Traumatología',
    'Urología'
  ];

  const horariosDisponibles = [
    '08:00 - 10:00',
    '10:00 - 12:00',
    '14:00 - 16:00',
    '16:00 - 18:00',
    '18:00 - 20:00'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setMessage('Error: Usuario no autenticado');
        return;
      }

      if (!especialidad || !fechaPreferida || !horarioPreferido || !userData) {
        setMessage('Por favor, completa todos los campos obligatorios');
        return;
      }

      const payload = {
        nombrePaciente: userData.nombre,
        apellidoPaciente: userData.apellido,
        dniPaciente: userData.dni,
        emailPaciente: userData.email,
        telefonoPaciente: userData.telefono,
        obraSocial: userData.cobertura,
        numeroAfiliado: userData.numeroAfiliado || '',
        tipoConsulta: especialidad,
        fechaPreferida,
        horarioPreferido,
        comentarios
      };

      const response = await fetch(`${API_BASE}/enviar-turno`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setMessage('Solicitud de turno enviada exitosamente. Te contactaremos pronto.');
        // Limpiar formulario
        setEspecialidad('');
        setFechaPreferida('');
        setHorarioPreferido('');
        setComentarios('');
      } else {
        setMessage('Error al enviar la solicitud de turno');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al enviar la solicitud de turno');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="turnos-container">
      <nav className="navbar">
        <h1>CMF Salud</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/solicitud-receta')}>Solicitar Receta</button>
          <button onClick={() => navigate('/settings')}>Configuración</button>
          <button onClick={() => navigate('/faq')}>FAQ</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </nav>

      <div className="turnos-content">
        <h2>Solicitar Turno Médico</h2>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Especialidad médica: *</label>
            <select
              value={especialidad}
              onChange={(e) => setEspecialidad(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Selecciona una especialidad</option>
              {especialidades.map((esp) => (
                <option key={esp} value={esp}>
                  {esp}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fecha preferida: *</label>
            <input
              type="date"
              value={fechaPreferida}
              onChange={(e) => setFechaPreferida(e.target.value)}
              required
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Horario preferido: *</label>
            <select
              value={horarioPreferido}
              onChange={(e) => setHorarioPreferido(e.target.value)}
              required
              disabled={isLoading}
            >
              <option value="">Selecciona un horario</option>
              {horariosDisponibles.map((horario) => (
                <option key={horario} value={horario}>
                  {horario}
                </option>
              ))}
            </select>
          </div>

          {userData && (
            <div className="user-info">
              <h3>Datos del paciente</h3>
              <p><strong>Nombre:</strong> {userData.nombre} {userData.apellido}</p>
              <p><strong>DNI:</strong> {userData.dni}</p>
              <p><strong>Teléfono:</strong> {userData.telefono}</p>
              <p><strong>Cobertura:</strong> {userData.cobertura}</p>
              {userData.numeroAfiliado && <p><strong>N° Afiliado:</strong> {userData.numeroAfiliado}</p>}
            </div>
          )}

          <div className="form-group">
            <label>Comentarios adicionales:</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              disabled={isLoading}
              placeholder="Agrega cualquier información adicional que consideres importante"
              rows={4}
            />
          </div>

          <p className="info-text">
            * Campos obligatorios
            <br />
            Una vez enviada tu solicitud, nuestro equipo se contactará contigo para confirmar la disponibilidad y coordinar el turno.
          </p>

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando solicitud...' : 'Solicitar Turno'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Turnos;
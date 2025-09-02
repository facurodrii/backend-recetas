import React, { useState } from 'react';
import { auth } from '../firebase.ts';
import { signOut, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const user = auth.currentUser;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      if (user) {
        await updatePassword(user, newPassword);
        setMessage('Contraseña actualizada exitosamente');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      setMessage('Error al cambiar la contraseña: ' + error.message);
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
    <div className="settings-container">
      <nav className="navbar">
        <h1>CMF Salud</h1>
        <div className="nav-buttons">
          <button onClick={() => navigate('/solicitud-receta')}>Solicitar Receta</button>
          <button onClick={() => navigate('/turnos')}>Solicitar Turno</button>
          <button onClick={() => navigate('/faq')}>FAQ</button>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      </nav>

      <div className="settings-content">
        <h2>Configuración de Cuenta</h2>
        
        <div className="user-info">
          <h3>Información del Usuario</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Última conexión:</strong> {user?.metadata.lastSignInTime}</p>
        </div>

        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <div className="password-section">
          <h3>Cambiar Contraseña</h3>
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Nueva contraseña:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Ingresa tu nueva contraseña"
              />
            </div>

            <div className="form-group">
              <label>Confirmar nueva contraseña:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </div>

        <div className="app-info">
          <h3>Información de la Aplicación</h3>
          <p><strong>Versión:</strong> 1.0.0</p>
          <p><strong>Última actualización:</strong> Enero 2025</p>
          <p><strong>Soporte:</strong> contacto@cmfsalud.com</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

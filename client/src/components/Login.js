import React, { useState } from 'react';
import { useSocket } from '../contexts/SocketContext';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { connectSocket } = useSocket();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Por favor, digite um nome de usuário');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const userData = {
        userId,
        username: username.trim()
      };

      const socket = connectSocket(userData);
      
      // Aguardar conexão
      socket.on('connect', () => {
        setLoading(false);
        onLogin(userData);
      });

      socket.on('connect_error', (error) => {
        setLoading(false);
        setError('Erro ao conectar ao servidor');
        console.error('Erro de conexão:', error);
      });

    } catch (error) {
      setLoading(false);
      setError('Erro ao fazer login');
      console.error('Erro:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h1>💬 Sistema de Chat</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
          Chat em tempo real com salas privadas
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Nome de usuário:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              maxLength={50}
              disabled={loading}
              autoFocus
            />
          </div>
          
          {error && (
            <div className="error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Conectando...
              </>
            ) : (
              'Entrar no Chat'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

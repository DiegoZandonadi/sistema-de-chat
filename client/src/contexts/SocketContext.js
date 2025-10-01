import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Socket será inicializado quando o usuário fizer login
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const connectSocket = (userData) => {
    if (socket) {
      socket.disconnect();
    }

    const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: {
        userId: userData.userId,
        username: userData.username
      }
    });

    newSocket.on('connect', () => {
      console.log('Conectado ao servidor');
      setConnected(true);
      setCurrentUser(userData);
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado do servidor');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão:', error);
      setConnected(false);
    });

    setSocket(newSocket);
    return newSocket;
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setConnected(false);
      setCurrentUser(null);
    }
  };

  const value = {
    socket,
    connected,
    currentUser,
    connectSocket,
    disconnectSocket
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

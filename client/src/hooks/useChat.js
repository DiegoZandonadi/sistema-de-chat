import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { v4 as uuidv4 } from 'uuid';

export const useChat = () => {
  const { socket, currentUser } = useSocket();
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [privateRooms, setPrivateRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Conectar à sala pública
  const joinPublicRoom = useCallback(() => {
    if (!socket) return;
    
    setLoading(true);
    socket.emit('joinPublicRoom');
    
    socket.once('joinedRoom', (data) => {
      setCurrentRoom({ id: 'public', type: 'public' });
      setMessages([]);
      setLoading(false);
    });
  }, [socket]);

  // Criar sala privada
  const createPrivateRoom = useCallback((targetUserId, targetUsername) => {
    if (!socket) return;
    
    setLoading(true);
    socket.emit('createPrivateRoom', {
      targetUserId,
      targetUsername
    });
  }, [socket]);

  // Entrar em sala privada existente
  const joinPrivateRoom = useCallback((roomId) => {
    if (!socket) return;
    
    setLoading(true);
    socket.emit('joinPrivateRoom', { roomId });
  }, [socket]);

  // Enviar mensagem
  const sendMessage = useCallback((message, roomId = currentRoom?.id, type = currentRoom?.type || 'public') => {
    if (!socket || !message.trim()) return;
    
    const tempMessage = {
      id: uuidv4(),
      userId: currentUser.userId,
      username: currentUser.username,
      message: message.trim(),
      roomId,
      type,
      timestamp: new Date(),
      temp: true
    };

    // Adicionar mensagem temporária
    setMessages(prev => [...prev, tempMessage]);

    // Enviar para o servidor
    socket.emit('sendMessage', {
      roomId,
      message: message.trim(),
      type
    });
  }, [socket, currentUser, currentRoom]);

  // Editar mensagem
  const editMessage = useCallback((messageId, newMessage) => {
    if (!socket || !newMessage.trim()) return;
    
    socket.emit('editMessage', {
      messageId,
      newMessage: newMessage.trim(),
      roomId: currentRoom?.id
    });
  }, [socket, currentRoom]);

  // Deletar mensagem
  const deleteMessage = useCallback((messageId) => {
    if (!socket) return;
    
    socket.emit('deleteMessage', {
      messageId,
      roomId: currentRoom?.id
    });
  }, [socket, currentRoom]);

  // Obter usuários online
  const getOnlineUsers = useCallback(() => {
    if (!socket) return;
    
    socket.emit('getOnlineUsers');
  }, [socket]);

  // Obter salas privadas do usuário
  const getUserRooms = useCallback(() => {
    if (!socket) return;
    
    socket.emit('getUserRooms');
  }, [socket]);

  // Configurar listeners do socket
  useEffect(() => {
    if (!socket) return;

    // Nova mensagem
    socket.on('newMessage', (messageData) => {
      setMessages(prev => {
        // Remover mensagem temporária se existir
        const filtered = prev.filter(msg => msg.id !== messageData.id || !msg.temp);
        return [...filtered, messageData];
      });
    });

    // Mensagem editada
    socket.on('messageEdited', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, message: data.newMessage, edited: true, editedAt: data.editedAt }
            : msg
        )
      );
    });

    // Mensagem deletada
    socket.on('messageDeleted', (data) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, deleted: true, deletedAt: new Date() }
            : msg
        )
      );
    });

    // Histórico da sala
    socket.on('roomHistory', (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });

    // Usuários online
    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users.filter(user => user.userId !== currentUser?.userId));
    });

    // Usuário online
    socket.on('userOnline', (user) => {
      setOnlineUsers(prev => {
        if (prev.some(u => u.userId === user.userId)) {
          return prev;
        }
        return [...prev, user];
      });
    });

    // Usuário offline
    socket.on('userOffline', (user) => {
      setOnlineUsers(prev => prev.filter(u => u.userId !== user.userId));
    });

    // Sala privada criada
    socket.on('privateRoomCreated', (data) => {
      setPrivateRooms(prev => [...prev, data]);
      setCurrentRoom(data);
      setLoading(false);
    });

    // Sala privada existente
    socket.on('privateRoomExists', (data) => {
      joinPrivateRoom(data.roomId);
    });

    // Convite para sala privada
    socket.on('invitedToPrivateRoom', (data) => {
      // Atualizar lista de salas
      getUserRooms();
      
      // Opcional: mostrar notificação
      console.log(`Convite de ${data.fromUser} para sala privada`);
    });

    // Salas do usuário
    socket.on('userRooms', (rooms) => {
      setPrivateRooms(rooms);
    });

    // Entrou na sala privada
    socket.on('joinedPrivateRoom', (data) => {
      setCurrentRoom(data);
      setLoading(false);
    });

    // Erro
    socket.on('error', (errorData) => {
      setError(errorData.message);
      setLoading(false);
      console.error('Erro do servidor:', errorData.message);
    });

    // Cleanup
    return () => {
      socket.off('newMessage');
      socket.off('messageEdited');
      socket.off('messageDeleted');
      socket.off('roomHistory');
      socket.off('onlineUsers');
      socket.off('userOnline');
      socket.off('userOffline');
      socket.off('privateRoomCreated');
      socket.off('privateRoomExists');
      socket.off('invitedToPrivateRoom');
      socket.off('userRooms');
      socket.off('joinedPrivateRoom');
      socket.off('error');
    };
  }, [socket, currentUser, joinPrivateRoom, getUserRooms]);

  // Carregar dados iniciais
  useEffect(() => {
    if (socket && currentUser) {
      getOnlineUsers();
      getUserRooms();
    }
  }, [socket, currentUser, getOnlineUsers, getUserRooms]);

  // Limpar erro após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    messages,
    onlineUsers,
    privateRooms,
    currentRoom,
    loading,
    error,
    joinPublicRoom,
    createPrivateRoom,
    joinPrivateRoom,
    sendMessage,
    editMessage,
    deleteMessage,
    getOnlineUsers,
    getUserRooms,
    setCurrentRoom
  };
};

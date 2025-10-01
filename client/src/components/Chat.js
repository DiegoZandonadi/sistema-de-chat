import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useChat } from '../hooks/useChat';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const Chat = ({ currentUser, onLogout }) => {
  const { connected } = useSocket();
  const {
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
    deleteMessage
  } = useChat();

  const [roomTitle, setRoomTitle] = useState('Sala Pública');

  // Definir título da sala baseado no tipo
  useEffect(() => {
    if (currentRoom) {
      if (currentRoom.type === 'public') {
        setRoomTitle('💬 Sala Pública');
      } else if (currentRoom.type === 'private') {
        // Encontrar o outro participante
        const otherParticipant = privateRooms
          .find(room => room.id === currentRoom.id)
          ?.usernames
          ?.find(name => name !== currentUser.username);
        
        if (otherParticipant) {
          setRoomTitle(`🔒 Conversa com ${otherParticipant}`);
        } else {
          setRoomTitle('🔒 Sala Privada');
        }
      }
    }
  }, [currentRoom, privateRooms, currentUser]);

  // Entrar na sala pública por padrão
  useEffect(() => {
    if (connected && !currentRoom) {
      joinPublicRoom();
    }
  }, [connected, currentRoom, joinPublicRoom]);

  const handleSendMessage = (message) => {
    sendMessage(message);
  };

  const handleEditMessage = (messageId, newMessage) => {
    editMessage(messageId, newMessage);
  };

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Tem certeza que deseja deletar esta mensagem?')) {
      deleteMessage(messageId);
    }
  };

  const handleJoinPublicRoom = () => {
    joinPublicRoom();
  };

  const handleCreatePrivateRoom = (targetUserId, targetUsername) => {
    createPrivateRoom(targetUserId, targetUsername);
  };

  const handleJoinPrivateRoom = (roomId) => {
    joinPrivateRoom(roomId);
  };

  const getOnlineCount = () => {
    return onlineUsers.length + 1; // +1 para incluir o usuário atual
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div>
          <h1 style={{ fontSize: '1.2rem', margin: 0 }}>
            {roomTitle}
          </h1>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            {currentRoom?.type === 'public' 
              ? `${getOnlineCount()} usuário(s) online`
              : 'Conversa privada'
            }
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <div 
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: connected ? '#4caf50' : '#f44336'
              }}
            ></div>
            {connected ? 'Conectado' : 'Desconectado'}
          </div>
          
          <button
            onClick={onLogout}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="chat-main">
        {/* Sidebar */}
        <ChatSidebar
          currentUser={currentUser}
          onlineUsers={onlineUsers}
          privateRooms={privateRooms}
          currentRoom={currentRoom}
          onJoinPublicRoom={handleJoinPublicRoom}
          onCreatePrivateRoom={handleCreatePrivateRoom}
          onJoinPrivateRoom={handleJoinPrivateRoom}
        />

        {/* Área de mensagens */}
        <div className="chat-content">
          {loading && (
            <div className="loading">
              <span className="spinner"></span>
              Carregando...
            </div>
          )}

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <MessageList
                messages={messages}
                currentUser={currentUser}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
              />
              
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!connected || loading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;

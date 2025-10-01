import React from 'react';

const ChatSidebar = ({ 
  currentUser, 
  onlineUsers, 
  privateRooms, 
  currentRoom, 
  onJoinPublicRoom, 
  onCreatePrivateRoom, 
  onJoinPrivateRoom 
}) => {
  const getAvatarInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  const formatLastMessage = (lastMessage) => {
    if (!lastMessage) return 'Nenhuma mensagem';
    
    const maxLength = 30;
    if (lastMessage.message.length > maxLength) {
      return lastMessage.message.substring(0, maxLength) + '...';
    }
    return lastMessage.message;
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  return (
    <div className="chat-sidebar">
      {/* Informações do usuário */}
      <div className="user-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="user-avatar">
            {getAvatarInitials(currentUser.username)}
          </div>
          <div>
            <div className="user-name">{currentUser.username}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Online
            </div>
          </div>
        </div>
      </div>

      {/* Sala pública */}
      <div style={{ borderBottom: '1px solid #e0e0e0' }}>
        <div 
          className={`room-item ${currentRoom?.id === 'public' ? 'active' : ''}`}
          onClick={onJoinPublicRoom}
          style={{ cursor: 'pointer' }}
        >
          <div style={{ fontWeight: '500' }}>💬 Sala Pública</div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            Converse com todos os usuários online
          </div>
        </div>
      </div>

      {/* Salas privadas */}
      {privateRooms.length > 0 && (
        <div className="private-rooms">
          <h3>Salas Privadas</h3>
          <div>
            {privateRooms.map((room) => {
              const otherParticipant = room.usernames.find(name => name !== currentUser.username);
              const isActive = currentRoom?.id === room.id;
              
              return (
                <div 
                  key={room.id}
                  className={`room-item ${isActive ? 'active' : ''}`}
                  onClick={() => onJoinPrivateRoom(room.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="user-avatar" style={{ width: '24px', height: '24px', fontSize: '0.7rem' }}>
                      {getAvatarInitials(otherParticipant)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>
                        {otherParticipant}
                      </div>
                      {room.lastMessage && (
                        <div className="room-last-message">
                          <strong>{room.lastMessage.username}:</strong> {formatLastMessage(room.lastMessage)}
                        </div>
                      )}
                      {room.lastMessage && (
                        <div style={{ fontSize: '0.7rem', color: '#999', marginTop: '0.25rem' }}>
                          {formatTime(room.lastMessage.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Usuários online */}
      <div className="online-users">
        <h3>Usuários Online ({onlineUsers.length})</h3>
        <div className="user-list">
          {onlineUsers.map((user) => (
            <div 
              key={user.userId}
              className="user-item"
              onClick={() => onCreatePrivateRoom(user.userId, user.username)}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar">
                {getAvatarInitials(user.username)}
              </div>
              <div className="user-name">{user.username}</div>
              <div className="online-indicator"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;

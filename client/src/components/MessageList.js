import React, { useState, useEffect, useRef } from 'react';

const MessageList = ({ messages, currentUser, onEditMessage, onDeleteMessage }) => {
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleEditStart = (message) => {
    setEditingMessage(message.id);
    setEditText(message.message);
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== editingMessage?.message) {
      onEditMessage(editingMessage, editText.trim());
    }
    setEditingMessage(null);
    setEditText('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const isOwnMessage = (message) => {
    return message.userId === currentUser.userId;
  };

  const getAvatarInitials = (username) => {
    return username.charAt(0).toUpperCase();
  };

  if (messages.length === 0) {
    return (
      <div className="messages-container">
        <div style={{ 
          textAlign: 'center', 
          color: '#666', 
          marginTop: '2rem',
          fontSize: '1.1rem'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
          <div>Nenhuma mensagem ainda</div>
          <div style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Seja o primeiro a enviar uma mensagem!
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      {messages.map((message) => {
        if (message.deleted) {
          return (
            <div key={message.id} className="message deleted" style={{ 
              opacity: 0.5, 
              fontStyle: 'italic',
              alignSelf: isOwnMessage(message) ? 'flex-end' : 'flex-start'
            }}>
              <div className="message-content">
                Mensagem deletada
              </div>
            </div>
          );
        }

        const isOwn = isOwnMessage(message);
        
        return (
          <div key={message.id} className={`message ${isOwn ? 'own' : 'other'}`}>
            {editingMessage === message.id ? (
              <div style={{ width: '100%' }}>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                  autoFocus
                />
                <div style={{ 
                  display: 'flex', 
                  gap: '0.5rem', 
                  marginTop: '0.5rem' 
                }}>
                  <button
                    onClick={handleEditSubmit}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Salvar
                  </button>
                  <button
                    onClick={handleEditCancel}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.8rem'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="message-header">
                  {!isOwn && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="user-avatar" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>
                        {getAvatarInitials(message.username)}
                      </div>
                      <span>{message.username}</span>
                    </div>
                  )}
                </div>
                
                <div className="message-content">
                  {message.message}
                </div>
                
                <div className="message-time">
                  {formatTime(message.timestamp)}
                  {message.edited && (
                    <span style={{ marginLeft: '0.5rem', fontStyle: 'italic' }}>
                      (editado)
                    </span>
                  )}
                </div>

                {isOwn && !message.temp && (
                  <div className="message-actions">
                    <button
                      className="message-action-btn"
                      onClick={() => handleEditStart(message)}
                      title="Editar mensagem"
                    >
                      ✏️
                    </button>
                    <button
                      className="message-action-btn"
                      onClick={() => onDeleteMessage(message.id)}
                      title="Deletar mensagem"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;

import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Auto focus no input quando não está desabilitado
  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Conectando..." : "Digite sua mensagem..."}
          className="message-input"
          disabled={disabled}
          maxLength={1000}
          autoComplete="off"
        />
        <button
          type="submit"
          className="send-button"
          disabled={!message.trim() || disabled}
        >
          {disabled ? (
            <span className="spinner"></span>
          ) : (
            'Enviar'
          )}
        </button>
      </form>
      
      <div style={{ 
        fontSize: '0.7rem', 
        color: '#999', 
        marginTop: '0.5rem',
        textAlign: 'center'
      }}>
        {message.length}/1000 caracteres
        {message.length > 800 && (
          <span style={{ color: '#ff9800', marginLeft: '0.5rem' }}>
            ⚠️ Próximo do limite
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;

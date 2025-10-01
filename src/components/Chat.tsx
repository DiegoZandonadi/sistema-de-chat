'use client';

import { useState, useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '@/lib/socket';

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: string;
}

interface ChatProps {
  username: string;
}

export default function Chat({ username }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = getSocket();

  useEffect(() => {
    // Conectar ao socket
    socket.on('connect', () => {
      console.log('Conectado ao servidor');
      setIsConnected(true);
      socket.emit('joinPublicRoom');
    });

    socket.on('disconnect', () => {
      console.log('Desconectado do servidor');
      setIsConnected(false);
    });

    // Receber mensagens
    socket.on('message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Receber histórico de mensagens
    socket.on('roomMessages', (msgs: Message[]) => {
      setMessages(msgs);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('message');
      socket.off('roomMessages');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      text: newMessage,
      user: username,
    };

    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold">Sistema de Chat</h1>
        <p className="text-sm opacity-90">
          Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Nenhuma mensagem ainda. Seja o primeiro a enviar uma!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.user === username ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.user === username
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.user !== username && (
                  <div className="text-xs font-semibold mb-1 opacity-75">
                    {message.user}
                  </div>
                )}
                <div>{message.text}</div>
                <div className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}

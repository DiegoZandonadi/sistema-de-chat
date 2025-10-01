'use client';

import { useState } from 'react';
import Chat from '@/components/Chat';

export default function Home() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Sistema de Chat
          </h1>
          <p className="text-gray-600 text-center mb-6">
            Digite seu nome para entrar no chat
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Entrar no Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Chat username={username} />
    </div>
  );
}
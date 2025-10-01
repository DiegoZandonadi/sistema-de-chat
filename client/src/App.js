import React, { useState } from 'react';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <SocketProvider>
      <div className="App">
        {!currentUser ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Chat currentUser={currentUser} onLogout={handleLogout} />
        )}
      </div>
    </SocketProvider>
  );
}

export default App;

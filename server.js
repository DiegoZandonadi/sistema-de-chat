const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const redis = require('redis');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configuração do CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Configuração do Socket.IO
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Configuração do Redis
let redisClient;
let redisAvailable = false;

try {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });

  redisClient.on('error', (err) => {
    console.error('Erro no Redis:', err);
    redisAvailable = false;
  });

  redisClient.on('connect', () => {
    console.log('Conectado ao Redis');
    redisAvailable = true;
  });

  redisClient.connect().catch(() => {
    console.log('Redis não disponível - funcionando em modo memória');
    redisAvailable = false;
  });
} catch (error) {
  console.log('Redis não disponível - funcionando em modo memória');
  redisAvailable = false;
}

// Armazenamento em memória para sessões ativas
const activeUsers = new Map();
const privateRooms = new Map();
const memoryStorage = new Map(); // Fallback para quando Redis não está disponível

// Middleware para Socket.IO
io.use(async (socket, next) => {
  try {
    const userId = socket.handshake.auth.userId;
    const username = socket.handshake.auth.username;
    
    if (!userId || !username) {
      return next(new Error('Usuário não autenticado'));
    }
    
    // Verificar se o usuário já está online
    if (activeUsers.has(userId)) {
      const existingSocket = activeUsers.get(userId);
      existingSocket.disconnect(true);
    }
    
    socket.userId = userId;
    socket.username = username;
    activeUsers.set(userId, socket);
    
    next();
  } catch (error) {
    next(error);
  }
});

// Eventos do Socket.IO
io.on('connection', (socket) => {
  console.log(`Usuário conectado: ${socket.username} (${socket.userId})`);
  
  // Notificar que o usuário está online
  socket.broadcast.emit('userOnline', {
    userId: socket.userId,
    username: socket.username
  });

  // Entrar em uma sala pública
  socket.on('joinPublicRoom', () => {
    socket.join('public');
    socket.emit('joinedRoom', { room: 'public', type: 'public' });
    console.log(`${socket.username} entrou na sala pública`);
  });

  // Criar sala privada
  socket.on('createPrivateRoom', async (data) => {
    try {
      const { targetUserId, targetUsername } = data;
      const roomId = uuidv4();
      
      // Verificar se já existe uma sala entre estes usuários
      const existingRoom = await findExistingPrivateRoom(socket.userId, targetUserId);
      
      if (existingRoom) {
        socket.emit('privateRoomExists', { roomId: existingRoom });
        socket.join(existingRoom);
        return;
      }
      
      // Criar nova sala privada
      const roomData = {
        id: roomId,
        participants: [socket.userId, targetUserId],
        usernames: [socket.username, targetUsername],
        createdAt: new Date(),
        lastMessage: null
      };
      
      privateRooms.set(roomId, roomData);
      
      // Salvar no Redis
      await redisClient.hSet(`room:${roomId}`, roomData);
      await redisClient.sAdd(`user:${socket.userId}:rooms`, roomId);
      await redisClient.sAdd(`user:${targetUserId}:rooms`, roomId);
      
      // Entrar na sala
      socket.join(roomId);
      
      // Notificar o outro usuário se estiver online
      const targetSocket = activeUsers.get(targetUserId);
      if (targetSocket) {
        targetSocket.join(roomId);
        targetSocket.emit('invitedToPrivateRoom', {
          roomId,
          fromUser: socket.username,
          fromUserId: socket.userId
        });
      }
      
      socket.emit('privateRoomCreated', {
        roomId,
        participants: [socket.username, targetUsername],
        type: 'private'
      });
      
      console.log(`Sala privada criada: ${roomId} entre ${socket.username} e ${targetUsername}`);
    } catch (error) {
      console.error('Erro ao criar sala privada:', error);
      socket.emit('error', { message: 'Erro ao criar sala privada' });
    }
  });

  // Entrar em sala privada existente
  socket.on('joinPrivateRoom', async (data) => {
    try {
      const { roomId } = data;
      const roomData = privateRooms.get(roomId);
      
      if (!roomData) {
        // Tentar buscar no Redis
        const redisRoomData = await redisClient.hGetAll(`room:${roomId}`);
        if (!redisRoomData || !redisRoomData.id) {
          socket.emit('error', { message: 'Sala não encontrada' });
          return;
        }
      }
      
      socket.join(roomId);
      socket.emit('joinedPrivateRoom', { roomId, type: 'private' });
      
      // Enviar histórico de mensagens
      const messages = await getRoomMessages(roomId);
      socket.emit('roomHistory', { roomId, messages });
      
    } catch (error) {
      console.error('Erro ao entrar na sala privada:', error);
      socket.emit('error', { message: 'Erro ao entrar na sala privada' });
    }
  });

  // Enviar mensagem
  socket.on('sendMessage', async (data) => {
    try {
      const { roomId, message, type = 'public' } = data;
      
      if (!message.trim()) return;
      
      const messageData = {
        id: uuidv4(),
        userId: socket.userId,
        username: socket.username,
        message: message.trim(),
        roomId,
        type,
        timestamp: new Date(),
        edited: false,
        deleted: false
      };
      
      // Salvar mensagem no Redis
      await saveMessage(messageData);
      
      // Enviar para os participantes da sala
      io.to(roomId).emit('newMessage', messageData);
      
      // Atualizar última mensagem da sala se for privada
      if (type === 'private') {
        await updateRoomLastMessage(roomId, messageData);
      }
      
      console.log(`Mensagem enviada por ${socket.username} na sala ${roomId}: ${message}`);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      socket.emit('error', { message: 'Erro ao enviar mensagem' });
    }
  });

  // Editar mensagem
  socket.on('editMessage', async (data) => {
    try {
      const { messageId, newMessage, roomId } = data;
      
      if (!newMessage.trim()) return;
      
      // Buscar mensagem no Redis
      const messageData = await redisClient.hGetAll(`message:${messageId}`);
      
      if (!messageData || messageData.userId !== socket.userId) {
        socket.emit('error', { message: 'Mensagem não encontrada ou sem permissão' });
        return;
      }
      
      // Atualizar mensagem
      await redisClient.hSet(`message:${messageId}`, {
        ...messageData,
        message: newMessage.trim(),
        edited: true,
        editedAt: new Date()
      });
      
      // Notificar outros usuários
      io.to(roomId).emit('messageEdited', {
        messageId,
        newMessage: newMessage.trim(),
        editedAt: new Date()
      });
      
    } catch (error) {
      console.error('Erro ao editar mensagem:', error);
      socket.emit('error', { message: 'Erro ao editar mensagem' });
    }
  });

  // Deletar mensagem
  socket.on('deleteMessage', async (data) => {
    try {
      const { messageId, roomId } = data;
      
      // Buscar mensagem no Redis
      const messageData = await redisClient.hGetAll(`message:${messageId}`);
      
      if (!messageData || messageData.userId !== socket.userId) {
        socket.emit('error', { message: 'Mensagem não encontrada ou sem permissão' });
        return;
      }
      
      // Marcar como deletada
      await redisClient.hSet(`message:${messageId}`, {
        ...messageData,
        deleted: true,
        deletedAt: new Date()
      });
      
      // Notificar outros usuários
      io.to(roomId).emit('messageDeleted', { messageId });
      
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      socket.emit('error', { message: 'Erro ao deletar mensagem' });
    }
  });

  // Obter lista de usuários online
  socket.on('getOnlineUsers', () => {
    const onlineUsers = Array.from(activeUsers.values()).map(userSocket => ({
      userId: userSocket.userId,
      username: userSocket.username
    }));
    socket.emit('onlineUsers', onlineUsers);
  });

  // Obter salas privadas do usuário
  socket.on('getUserRooms', async () => {
    try {
      const userRooms = await redisClient.sMembers(`user:${socket.userId}:rooms`);
      const roomsData = [];
      
      for (const roomId of userRooms) {
        const roomData = await redisClient.hGetAll(`room:${roomId}`);
        if (roomData && roomData.id) {
          roomsData.push({
            id: roomData.id,
            participants: roomData.participants ? JSON.parse(roomData.participants) : [],
            usernames: roomData.usernames ? JSON.parse(roomData.usernames) : [],
            lastMessage: roomData.lastMessage ? JSON.parse(roomData.lastMessage) : null,
            createdAt: roomData.createdAt
          });
        }
      }
      
      socket.emit('userRooms', roomsData);
    } catch (error) {
      console.error('Erro ao obter salas do usuário:', error);
      socket.emit('error', { message: 'Erro ao obter salas' });
    }
  });

  // Desconexão
  socket.on('disconnect', () => {
    console.log(`Usuário desconectado: ${socket.username}`);
    
    // Remover usuário ativo
    activeUsers.delete(socket.userId);
    
    // Notificar outros usuários
    socket.broadcast.emit('userOffline', {
      userId: socket.userId,
      username: socket.username
    });
  });
});

// Funções auxiliares
async function findExistingPrivateRoom(userId1, userId2) {
  const user1Rooms = await redisClient.sMembers(`user:${userId1}:rooms`);
  
  for (const roomId of user1Rooms) {
    const roomData = await redisClient.hGetAll(`room:${roomId}`);
    if (roomData && roomData.participants) {
      const participants = JSON.parse(roomData.participants);
      if (participants.includes(userId2)) {
        return roomId;
      }
    }
  }
  
  return null;
}

async function saveMessage(messageData) {
  const messageKey = `message:${messageData.id}`;
  const messageToStore = {
    ...messageData,
    timestamp: messageData.timestamp.toISOString(),
    editedAt: messageData.editedAt ? messageData.editedAt.toISOString() : null,
    deletedAt: messageData.deletedAt ? messageData.deletedAt.toISOString() : null
  };
  
  if (redisAvailable && redisClient) {
    await redisClient.hSet(messageKey, messageToStore);
    await redisClient.lPush(`room:${messageData.roomId}:messages`, messageData.id);
  } else {
    // Armazenamento em memória
    memoryStorage.set(messageKey, messageToStore);
    const roomMessagesKey = `room:${messageData.roomId}:messages`;
    const existingMessages = memoryStorage.get(roomMessagesKey) || [];
    memoryStorage.set(roomMessagesKey, [messageData.id, ...existingMessages]);
  }
}

async function getRoomMessages(roomId, limit = 50) {
  let messageIds = [];
  const messages = [];
  
  if (redisAvailable && redisClient) {
    messageIds = await redisClient.lRange(`room:${roomId}:messages`, 0, limit - 1);
    
    for (const messageId of messageIds) {
      const messageData = await redisClient.hGetAll(`message:${messageId}`);
      if (messageData && messageData.id) {
        messages.push({
          ...messageData,
          timestamp: new Date(messageData.timestamp),
          editedAt: messageData.editedAt ? new Date(messageData.editedAt) : null,
          deletedAt: messageData.deletedAt ? new Date(messageData.deletedAt) : null
        });
      }
    }
  } else {
    // Armazenamento em memória
    const roomMessagesKey = `room:${roomId}:messages`;
    messageIds = memoryStorage.get(roomMessagesKey) || [];
    
    for (const messageId of messageIds.slice(0, limit)) {
      const messageData = memoryStorage.get(`message:${messageId}`);
      if (messageData && messageData.id) {
        messages.push({
          ...messageData,
          timestamp: new Date(messageData.timestamp),
          editedAt: messageData.editedAt ? new Date(messageData.editedAt) : null,
          deletedAt: messageData.deletedAt ? new Date(messageData.deletedAt) : null
        });
      }
    }
  }
  
  return messages.reverse(); // Mais recentes primeiro
}

async function updateRoomLastMessage(roomId, messageData) {
  const lastMessage = {
    id: messageData.id,
    message: messageData.message,
    username: messageData.username,
    timestamp: messageData.timestamp
  };
  
  if (redisAvailable && redisClient) {
    await redisClient.hSet(`room:${roomId}`, {
      lastMessage: JSON.stringify(lastMessage)
    });
  } else {
    // Armazenamento em memória
    const roomData = memoryStorage.get(`room:${roomId}`) || {};
    roomData.lastMessage = lastMessage;
    memoryStorage.set(`room:${roomId}`, roomData);
  }
}

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

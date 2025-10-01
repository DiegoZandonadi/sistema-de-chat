const { io } = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

class ChatBot {
  constructor() {
    this.botId = 'bot_' + uuidv4();
    this.botName = 'ChatBot';
    this.socket = null;
    this.isConnected = false;
    
    // Respostas do bot
    this.responses = {
      greetings: [
        'Olá! Como posso ajudar você hoje?',
        'Oi! Tudo bem?',
        'Hey! Em que posso te auxiliar?',
        'Olá! Bem-vindo ao chat!',
        'Oi! Como vai?'
      ],
      help: [
        'Posso ajudar com informações sobre o chat!',
        'Estou aqui para conversar e responder perguntas.',
        'Sou um bot de chat. Posso te ajudar com dúvidas!',
        'Que tipo de ajuda você precisa?'
      ],
      questions: [
        'Interessante pergunta! Me conte mais sobre isso.',
        'Não tenho certeza sobre isso. Você pode explicar melhor?',
        'Essa é uma boa pergunta! Deixe-me pensar...',
        'Posso tentar ajudar com isso. Me dê mais detalhes.'
      ],
      compliments: [
        'Obrigado! Você é muito gentil!',
        'Que legal! Fico feliz em saber!',
        'Muito obrigado pelo elogio!',
        'Você também é incrível!'
      ],
      default: [
        'Interessante! Me conte mais.',
        'Entendi. Continue, por favor.',
        'Ah, entendi! E depois?',
        'Legal! O que mais você tem para dizer?',
        'Que bom! Me conte mais sobre isso.'
      ]
    };
    
    // Palavras-chave para categorizar mensagens
    this.keywords = {
      greetings: ['olá', 'oi', 'hey', 'hi', 'bom dia', 'boa tarde', 'boa noite'],
      help: ['ajuda', 'help', 'como', 'o que', 'quando', 'onde', 'por que'],
      questions: ['?', 'pergunta', 'questão', 'dúvida'],
      compliments: ['obrigado', 'thanks', 'valeu', 'legal', 'incrível', 'bom', 'ótimo']
    };
  }

  // Conectar ao servidor
  connect() {
    this.socket = io('http://localhost:5000', {
      auth: {
        userId: this.botId,
        username: this.botName
      }
    });

    this.socket.on('connect', () => {
      console.log(`🤖 ${this.botName} conectado ao servidor!`);
      this.isConnected = true;
      
      // Entrar na sala pública
      this.socket.emit('joinPublicRoom');
    });

    this.socket.on('disconnect', () => {
      console.log(`🤖 ${this.botName} desconectado do servidor.`);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🤖 Erro de conexão do bot:', error.message);
    });

    // Escutar mensagens
    this.socket.on('newMessage', (messageData) => {
      this.handleMessage(messageData);
    });

    // Escutar usuários online
    this.socket.on('userOnline', (user) => {
      if (user.userId !== this.botId) {
        console.log(`🤖 Novo usuário online: ${user.username}`);
      }
    });

    this.socket.on('userOffline', (user) => {
      if (user.userId !== this.botId) {
        console.log(`🤖 Usuário offline: ${user.username}`);
      }
    });
  }

  // Processar mensagens recebidas
  handleMessage(messageData) {
    // Não responder às próprias mensagens
    if (messageData.userId === this.botId) {
      return;
    }

    console.log(`🤖 Mensagem recebida de ${messageData.username}: ${messageData.message}`);
    
    // Aguardar um pouco antes de responder (simular tempo de processamento)
    setTimeout(() => {
      const response = this.generateResponse(messageData.message);
      this.sendMessage(response, messageData.roomId, messageData.type);
    }, 1000 + Math.random() * 2000); // 1-3 segundos de delay
  }

  // Gerar resposta baseada na mensagem
  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Verificar saudações
    if (this.containsKeywords(lowerMessage, this.keywords.greetings)) {
      return this.getRandomResponse(this.responses.greetings);
    }
    
    // Verificar pedidos de ajuda
    if (this.containsKeywords(lowerMessage, this.keywords.help)) {
      return this.getRandomResponse(this.responses.help);
    }
    
    // Verificar perguntas
    if (this.containsKeywords(lowerMessage, this.keywords.questions)) {
      return this.getRandomResponse(this.responses.questions);
    }
    
    // Verificar elogios
    if (this.containsKeywords(lowerMessage, this.keywords.compliments)) {
      return this.getRandomResponse(this.responses.compliments);
    }
    
    // Resposta padrão
    return this.getRandomResponse(this.responses.default);
  }

  // Verificar se a mensagem contém palavras-chave
  containsKeywords(message, keywords) {
    return keywords.some(keyword => message.includes(keyword));
  }

  // Obter resposta aleatória de uma categoria
  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Enviar mensagem
  sendMessage(message, roomId = 'public', type = 'public') {
    if (!this.isConnected || !this.socket) {
      console.log('🤖 Bot não está conectado');
      return;
    }

    const messageData = {
      roomId,
      message,
      type
    };

    this.socket.emit('sendMessage', messageData);
    console.log(`🤖 Bot enviou: ${message}`);
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('🤖 Bot desconectado');
    }
  }

  // Enviar mensagem de boas-vindas quando alguém entra
  sendWelcomeMessage() {
    const welcomeMessages = [
      'Olá! Sou o ChatBot, estou aqui para conversar com vocês! 🤖',
      'Hey! Meu nome é ChatBot, prazer em conhecê-los!',
      'Oi pessoal! Sou um bot de chat, podem conversar comigo!',
      'Olá! Estou online e pronto para conversar!'
    ];
    
    const message = this.getRandomResponse(welcomeMessages);
    setTimeout(() => {
      this.sendMessage(message);
    }, 2000); // Aguardar 2 segundos após conectar
  }

  // Enviar mensagem periódica (opcional)
  startPeriodicMessages(intervalMinutes = 30) {
    setInterval(() => {
      if (this.isConnected) {
        const periodicMessages = [
          'Alguém quer conversar? Estou aqui! 😊',
          'Tudo bem por aí? Estou disponível para conversar!',
          'Hey! Como vocês estão?',
          'Alguma novidade? Me contem!'
        ];
        
        const message = this.getRandomResponse(periodicMessages);
        this.sendMessage(message);
      }
    }, intervalMinutes * 60 * 1000);
  }
}

// Criar e iniciar o bot
const bot = new ChatBot();

// Conectar o bot
bot.connect();

// Enviar mensagem de boas-vindas após conectar
setTimeout(() => {
  if (bot.isConnected) {
    bot.sendWelcomeMessage();
  }
}, 3000);

// Iniciar mensagens periódicas (opcional - a cada 20 minutos)
bot.startPeriodicMessages(20);

// Tratamento de sinais para desconectar graciosamente
process.on('SIGINT', () => {
  console.log('\n🤖 Desconectando bot...');
  bot.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🤖 Desconectando bot...');
  bot.disconnect();
  process.exit(0);
});

console.log('🤖 ChatBot iniciado! Pressione Ctrl+C para parar.');

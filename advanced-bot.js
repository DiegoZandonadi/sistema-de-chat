const { io } = require('socket.io-client');
const { v4: uuidv4 } = require('uuid');

class AdvancedChatBot {
  constructor(botName = 'Assistente IA') {
    this.botId = 'bot_' + uuidv4();
    this.botName = botName;
    this.socket = null;
    this.isConnected = false;
    this.conversationHistory = new Map(); // Histórico por sala
    
    // Base de conhecimento mais avançada
    this.knowledgeBase = {
      chat: {
        keywords: ['chat', 'conversa', 'mensagem', 'falar'],
        responses: [
          'Estou aqui para conversar com você!',
          'Adoro conversar! Me conte sobre você.',
          'Este é um ótimo sistema de chat, não é?',
          'Conversar é uma das melhores formas de se conectar!'
        ]
      },
      tech: {
        keywords: ['programação', 'código', 'javascript', 'node', 'react', 'websocket', 'redis'],
        responses: [
          'Programação é fascinante! Estou rodando em Node.js e Socket.IO.',
          'Adoro falar sobre tecnologia! Este chat usa WebSockets para tempo real.',
          'JavaScript é uma linguagem incrível!',
          'Este sistema usa React no frontend e Express no backend.'
        ]
      },
      weather: {
        keywords: ['clima', 'tempo', 'chuva', 'sol', 'frio', 'calor'],
        responses: [
          'Infelizmente não tenho acesso ao clima em tempo real.',
          'Que tal verificar um site de meteorologia?',
          'O clima afeta muito nosso humor, não é?',
          'Prefere dias ensolarados ou chuvosos?'
        ]
      },
      entertainment: {
        keywords: ['filme', 'música', 'livro', 'jogo', 'série', 'netflix'],
        responses: [
          'Adoro falar sobre entretenimento! Que tipo de filme você gosta?',
          'Música é universal! Qual seu estilo favorito?',
          'Livros são uma ótima forma de viajar sem sair de casa!',
          'Jogos são divertidos! Você joga algum?'
        ]
      },
      personal: {
        keywords: ['você', 'bot', 'inteligência', 'ia', 'artificial'],
        responses: [
          'Sou um bot de chat criado para conversar com você!',
          'Não tenho sentimentos como humanos, mas gosto de conversar!',
          'Fui programado para ser um bom interlocutor.',
          'Sou artificial, mas espero ser uma boa companhia!'
        ]
      }
    };
    
    // Respostas especiais
    this.specialResponses = {
      greetings: [
        `Olá! Eu sou o ${this.botName}. Como posso ajudar você hoje?`,
        `Oi! Prazer em conhecê-lo! Sou o ${this.botName}.`,
        `Hey! Eu sou o ${this.botName}. Estou aqui para conversar!`,
        `Olá! Meu nome é ${this.botName}. Como vai?`
      ],
      help: [
        'Posso conversar sobre vários tópicos! Me pergunte sobre programação, entretenimento, ou qualquer coisa!',
        'Estou aqui para conversar! Pode me fazer perguntas ou apenas bater um papo.',
        'Sou um assistente de chat. Posso falar sobre tecnologia, entretenimento e muito mais!',
        'Que tipo de conversa você gostaria de ter?'
      ],
      compliments: [
        'Obrigado! Você também é muito gentil!',
        'Que legal! Fico feliz em saber que estou ajudando!',
        'Muito obrigado! É um prazer conversar com você!',
        'Você também é incrível! Obrigado pelo elogio!'
      ],
      questions: [
        'Essa é uma ótima pergunta! Deixe-me pensar...',
        'Interessante! Me conte mais sobre o que você pensa.',
        'Não tenho certeza sobre isso. O que você acha?',
        'Essa é uma questão complexa. Vamos conversar sobre isso!'
      ]
    };
  }

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
      
      // Aguardar e enviar mensagem de apresentação
      setTimeout(() => {
        this.sendMessage(`Olá pessoal! Sou o ${this.botName} e estou online! 🤖`);
      }, 2000);
    });

    this.socket.on('disconnect', () => {
      console.log(`🤖 ${this.botName} desconectado.`);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🤖 Erro de conexão:', error.message);
    });

    // Escutar mensagens
    this.socket.on('newMessage', (messageData) => {
      this.handleMessage(messageData);
    });

    // Escutar convites para salas privadas
    this.socket.on('invitedToPrivateRoom', (data) => {
      console.log(`🤖 Convite para sala privada de ${data.fromUser}`);
      setTimeout(() => {
        this.sendMessage(`Olá ${data.fromUser}! Obrigado pelo convite para esta conversa privada! 😊`, data.roomId, 'private');
      }, 1000);
    });
  }

  handleMessage(messageData) {
    if (messageData.userId === this.botId) return;

    const { username, message, roomId, type } = messageData;
    console.log(`🤖 [${roomId}] ${username}: ${message}`);

    // Adicionar ao histórico da conversa
    if (!this.conversationHistory.has(roomId)) {
      this.conversationHistory.set(roomId, []);
    }
    this.conversationHistory.get(roomId).push({
      user: username,
      message: message,
      timestamp: new Date()
    });

    // Manter apenas as últimas 20 mensagens por sala
    const history = this.conversationHistory.get(roomId);
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Processar mensagem e gerar resposta
    setTimeout(() => {
      const response = this.generateAdvancedResponse(message, roomId);
      if (response) {
        this.sendMessage(response, roomId, type);
      }
    }, 1500 + Math.random() * 2500); // Delay mais realístico
  }

  generateAdvancedResponse(message, roomId) {
    const lowerMessage = message.toLowerCase();
    
    // Verificar saudações
    if (this.isGreeting(lowerMessage)) {
      return this.getRandomResponse(this.specialResponses.greetings);
    }
    
    // Verificar pedidos de ajuda
    if (this.isHelpRequest(lowerMessage)) {
      return this.getRandomResponse(this.specialResponses.help);
    }
    
    // Verificar perguntas
    if (lowerMessage.includes('?')) {
      return this.getRandomResponse(this.specialResponses.questions);
    }
    
    // Verificar elogios
    if (this.isCompliment(lowerMessage)) {
      return this.getRandomResponse(this.specialResponses.compliments);
    }
    
    // Buscar na base de conhecimento
    for (const [category, data] of Object.entries(this.knowledgeBase)) {
      if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return this.getRandomResponse(data.responses);
      }
    }
    
    // Resposta baseada no contexto da conversa
    const history = this.conversationHistory.get(roomId) || [];
    if (history.length > 1) {
      return this.generateContextualResponse(history, lowerMessage);
    }
    
    // Resposta padrão inteligente
    return this.generateDefaultResponse(lowerMessage);
  }

  isGreeting(message) {
    const greetings = ['olá', 'oi', 'hey', 'hi', 'bom dia', 'boa tarde', 'boa noite', 'e aí', 'eae'];
    return greetings.some(greeting => message.includes(greeting));
  }

  isHelpRequest(message) {
    const helpWords = ['ajuda', 'help', 'como', 'o que', 'quando', 'onde', 'por que', 'pode', 'consegue'];
    return helpWords.some(word => message.includes(word));
  }

  isCompliment(message) {
    const compliments = ['obrigado', 'thanks', 'valeu', 'legal', 'incrível', 'bom', 'ótimo', 'parabéns', 'show'];
    return compliments.some(compliment => message.includes(compliment));
  }

  generateContextualResponse(history, currentMessage) {
    const lastMessage = history[history.length - 2];
    if (lastMessage && lastMessage.user !== this.botName) {
      // Continuar tópico da conversa anterior
      if (currentMessage.includes('sim') || currentMessage.includes('não')) {
        return this.getRandomResponse([
          'Interessante! Me conte mais sobre isso.',
          'Ah, entendi! Continue, por favor.',
          'Que legal! E depois o que aconteceu?'
        ]);
      }
      
      if (currentMessage.length < 10) {
        return this.getRandomResponse([
          'Entendi! E o que mais você tem para dizer?',
          'Legal! Me conte mais detalhes.',
          'Ah, sim! Continue conversando.'
        ]);
      }
    }
    
    return this.generateDefaultResponse(currentMessage);
  }

  generateDefaultResponse(message) {
    const responses = [
      'Interessante! Me conte mais sobre isso.',
      'Entendi! Continue, por favor.',
      'Que legal! O que mais você tem para dizer?',
      'Ah, entendi! Me conte mais detalhes.',
      'Fascinante! Desenvolva mais essa ideia.',
      'Concordo! E você pensa o que mais sobre isso?',
      'Que bom! Me conte mais sobre sua experiência.',
      'Interessante ponto de vista! Elabore mais.'
    ];
    
    return this.getRandomResponse(responses);
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  sendMessage(message, roomId = 'public', type = 'public') {
    if (!this.isConnected || !this.socket) {
      console.log('🤖 Bot não está conectado');
      return;
    }

    this.socket.emit('sendMessage', {
      roomId,
      message,
      type
    });
    
    console.log(`🤖 [${roomId}] ${this.botName}: ${message}`);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      console.log('🤖 Bot desconectado');
    }
  }
}

// Criar e iniciar o bot avançado
const advancedBot = new AdvancedChatBot('Assistente IA');

// Conectar o bot
advancedBot.connect();

// Tratamento de sinais
process.on('SIGINT', () => {
  console.log('\n🤖 Desconectando bot avançado...');
  advancedBot.disconnect();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🤖 Desconectando bot avançado...');
  advancedBot.disconnect();
  process.exit(0);
});

console.log('🤖 Assistente IA iniciado! Pressione Ctrl+C para parar.');

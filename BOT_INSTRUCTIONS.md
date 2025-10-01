# 🤖 Instruções para os Bots de Chat

## 📋 Bots Disponíveis

### 1. **Bot Simples** (`bot.js`)
- Bot básico com respostas pré-definidas
- Responde a saudações, perguntas e elogios
- Envia mensagens periódicas na sala pública

### 2. **Assistente IA Avançado** (`advanced-bot.js`)
- Bot mais inteligente com base de conhecimento
- Respostas contextuais baseadas no histórico da conversa
- Conhecimento sobre programação, tecnologia, entretenimento
- Pode participar de salas privadas

## 🚀 Como Executar os Bots

### **Opção 1: Bot Simples**
```bash
# Executar sistema completo com bot simples
npm run dev-with-bot
```

### **Opção 2: Assistente IA Avançado**
```bash
# Executar sistema completo com bot avançado
npm run dev-with-advanced-bot
```

### **Opção 3: Executar apenas o bot (sistema já rodando)**
```bash
# Bot simples
npm run bot

# Bot avançado
npm run advanced-bot
```

## 💬 Como Conversar com os Bots

### **Sala Pública:**
1. Acesse `http://localhost:3000`
2. Faça login com seu nome
3. O bot estará na sala pública automaticamente
4. Digite mensagens como:
   - "Olá bot!"
   - "Como você está?"
   - "Me ajude com programação"
   - "Obrigado!"

### **Salas Privadas:**
1. Na sidebar, clique no bot (aparecerá como usuário online)
2. Uma sala privada será criada automaticamente
3. Converse diretamente com o bot

## 🎯 Comandos que os Bots Entendem

### **Saudações:**
- "Olá", "Oi", "Hey", "Hi"
- "Bom dia", "Boa tarde", "Boa noite"

### **Perguntas:**
- Qualquer mensagem com "?"
- "Como", "O que", "Quando", "Onde", "Por que"

### **Elogios:**
- "Obrigado", "Thanks", "Valeu"
- "Legal", "Incrível", "Bom", "Ótimo"

### **Tópicos Específicos (Bot Avançado):**
- **Programação:** "javascript", "node", "react", "websocket"
- **Tecnologia:** "código", "programação", "redis"
- **Entretenimento:** "filme", "música", "livro", "jogo"
- **Pessoal:** "você", "bot", "inteligência"

## 🔧 Personalizando os Bots

### **Alterar Nome do Bot:**
```javascript
// No arquivo bot.js ou advanced-bot.js
this.botName = 'SeuNomeAqui';
```

### **Adicionar Novas Respostas:**
```javascript
// No arquivo advanced-bot.js, adicione novas categorias:
this.knowledgeBase.novaCategoria = {
  keywords: ['palavra1', 'palavra2'],
  responses: [
    'Resposta 1',
    'Resposta 2',
    'Resposta 3'
  ]
};
```

### **Alterar Delay das Respostas:**
```javascript
// Alterar o tempo de resposta (em milissegundos)
setTimeout(() => {
  const response = this.generateResponse(message);
  this.sendMessage(response);
}, 2000); // 2 segundos
```

## 📊 Funcionalidades dos Bots

### **Bot Simples:**
- ✅ Respostas automáticas
- ✅ Mensagens de boas-vindas
- ✅ Mensagens periódicas
- ✅ Reconhecimento de saudações e elogios

### **Bot Avançado:**
- ✅ Todas as funcionalidades do bot simples
- ✅ Base de conhecimento expandida
- ✅ Respostas contextuais
- ✅ Histórico de conversas
- ✅ Participação em salas privadas
- ✅ Respostas mais inteligentes

## 🛠️ Solução de Problemas

### **Bot não responde:**
1. Verifique se o bot está conectado (deve aparecer no console)
2. Certifique-se de que o servidor está rodando
3. Verifique se não há erros no console

### **Bot não aparece online:**
1. Aguarde alguns segundos após iniciar
2. Recarregue a página do chat
3. Verifique se o bot se conectou (console)

### **Bot responde muito rápido/lento:**
1. Edite o arquivo do bot
2. Altere o valor do `setTimeout`
3. Reinicie o bot

## 🎮 Exemplos de Conversas

### **Com Bot Simples:**
```
Você: Olá bot!
Bot: Olá! Como posso ajudar você hoje?

Você: Como você está?
Bot: Estou aqui para conversar e responder perguntas!

Você: Obrigado!
Bot: Obrigado! Você é muito gentil!
```

### **Com Bot Avançado:**
```
Você: Olá! Você programa em JavaScript?
Bot: Programação é fascinante! Estou rodando em Node.js e Socket.IO.

Você: Que legal! Me conte sobre WebSockets.
Bot: Adoro falar sobre tecnologia! Este chat usa WebSockets para tempo real.

Você: Você assiste filmes?
Bot: Adoro falar sobre entretenimento! Que tipo de filme você gosta?
```

## 📝 Notas Importantes

- Os bots são **independentes** - você pode executar ambos simultaneamente
- Os bots **não respondem** às próprias mensagens
- As conversas são **persistentes** (se Redis estiver configurado)
- Os bots **funcionam** tanto em salas públicas quanto privadas
- Para parar um bot, use `Ctrl+C` no terminal onde está rodando

---

**Divirta-se conversando com os bots! 🤖💬**

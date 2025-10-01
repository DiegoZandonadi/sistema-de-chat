# 💬 Sistema de Chat em Tempo Real

Um sistema de chat moderno e completo construído com **Express**, **React**, **Socket.IO** e **Redis**, oferecendo salas privadas, mensagens em tempo real e uma interface intuitiva.

## 🚀 Funcionalidades

### ✨ Principais Recursos
- **Chat em tempo real** com WebSockets
- **Salas privadas** para conversas 1:1
- **Sala pública** para conversas em grupo
- **Sistema de usuários online** em tempo real
- **Persistência de mensagens** com Redis
- **Interface responsiva** e moderna
- **Edição e exclusão** de mensagens
- **Histórico de conversas** persistente

### 🎯 Recursos Técnicos
- **Backend**: Express.js + Socket.IO + Redis
- **Frontend**: React + Socket.IO Client
- **Persistência**: Redis para armazenamento
- **Tempo real**: WebSockets bidirecionais
- **Interface**: Design moderno e responsivo

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 16 ou superior)
- **npm** ou **yarn**
- **Redis** (versão 6 ou superior)

### Instalação do Redis

#### Windows:
```bash
# Usando Chocolatey
choco install redis-64

# Ou baixe diretamente do site oficial
# https://redis.io/download
```

#### macOS:
```bash
# Usando Homebrew
brew install redis

# Iniciar Redis
brew services start redis
```

#### Linux (Ubuntu/Debian):
```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd sistema-chat-websockets
```

### 2. Instalar dependências do servidor
```bash
npm install
```

### 3. Instalar dependências do cliente
```bash
cd client
npm install
cd ..
```

### 4. Configurar variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite as variáveis conforme necessário
# PORT=5000
# REDIS_URL=redis://localhost:6379
# NODE_ENV=development
```

### 5. Iniciar o Redis
Certifique-se de que o Redis está rodando:
```bash
redis-server
```

## 🚀 Execução

### Modo Desenvolvimento

#### Terminal 1 - Servidor:
```bash
npm run dev
```

#### Terminal 2 - Cliente:
```bash
npm run client
```

### Modo Produção

#### Build do cliente:
```bash
npm run build
```

#### Iniciar servidor:
```bash
npm start
```

## 📁 Estrutura do Projeto

```
sistema-chat-websockets/
├── client/                 # Frontend React
│   ├── public/            # Arquivos públicos
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (Socket)
│   │   ├── hooks/         # Hooks customizados
│   │   └── styles/        # Estilos CSS
│   └── package.json
├── server.js              # Servidor Express + Socket.IO
├── package.json           # Dependências do servidor
├── env.example            # Exemplo de variáveis de ambiente
└── README.md
```

## 🎮 Como Usar

### 1. Acesse a aplicação
- Abra seu navegador em `http://localhost:3000`

### 2. Faça login
- Digite um nome de usuário único
- Clique em "Entrar no Chat"

### 3. Use a sala pública
- Por padrão, você entra na sala pública
- Digite mensagens para conversar com todos os usuários online

### 4. Crie salas privadas
- Na barra lateral, clique em qualquer usuário online
- Uma nova sala privada será criada automaticamente
- Acesse suas salas privadas na seção "Salas Privadas"

### 5. Gerencie mensagens
- **Editar**: Passe o mouse sobre suas mensagens e clique no ícone de edição
- **Deletar**: Passe o mouse sobre suas mensagens e clique no ícone de lixeira

## 🔧 Configuração Avançada

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|---------|
| `PORT` | Porta do servidor | `5000` |
| `REDIS_URL` | URL de conexão do Redis | `redis://localhost:6379` |
| `NODE_ENV` | Ambiente de execução | `development` |

### Configuração do Redis

Para produção, configure o Redis com:
```bash
# redis.conf
bind 127.0.0.1
port 6379
requirepass sua_senha_aqui
```

E atualize a URL no `.env`:
```
REDIS_URL=redis://:sua_senha_aqui@localhost:6379
```

## 🐛 Solução de Problemas

### Redis não conecta
```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar PONG

# Verificar porta
netstat -an | grep 6379
```

### Porta já em uso
```bash
# Alterar porta no .env
PORT=5001

# Ou matar processo na porta 5000
npx kill-port 5000
```

### Erro de CORS
Verifique se as URLs estão corretas no `server.js`:
```javascript
cors: {
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000']
}
```

## 📊 Monitoramento

### Logs do Servidor
O servidor exibe logs detalhados no console:
- Conexões de usuários
- Mensagens enviadas
- Erros de conexão
- Status do Redis

### Redis CLI
```bash
# Monitorar comandos em tempo real
redis-cli monitor

# Ver chaves armazenadas
redis-cli keys "*"

# Ver informações de uma sala
redis-cli hgetall room:ID_DA_SALA
```

## 🔒 Segurança

### Produção
- Configure autenticação no Redis
- Use HTTPS em produção
- Implemente rate limiting
- Valide dados de entrada
- Configure CORS adequadamente

### Desenvolvimento
- Redis sem senha (apenas localhost)
- CORS liberado para localhost:3000
- Logs detalhados habilitados

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a seção de [Solução de Problemas](#-solução-de-problemas)
2. Consulte os logs do servidor
3. Abra uma issue no repositório

## 🎉 Próximas Funcionalidades

- [ ] Upload de arquivos e imagens
- [ ] Notificações push
- [ ] Mensagens com formatação (Markdown)
- [ ] Salas de grupo com múltiplos usuários
- [ ] Histórico de mensagens com paginação
- [ ] Temas claro/escuro
- [ ] Emojis e reações
- [ ] Mensagens de voz
- [ ] Chamadas de vídeo

---

**Desenvolvido com ❤️ usando Express, React, Socket.IO e Redis**

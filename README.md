# TalentBridge

TalentBridge é uma plataforma que conecta jovens talentos com oportunidades de emprego e estágio, facilitando a interação entre instituições de ensino, empresas e instituições contratantes.

## 🚀 Tecnologias

### Backend
- Node.js com Express
- PostgreSQL
- JWT para autenticação
- Winston para logging
- Joi para validação

### Frontend
- React com TypeScript
- React Router
- Context API
- TailwindCSS
- Axios

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm 8+

## 🔧 Instalação

### Banco de Dados
1. Instale o PostgreSQL
2. Crie um banco de dados chamado `Data1`
3. Execute o script `backend/db/init.sql` para criar as tabelas

### Backend
1. Entre no diretório `backend`:
   ```bash
   cd backend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure o arquivo `.env`:
   ```
   FRONTEND_URL=http://localhost:3000
   DB_USER=postgres
   DB_PASSWORD=1234
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=Data1
   JWT_SECRET=sua_chave_secreta
   NODE_ENV=development
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX=100
   LOG_LEVEL=info
   PORT=3001
   ```

4. Inicie o servidor:
   ```bash
   npm run dev
   ```

### Frontend
1. Entre no diretório `frontend`:
   ```bash
   cd frontend
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor:
   ```bash
   npm start
   ```

## 👥 Papéis do Sistema

1. **Instituição de Ensino**
   - Cadastra e gerencia jovens
   - Avalia desempenho dos jovens
   - Visualiza oportunidades disponíveis

2. **Chefe de Empresa**
   - Cria oportunidades de emprego/estágio
   - Avalia jovens
   - Gerencia recomendações

3. **Instituição Contratante**
   - Visualiza jovens e oportunidades
   - Gerencia recomendações
   - Acompanha desenvolvimento dos jovens

## 🔐 Segurança

- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Rate limiting para proteção contra ataques
- Validação de dados com Joi
- Proteção CORS configurável

## 📦 Estrutura do Projeto

### Backend
- `routes/`: Endpoints da API
- `middleware/`: Middlewares de autenticação e validação
- `db/`: Scripts e configurações do banco de dados
- `config/`: Configurações do sistema

### Frontend
- `src/components/`: Componentes React
- `src/pages/`: Páginas da aplicação
- `src/contexts/`: Gerenciamento de estado
- `src/services/`: Serviços de API
- `src/types/`: Definições TypeScript

## 🎨 Design System

O frontend utiliza TailwindCSS com um tema personalizado:
- Cores principais: Indigo e Sky Blue
- Fundo escuro com cards em tons de cinza
- Animações suaves para transições
- Componentes responsivos

## 📫 Contribuição

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Adiciona nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request 
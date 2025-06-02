-- =========================
-- INICIALIZAÇÃO DO BANCO DE DADOS
-- =========================

-- =========================
-- TABELAS DE REFERÊNCIA
-- =========================

-- Tabela de Categorias de Avaliação
CREATE TABLE IF NOT EXISTS categorias_avaliacao (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    peso INTEGER DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Opções do Sistema
CREATE TABLE IF NOT EXISTS opcoes_sistema (
    id SERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    ordem INT DEFAULT 0,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(categoria, valor)
);

-- =========================
-- TABELAS DE USUÁRIOS E PERFIS
-- =========================

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(100) NOT NULL,
    papel VARCHAR(30) NOT NULL, -- 'instituicao_ensino', 'chefe_empresa', 'instituicao_contratante'
    verificado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Instituições de Ensino
CREATE TABLE IF NOT EXISTS instituicoes_ensino (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'escola', 'faculdade', 'universidade', 'curso_tecnico'
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    localizacao VARCHAR(100),
    areas_ensino TEXT[], -- Array de áreas de ensino
    qtd_alunos INTEGER,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Chefes de Empresa
CREATE TABLE IF NOT EXISTS chefes_empresas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    empresa VARCHAR(150) NOT NULL,
    cargo VARCHAR(100) NOT NULL,
    setor VARCHAR(50),
    porte VARCHAR(30), -- 'pequena', 'media', 'grande'
    localizacao VARCHAR(100),
    areas_atuacao TEXT[], -- Array de áreas de atuação
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Instituições Contratantes
CREATE TABLE IF NOT EXISTS instituicoes_contratantes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'empresa', 'ong', 'governo'
    nome VARCHAR(150) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    localizacao VARCHAR(100),
    areas_interesse TEXT[], -- Array de áreas de interesse
    programas_sociais TEXT[], -- Array de programas sociais
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELAS PRINCIPAIS
-- =========================

-- Tabela de Jovens
CREATE TABLE IF NOT EXISTS jovens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    idade INTEGER,
    formacao VARCHAR(100),
    curso VARCHAR(100),
    habilidades TEXT[], -- Array de habilidades
    interesses TEXT[], -- Array de interesses
    planos_futuros TEXT,
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Oportunidades
CREATE TABLE IF NOT EXISTS oportunidades (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES chefes_empresas(id) ON DELETE CASCADE,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL, -- 'estagio', 'clt', 'pj', 'temporario', 'freelancer', 'jovem_aprendiz', 'trainee'
    area VARCHAR(50), -- Área da oportunidade
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    data_inicio DATE,
    data_fim DATE,
    requisitos TEXT[], -- Array de requisitos
    beneficios TEXT[], -- Array de benefícios
    salario VARCHAR(30),
    local VARCHAR(100),
    vagas_disponiveis INTEGER DEFAULT 1,
    vagas_preenchidas INTEGER DEFAULT 0,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico de Desenvolvimento
CREATE TABLE IF NOT EXISTS historico_desenvolvimento (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'certificacao', 'curso', 'projeto', 'conquista'
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_inicio DATE,
    data_conclusao DATE,
    instituicao VARCHAR(150),
    comprovante_url TEXT,
    validado BOOLEAN DEFAULT FALSE,
    validado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    validado_em TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Badges
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    icone_url TEXT,
    criterios JSONB,
    tipo VARCHAR(50) NOT NULL, -- 'habilidade', 'conquista', 'participacao'
    nivel VARCHAR(20), -- 'bronze', 'prata', 'ouro'
    pontos INTEGER DEFAULT 0,
    requisitos TEXT[], -- Array de requisitos
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABELAS DE RELACIONAMENTO
-- =========================

-- Tabela de Badges dos Jovens
CREATE TABLE IF NOT EXISTS jovens_badges (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    concedido_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    motivo_revocacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    avaliador_tipo VARCHAR(30) NOT NULL, -- 'instituicao_ensino', 'chefe_empresa', 'instituicao_contratante'
    avaliador_id INTEGER NOT NULL,
    categoria_id INTEGER REFERENCES categorias_avaliacao(id) ON DELETE SET NULL,
    nota NUMERIC(3,1) NOT NULL CHECK (nota >= 0 AND nota <= 10),
    comentario TEXT,
    evidencias TEXT[], -- Array de URLs ou referências a evidências
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT avaliacao_unica UNIQUE (jovem_id, avaliador_tipo, avaliador_id, categoria_id)
);

-- Tabela de Recomendações
CREATE TABLE IF NOT EXISTS recomendacoes (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    oportunidade_id INTEGER REFERENCES oportunidades(id) ON DELETE CASCADE,
    recomendador_tipo VARCHAR(30) NOT NULL, -- 'instituicao_ensino', 'chefe_empresa', 'instituicao_contratante'
    recomendador_id INTEGER NOT NULL,
    justificativa TEXT,
    comentario TEXT,
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    data_recomendacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Jovens e Instituições de Ensino
CREATE TABLE IF NOT EXISTS jovens_instituicoes (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    instituicao_id INTEGER REFERENCES instituicoes_ensino(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    data_inicio DATE,
    data_fim DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Jovens e Empresas
CREATE TABLE IF NOT EXISTS jovens_chefes_empresas (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    chefe_empresa_id INTEGER REFERENCES chefes_empresas(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    data_inicio DATE,
    data_fim DATE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Candidaturas
CREATE TABLE IF NOT EXISTS candidaturas (
    id SERIAL PRIMARY KEY,
    jovem_id INTEGER REFERENCES jovens(id) ON DELETE CASCADE,
    oportunidade_id INTEGER REFERENCES oportunidades(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'pendente', -- 'pendente', 'aprovado', 'rejeitado', 'cancelado'
    data_candidatura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resposta TIMESTAMP,
    feedback TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'candidatura', 'avaliacao', 'recomendacao', 'sistema'
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT,
    lida BOOLEAN DEFAULT FALSE,
    data_notificacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs do Sistema
CREATE TABLE IF NOT EXISTS logs_sistema (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    detalhes JSONB,
    ip VARCHAR(50),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Sessões
CREATE TABLE IF NOT EXISTS sessoes (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    data_expiracao TIMESTAMP NOT NULL,
    ip VARCHAR(50),
    user_agent TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações de Usuário
CREATE TABLE IF NOT EXISTS configuracoes_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    chave VARCHAR(50) NOT NULL,
    valor TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, chave)
);

-- Tabela de Arquivos
CREATE TABLE IF NOT EXISTS arquivos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    tamanho INTEGER NOT NULL,
    url TEXT NOT NULL,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tokens de Redefinição de Senha
CREATE TABLE IF NOT EXISTS tokens_redefinicao_senha (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    data_expiracao TIMESTAMP NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

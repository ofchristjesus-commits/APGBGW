-- ==========================================
-- APGB_SYSTEM (Porto Cais) - PostgreSQL Schema
-- ==========================================

-- 1. Dados Organizacionais
CREATE TABLE empresa (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nif VARCHAR(50),
    endereco TEXT,
    email VARCHAR(255),
    telefone VARCHAR(50),
    logo TEXT
);

-- 2. Utilizadores e Controlo de Acesso
CREATE TABLE utilizadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255), -- Hashed password
    perfil VARCHAR(100) DEFAULT 'Operador',
    cargo VARCHAR(100),
    privilegios JSONB DEFAULT '[]',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Operações Portuárias - Navios e Atracagens
CREATE TABLE navios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    imo VARCHAR(50) UNIQUE,
    bandeira VARCHAR(100),
    tipo VARCHAR(100),
    comprimento NUMERIC(10,2),
    calado NUMERIC(10,2),
    capacidade_teus INTEGER,
    armador VARCHAR(255),
    agente_maritimo VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Esperado'
);

CREATE TABLE atracagens (
    id SERIAL PRIMARY KEY,
    navio_id INTEGER REFERENCES navios(id) ON DELETE CASCADE,
    cais VARCHAR(100),
    data_prevista TIMESTAMP,
    data_atracagem TIMESTAMP,
    data_desatracagem TIMESTAMP,
    status VARCHAR(50),
    porto_origem VARCHAR(255),
    porto_destino VARCHAR(255),
    num_viagem VARCHAR(100)
);

CREATE INDEX idx_atracagens_navio_id ON atracagens(navio_id);

-- 4. Armazéns e Equipamentos
CREATE TABLE armazens (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    capacidade INTEGER,
    ocupacao_atual INTEGER DEFAULT 0,
    tipo VARCHAR(100),
    status VARCHAR(50),
    localizacao TEXT
);

CREATE TABLE equipamentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(100),
    capacidade VARCHAR(100),
    status VARCHAR(50),
    data_manutencao DATE,
    proxima_manutencao DATE,
    operador_atual VARCHAR(255),
    horas_operacao INTEGER DEFAULT 0
);

-- 5. Recursos Humanos
CREATE TABLE funcionarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    categoria VARCHAR(100),
    departamento VARCHAR(100),
    telefone VARCHAR(50),
    email VARCHAR(255),
    data_admissao DATE,
    data_nascimento DATE,
    status VARCHAR(50) DEFAULT 'Ativo',
    salario_base NUMERIC(15,2),
    documento_identidade VARCHAR(100),
    banco VARCHAR(100),
    numero_conta VARCHAR(100)
);

CREATE TABLE reformas (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE CASCADE,
    data_adicionado DATE,
    status VARCHAR(50) DEFAULT 'Pendente'
);

CREATE TABLE pagamentos (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE CASCADE,
    horas_extras NUMERIC(5,2) DEFAULT 0,
    valor_horas_extras NUMERIC(15,2) DEFAULT 0,
    valor_total NUMERIC(15,2),
    contribuicao_social NUMERIC(15,2),
    data DATE,
    status VARCHAR(50),
    observacoes TEXT
);

CREATE TABLE pontos (
    id SERIAL PRIMARY KEY,
    funcionario_id INTEGER REFERENCES funcionarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    hora_entrada TIME,
    hora_saida TIME,
    status VARCHAR(50)
);

CREATE INDEX idx_reformas_funcionario_id ON reformas(funcionario_id);
CREATE INDEX idx_pagamentos_funcionario_id ON pagamentos(funcionario_id);
CREATE INDEX idx_pontos_funcionario_id ON pontos(funcionario_id);
CREATE INDEX idx_pontos_data ON pontos(data);

-- 6. Gestão de Carga
CREATE TABLE manifestos (
    id SERIAL PRIMARY KEY,
    num_manifesto VARCHAR(100) UNIQUE NOT NULL,
    navio_id INTEGER REFERENCES navios(id) ON DELETE RESTRICT,
    data DATE,
    porto_origem VARCHAR(255),
    total_bls INTEGER DEFAULT 0,
    total_containers INTEGER DEFAULT 0,
    peso_total NUMERIC(15,2),
    status VARCHAR(50),
    consignatario VARCHAR(255),
    agente VARCHAR(255)
);

CREATE TABLE bls (
    id SERIAL PRIMARY KEY,
    num_bl VARCHAR(100) UNIQUE NOT NULL,
    navio_id INTEGER REFERENCES navios(id) ON DELETE RESTRICT,
    manifesto_id INTEGER REFERENCES manifestos(id) ON DELETE CASCADE,
    consignatario VARCHAR(255),
    notificado VARCHAR(255),
    descricao_mercadoria TEXT,
    tipo_carga VARCHAR(100),
    volumes INTEGER,
    peso_declarado NUMERIC(15,2),
    peso_conferido NUMERIC(15,2),
    num_container VARCHAR(50),
    selo VARCHAR(50),
    status_conferencia VARCHAR(50),
    conferente VARCHAR(255),
    data_conferencia TIMESTAMP,
    observacoes TEXT,
    local_armazenagem VARCHAR(100),
    porto_origem VARCHAR(255),
    porto_destino VARCHAR(255)
);

CREATE INDEX idx_manifestos_navio_id ON manifestos(navio_id);
CREATE INDEX idx_bls_manifesto_id ON bls(manifesto_id);
CREATE INDEX idx_bls_navio_id ON bls(navio_id);

CREATE TABLE pesagens (
    id SERIAL PRIMARY KEY,
    num_ticket VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(100),
    num_container VARCHAR(50),
    placa VARCHAR(50),
    peso_bruto NUMERIC(15,2),
    tara NUMERIC(15,2),
    peso_liquido NUMERIC(15,2),
    navio_id INTEGER REFERENCES navios(id) ON DELETE SET NULL,
    consignatario VARCHAR(255),
    tipo_operacao VARCHAR(100),
    status VARCHAR(50),
    operador VARCHAR(255),
    data_hora TIMESTAMP
);

CREATE INDEX idx_pesagens_navio_id ON pesagens(navio_id);

CREATE TABLE containers (
    id SERIAL PRIMARY KEY,
    num_container VARCHAR(50) UNIQUE NOT NULL,
    tipo VARCHAR(100),
    bl_id INTEGER REFERENCES bls(id) ON DELETE SET NULL,
    bloco VARCHAR(10),
    fila VARCHAR(10),
    nivel VARCHAR(10),
    data_entrada DATE,
    data_saida DATE,
    status VARCHAR(50),
    peso NUMERIC(15,2),
    selo VARCHAR(50),
    condicao VARCHAR(100)
);

CREATE INDEX idx_containers_bl_id ON containers(bl_id);

-- 7. Financeiro (Faturação)
CREATE TABLE faturas (
    id SERIAL PRIMARY KEY,
    num_fatura VARCHAR(100) UNIQUE NOT NULL,
    cliente VARCHAR(255),
    nif VARCHAR(50),
    descricao TEXT,
    valor_total NUMERIC(15,2),
    valor_extenso VARCHAR(255),
    forma_pagamento VARCHAR(50),
    status VARCHAR(50),
    data_emissao DATE,
    data_vencimento DATE,
    data_pagamento DATE,
    navio_nome VARCHAR(255),
    num_bl VARCHAR(100),
    tipo_servico VARCHAR(100)
);

-- 8. Comunicação e Site Institucional
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT,
    tipo VARCHAR(100),
    destinatario VARCHAR(255),
    lida BOOLEAN DEFAULT false,
    referencia VARCHAR(100),
    modulo VARCHAR(100),
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumo TEXT,
    conteudo TEXT,
    imagem TEXT,
    data DATE,
    publicada BOOLEAN DEFAULT false
);

CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,
    pergunta TEXT NOT NULL,
    resposta TEXT NOT NULL,
    ativa BOOLEAN DEFAULT true
);

CREATE TABLE servicos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    icone VARCHAR(100),
    ativo BOOLEAN DEFAULT true
);

CREATE TABLE videos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true
);

-- 9. Operacional e Administração
CREATE TABLE escalas (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100),
    navio_id INTEGER REFERENCES navios(id) ON DELETE CASCADE,
    data DATE,
    turno VARCHAR(100),
    funcionarios JSONB DEFAULT '[]',
    chefe_equipa VARCHAR(255),
    status VARCHAR(50)
);

CREATE INDEX idx_escalas_navio_id ON escalas(navio_id);

CREATE TABLE fiscalizacoes (
    id SERIAL PRIMARY KEY,
    num_auto VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(100),
    local VARCHAR(255),
    data_hora TIMESTAMP,
    fiscal_responsavel VARCHAR(255),
    navio_nome VARCHAR(255),
    descricao TEXT,
    resultado VARCHAR(100),
    acoes_corretivas TEXT,
    prazo_regularizacao DATE
);

CREATE TABLE compras (
    id SERIAL PRIMARY KEY,
    num_requisicao VARCHAR(100) UNIQUE NOT NULL,
    departamento VARCHAR(100),
    descricao TEXT,
    fornecedor VARCHAR(255),
    valor_estimado NUMERIC(15,2),
    status VARCHAR(50),
    data_solicitacao DATE,
    data_aprovacao DATE,
    data_entrega DATE,
    aprovado_por VARCHAR(255),
    urgencia VARCHAR(50)
);

CREATE TABLE audiencias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(100),
    data_hora TIMESTAMP,
    local VARCHAR(255),
    participantes TEXT,
    descricao TEXT,
    status VARCHAR(50),
    notas TEXT
);

CREATE TABLE correspondencias (
    id SERIAL PRIMARY KEY,
    num_referencia VARCHAR(100) UNIQUE NOT NULL,
    tipo VARCHAR(50),
    remetente VARCHAR(255),
    destinatario VARCHAR(255),
    assunto TEXT,
    data DATE,
    status VARCHAR(50),
    urgencia VARCHAR(50),
    observacoes TEXT
);

CREATE TABLE despachos (
    id SERIAL PRIMARY KEY,
    num_despacho VARCHAR(100) UNIQUE NOT NULL,
    assunto TEXT,
    descricao TEXT,
    responsavel VARCHAR(255),
    status VARCHAR(50),
    prioridade VARCHAR(50),
    data_criacao DATE
);

CREATE TABLE autorizacoes_credito (
    id SERIAL PRIMARY KEY,
    num_autorizacao VARCHAR(100) UNIQUE NOT NULL,
    beneficiario VARCHAR(255),
    valor NUMERIC(15,2),
    descricao TEXT,
    status VARCHAR(50),
    data_criacao DATE
);

CREATE TABLE isencoes (
    id SERIAL PRIMARY KEY,
    num_isencao VARCHAR(100) UNIQUE NOT NULL,
    beneficiario VARCHAR(255),
    tipo VARCHAR(100),
    motivo TEXT,
    valor_isento NUMERIC(15,2),
    status VARCHAR(50),
    data_solicitacao DATE
);

CREATE TABLE compromissos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    data_hora TIMESTAMP,
    local VARCHAR(255),
    participantes TEXT,
    status VARCHAR(50),
    descricao TEXT
);

CREATE TABLE contatos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    entidade VARCHAR(255),
    email VARCHAR(255),
    telefone VARCHAR(50),
    cargo VARCHAR(100),
    observacoes TEXT
);

-- 10. Auditoria e Logs
CREATE TABLE logs_sistema (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100),
    mensagem TEXT,
    detalhe TEXT,
    usuario VARCHAR(255),
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

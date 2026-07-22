-- ==========================================
-- APGB_SYSTEM (Porto Cais) - PostgreSQL Seed Data
-- ==========================================

-- 1. Dados Organizacionais
INSERT INTO empresa (nome, nif, endereco, email, telefone, logo) VALUES 
('Porto Cais S.A.', 'TG-NIF-000001', 'Avenida da República, Lomé', 'geral@portocais.tg', '+228 22 23 45 67', NULL);

-- 2. Utilizadores e Controlo de Acesso
INSERT INTO utilizadores (nome, email, senha, perfil, cargo, ativo) VALUES 
('Admin Principal', 'admin@portocais.tg', 'admin123', 'Administrador', 'Administrador', true),
('João Mensah', 'jmensah@portocais.tg', 'password123', 'Operador', 'Operador', true);

-- 3. Operações Portuárias - Navios e Atracagens
INSERT INTO navios (id, nome, imo, bandeira, tipo, comprimento, calado, capacidade_teus, armador, agente_maritimo, status) VALUES 
(1, 'MV Atlantic Star', '9876543', 'Panamá', 'Porta-Containers', 294, 14.5, 4500, 'MSC Mediterranean', 'Agência Marítima Oeste', 'Atracado'),
(2, 'MV Sahel Explorer', '9876544', 'Libéria', 'Graneleiro', 225, 12.0, 0, 'Bolloré Logistics', 'SAGA Togo', 'Em Operação'),
(3, 'MV Costa Verde', '9876545', 'Togo', 'Carga Geral', 180, 9.5, 800, 'Maersk Line', 'SDV Togo', 'Esperado'),
(4, 'MV Gulf Trader', '9876546', 'Grécia', 'Tanque', 250, 13.0, 0, 'Trafigura', 'Inchcape Shipping', 'Partiu'),
(5, 'MV Africa Pioneer', '9876547', 'Singapura', 'Ro-Ro', 200, 8.5, 1200, 'Grimaldi Lines', 'Agência Neptune', 'Esperado');
SELECT setval('navios_id_seq', 5);

INSERT INTO atracagens (navio_id, cais, data_prevista, data_atracagem, status, porto_origem, porto_destino, num_viagem) VALUES 
(1, 'Cais 1', '2026-06-25 08:00:00', '2026-06-25 09:30:00', 'Em Operação', 'Roterdão, Holanda', 'Lomé, Togo', 'VOY-2026-0012'),
(2, 'Cais 3', '2026-06-24 06:00:00', '2026-06-24 07:15:00', 'Atracado', 'Dakar, Senegal', 'Lomé, Togo', 'VOY-2026-0013'),
(3, 'Cais 2', '2026-06-28 14:00:00', NULL, 'Aprovado', 'Abidjan, Costa do Marfim', 'Lomé, Togo', 'VOY-2026-0014'),
(5, 'Cais 4', '2026-06-30 10:00:00', NULL, 'Notificado', 'Tema, Gana', 'Lomé, Togo', 'VOY-2026-0015');

-- 4. Armazéns e Equipamentos
INSERT INTO armazens (nome, codigo, capacidade, ocupacao_atual, tipo, status, localizacao) VALUES 
('Armazém A1', 'ARM-A1', 5000, 3200, 'Coberto', 'Ativo', 'Zona Norte - Terminal 1'),
('Armazém B2', 'ARM-B2', 8000, 7500, 'Descoberto', 'Ativo', 'Zona Sul - Terminal 2'),
('Câmara Frigorífica C1', 'ARM-C1', 2000, 800, 'Frigorífico', 'Ativo', 'Zona Leste - Terminal 1'),
('Armazém Perigosos D1', 'ARM-D1', 1000, 150, 'Perigoso', 'Ativo', 'Zona Isolada - Terminal 3');

INSERT INTO equipamentos (nome, codigo, tipo, capacidade, status, data_manutencao, proxima_manutencao, operador_atual, horas_operacao) VALUES 
('Grua Pórtico GP-01', 'EQ-GP01', 'Grua Pórtico', '45 toneladas', 'Operacional', '2026-05-15', '2026-08-15', 'João Mensah', 12500),
('Grua Móvel GM-01', 'EQ-GM01', 'Grua Móvel', '100 toneladas', 'Operacional', '2026-04-20', '2026-07-20', 'Kofi Adzoh', 8900),
('Empilhadeira EF-03', 'EQ-EF03', 'Empilhadeira', '5 toneladas', 'Em Manutenção', '2026-06-20', '2026-09-20', NULL, 6200),
('Reach Stacker RS-01', 'EQ-RS01', 'Reach Stacker', '45 toneladas', 'Avariado', '2026-06-10', NULL, NULL, 15800);

-- 5. Recursos Humanos
INSERT INTO funcionarios (id, nome, matricula, categoria, departamento, telefone, email, data_admissao, data_nascimento, status, salario_base, documento_identidade, banco, numero_conta) VALUES 
(1, 'Kwame Adjo', 'FUN-001', 'Estivador Efetivo', 'Operações', '+228 90 12 34 56', 'kwame@portocais.tg', '2020-03-15', '1965-06-15', 'Ativo', 180000, 'ID-TG-1234567', 'Banco Nacional', '001-123456-01'),
(2, 'Akouvi Mensah', 'FUN-002', 'Conferente', 'Conferência', '+228 91 23 45 67', 'akouvi@portocais.tg', '2019-07-01', '1970-11-02', 'Ativo', 220000, 'ID-TG-2345678', 'Banco do Atlântico', '002-654321-09'),
(3, 'Kofi Adzoh', 'FUN-003', 'Operador de Máquina', 'Equipamentos', '+228 92 34 56 78', 'kofi@portocais.tg', '2018-01-10', '1980-02-20', 'Ativo', 250000, 'ID-TG-3456789', 'Banco Mercantil', '003-987654-22'),
(4, 'Ama Dosseh', 'FUN-004', 'Administrativo', 'Administração', '+228 93 45 67 89', 'ama@portocais.tg', '2021-09-20', '1990-08-10', 'Férias', 200000, 'ID-TG-4567890', 'Banco Nacional', '004-112233-44'),
(5, 'Yao Agbeko', 'FUN-005', 'Fiscal', 'Fiscalização', '+228 94 56 78 90', 'yao@portocais.tg', '2017-05-05', '1959-04-01', 'Ativo', 280000, 'ID-TG-5678901', 'Banco do Atlântico', '005-445566-77'),
(6, 'Paulo Silva', 'FUN-006', 'Estivador Efetivo', 'Operações', '+228 95 11 22 33', 'paulo@portocais.tg', '2010-02-10', '1958-03-20', 'Ativo', 190000, 'ID-TG-6789012', 'Banco Mercantil', '006-778899-00'),
(7, 'André Koffi', 'FUN-007', 'Conferente', 'Conferência', '+228 96 22 33 44', 'andre@portocais.tg', '2012-11-05', '1968-07-10', 'Ativo', 210000, 'ID-TG-7890123', 'Banco Nacional', '007-334455-88');
SELECT setval('funcionarios_id_seq', 7);

INSERT INTO reformas (funcionario_id, data_adicionado, status) VALUES 
(5, '2026-06-20', 'Em Reforma'),
(6, '2026-06-22', 'Pendente');

INSERT INTO pagamentos (funcionario_id, horas_extras, valor_horas_extras, valor_total, contribuicao_social, data, status) VALUES 
(1, 2, 4500, 184500, 14760, '2026-06-30', 'Pago'),
(2, 3, 8250, 228250, 18260, '2026-06-30', 'Pago');

INSERT INTO pontos (funcionario_id, data, hora_entrada, hora_saida, status) VALUES 
(1, '2026-06-30', '08:00:00', '17:00:00', 'Completado'),
(2, '2026-06-30', '08:15:00', '17:10:00', 'Completado');

-- 6. Gestão de Carga
INSERT INTO manifestos (id, num_manifesto, navio_id, data, porto_origem, total_bls, total_containers, peso_total, status, consignatario, agente) VALUES 
(1, 'MAN-2026-00001', 1, '2026-06-25', 'Roterdão, Holanda', 12, 45, 850000, 'Em Conferência', 'West Africa Trading Co.', 'Agência Marítima Oeste'),
(2, 'MAN-2026-00002', 2, '2026-06-24', 'Dakar, Senegal', 8, 0, 320000, 'Registrado', 'Sahel Import-Export', 'SAGA Togo');
SELECT setval('manifestos_id_seq', 2);

INSERT INTO bls (id, num_bl, navio_id, manifesto_id, consignatario, notificado, descricao_mercadoria, tipo_carga, volumes, peso_declarado, peso_conferido, num_container, selo, status_conferencia, conferente, data_conferencia, observacoes, local_armazenagem, porto_origem, porto_destino) VALUES 
(1, 'BL-ATL-2026-001', 1, 1, 'Lomé Comércio Lda.', 'Agência Marítima Oeste', 'Equipamentos eletrónicos variados', 'Container', 120, 45000, 44800, 'MSCU1234567', 'SL-2026-001', 'Conferido OK', 'Akouvi Mensah', '2026-06-26 10:30:00', 'Carga em bom estado', 'Armazém A1', 'Roterdão', 'Lomé'),
(2, 'BL-ATL-2026-002', 1, 1, 'Togo Agri SARL', 'SDV Togo', 'Fertilizantes agrícolas', 'Granel', 1, 120000, NULL, NULL, NULL, 'Pendente', NULL, NULL, NULL, NULL, 'Roterdão', 'Lomé'),
(3, 'BL-SAH-2026-001', 2, 2, 'Sahel Motors', 'SAGA Togo', 'Peças automóveis', 'Carga Geral', 85, 32000, 33200, 'SGAU7654321', 'SL-2026-002', 'Divergência', 'Akouvi Mensah', '2026-06-25 15:00:00', 'Peso conferido superior ao declarado em 1200kg', 'Armazém B2', 'Dakar', 'Lomé');
SELECT setval('bls_id_seq', 3);

INSERT INTO pesagens (num_ticket, tipo, num_container, placa, peso_bruto, tara, peso_liquido, navio_id, consignatario, tipo_operacao, status, operador, data_hora) VALUES 
('PES-2026-00001', 'Container 20''', 'MSCU1234567', 'LT-1234-AB', 28500, 4200, 24300, 1, 'Lomé Comércio Lda.', 'Importação', 'Concluída', 'Kwame Adjo', '2026-06-26 08:30:00'),
('PES-2026-00002', 'Container 40''', 'SGAU7654321', 'LT-5678-CD', 35000, 5100, 29900, 2, 'Sahel Motors', 'Importação', 'Primeira Pesagem', 'Kwame Adjo', '2026-06-26 14:15:00');

INSERT INTO containers (num_container, tipo, bl_id, bloco, fila, nivel, data_entrada, data_saida, status, peso, selo, condicao) VALUES 
('MSCU1234567', '20 pés', 1, 'A', '3', '2', '2026-06-26', NULL, 'No Parque', 24300, 'SL-2026-001', 'Bom'),
('SGAU7654321', '40 pés', 3, 'B', '1', '1', '2026-06-25', NULL, 'Retido', 33200, 'SL-2026-002', 'Bom'),
('MSKU9876543', '20 pés Reefer', NULL, 'C', '2', '1', '2026-06-24', '2026-06-27', 'Liberado', 18500, 'SL-2026-003', 'Bom');

-- 7. Financeiro (Faturação)
INSERT INTO faturas (num_fatura, cliente, nif, descricao, valor_total, valor_extenso, forma_pagamento, status, data_emissao, data_vencimento, data_pagamento, navio_nome, num_bl, tipo_servico) VALUES 
('FAT-2026-00001', 'Lomé Comércio Lda.', 'TG-NIF-123456', 'Serviço de armazenagem - Container MSCU1234567', 35000, 'Trinta e cinco mil francos CFA', 'Tesouraria', 'Paga', '2026-06-26', '2026-07-26', '2026-06-28', 'MV Atlantic Star', 'BL-ATL-2026-001', 'Armazenagem'),
('FAT-2026-00002', 'Sahel Motors', 'TG-NIF-789012', 'Serviço de estiva e pesagem - Container SGAU7654321', 175000, 'Cento e setenta e cinco mil francos CFA', 'Banco', 'Emitida', '2026-06-27', '2026-07-27', NULL, 'MV Sahel Explorer', 'BL-SAH-2026-001', 'Estiva'),
('FAT-2026-00003', 'West Africa Trading Co.', 'TG-NIF-345678', 'Serviço de atracagem - MV Atlantic Star', 520000, 'Quinhentos e vinte mil francos CFA', 'Banco', 'Vencida', '2026-05-15', '2026-06-15', NULL, 'MV Atlantic Star', NULL, 'Atracagem');

-- 8. Comunicação e Site Institucional
INSERT INTO notificacoes (titulo, mensagem, tipo, destinatario, lida, referencia, modulo, data_criacao) VALUES 
('Navio MV Africa Pioneer notificado', 'O navio MV Africa Pioneer foi notificado para atracagem no Cais 4. Chegada prevista: 30/06/2026.', 'Atracagem', 'Todos', false, 'ATR-004', 'Atracagem', '2026-06-28 09:00:00'),
('Manutenção programada - Empilhadeira EF-03', 'A Empilhadeira EF-03 entrou em manutenção preventiva. Previsão de retorno: 3 dias.', 'Alerta', 'Equipa Equipamentos', false, 'EQ-EF03', 'Equipamentos', '2026-06-27 14:30:00'),
('Fatura FAT-2026-00003 vencida', 'A fatura FAT-2026-00003 do cliente West Africa Trading Co. encontra-se vencida desde 15/06/2026. Valor: 520.000 XOF.', 'Urgente', 'Tesouraria', true, 'FAT-2026-00003', 'Faturação', '2026-06-26 08:00:00');

INSERT INTO noticias (titulo, resumo, conteudo, data, publicada) VALUES 
('Porto Cais inaugura novo terminal de contentores', 'O novo terminal de contentores aumenta a capacidade do porto em 40%, permitindo receber navios de grande porte e impulsionando o comércio regional.', 'O Porto Cais inaugurou oficialmente o seu novo terminal de contentores, uma infraestrutura moderna que representa um investimento significativo na modernização das operações portuárias.', '2026-06-20', true),
('Sistema de pesagem automática já em funcionamento', 'As novas báscolas digitais calibradas internacionalmente estão operacionais, oferecendo maior precisão e rapidez nos processos de pesagem.', 'O porto implementou um sistema de pesagem totalmente digital com báscolas calibradas segundo padrões internacionais.', '2026-06-15', true);

INSERT INTO faqs (pergunta, resposta, ativa) VALUES 
('Como solicitar a atracagem de um navio?', 'O agente marítimo deve notificar a administração portuária com antecedência mínima de 48 horas, indicando o tipo de navio, calado, comprimento e natureza da carga. A solicitação é analisada e, uma vez aprovada, o cais é designado.', true),
('Quais são os horários de operação do porto?', 'O porto opera 24 horas por dia, 7 dias por semana, com turnos organizados: Manhã (06h-14h), Tarde (14h-22h) e Noite (22h-06h). A administração funciona de segunda a sexta, das 08h às 17h.', true),
('Como funciona o serviço de pesagem?', 'A pesagem é realizada em báscolas calibradas. O camião entra na báscola para obter o peso bruto, é descarregado, e uma segunda pesagem determina a tara. O peso líquido é calculado automaticamente. Um ticket oficial é emitido para cada operação.', true),
('Qual é o prazo de armazenagem gratuita?', 'A armazenagem gratuita é de 15 dias corridos a partir da descarga do navio. Após este período, são aplicadas taxas diárias conforme o tipo de mercadoria e zona de armazenagem. Consulte a tabela de tarifas no balcão de atendimento.', true);

INSERT INTO servicos (titulo, descricao, icone, ativo) VALUES 
('Atracagem de Navios', 'Gestão de atracagem e desatracagem com cais modernos e rebocadores de alta capacidade.', 'Ship', true),
('Armazenagem', 'Armazéns cobertos, descobertos, frigoríficos e para mercadorias perigosas com monitorização 24/7.', 'Warehouse', true),
('Serviço de Pesagem', 'Báscolas digitais calibradas com emissão automática de tickets e integração direta com a faturação.', 'Scale', true),
('Fiscalização', 'Inspeções de segurança, ambientais e documentais rigorosas por equipas especializadas.', 'Shield', true);

INSERT INTO videos (titulo, url, descricao, ativo) VALUES 
('Vídeo Institucional', 'https://example.com/video1.mp4', 'Conheça as operações do Porto Cais.', true);

-- 9. Operacional e Administração
INSERT INTO escalas (tipo, navio_id, data, turno, funcionarios, chefe_equipa, status) VALUES 
('Estivadores Efetivos', 1, '2026-06-26', 'Manhã 06h-14h', '["Kwame Adjo", "Paulo Silva", "André Koffi"]', 'Kwame Adjo', 'Concluída'),
('Conferentes', 1, '2026-06-26', 'Manhã 06h-14h', '["Akouvi Mensah"]', 'Akouvi Mensah', 'Concluída'),
('Estivadores Efetivos', 1, '2026-06-27', 'Tarde 14h-22h', '["Kwame Adjo", "Paulo Silva"]', 'Kwame Adjo', 'Programada');

INSERT INTO fiscalizacoes (num_auto, tipo, local, data_hora, fiscal_responsavel, navio_nome, descricao, resultado, acoes_corretivas, prazo_regularizacao) VALUES 
('FIS-2026-00001', 'Inspeção de Segurança', 'Cais 1 - Terminal Principal', '2026-06-25 10:00:00', 'Yao Agbeko', 'MV Atlantic Star', 'Inspeção de segurança de rotina no cais 1 durante operações de descarga', 'Conforme', NULL, NULL),
('FIS-2026-00002', 'Ambiental', 'Zona de Armazenagem B', '2026-06-26 14:30:00', 'Yao Agbeko', NULL, 'Verificação de conformidade ambiental na zona de armazenagem de produtos químicos', 'Não Conforme', 'Instalar barreiras de contenção adicionais e verificar sistema de drenagem', '2026-07-10');

INSERT INTO compras (num_requisicao, departamento, descricao, fornecedor, valor_estimado, status, data_solicitacao, data_aprovacao, data_entrega, aprovado_por, urgencia) VALUES 
('REQ-2026-00001', 'Operações', 'Cabos de aço para gruas - 200m', 'Materiais Marítimos Lda.', 450000, 'Aprovada', '2026-06-20', '2026-06-22', NULL, 'Diretor de Operações', 'Normal'),
('REQ-2026-00002', 'Administração', 'Material de escritório e toners de impressora', 'Papelaria Central', 85000, 'Entregue', '2026-06-15', '2026-06-16', '2026-06-23', 'Chefe Administrativo', 'Normal');

INSERT INTO audiencias (titulo, tipo, data_hora, local, participantes, descricao, status, notas) VALUES 
('Reunião com agentes marítimos', 'Reunião', '2026-06-28 10:00:00', 'Sala de Conferências', 'Diretor Geral, Agentes Marítimos, Chefes de Departamento', 'Reunião trimestral com os agentes marítimos para discutir melhorias nos serviços', 'Programada', ''),
('Audiência com Ministério dos Transportes', 'Audiência', '2026-07-02 09:00:00', 'Gabinete do Diretor Geral', 'Diretor Geral, Representantes do Ministério', 'Discussão sobre o plano de expansão portuária', 'Programada', '');

INSERT INTO correspondencias (num_referencia, tipo, remetente, destinatario, assunto, data, status, urgencia, observacoes) VALUES 
('CORR-2026-00001', 'Entrada', 'Ministério dos Transportes', 'Direção Geral', 'Plano de expansão portuária - Fase 2', '2026-06-20', 'Recebida', 'Normal', 'Documento requer resposta até 15/07/2026'),
('CORR-2026-00002', 'Saída', 'Direção Geral', 'Autoridade Marítima Nacional', 'Relatório mensal de operações - Maio 2026', '2026-06-05', 'Enviada', 'Normal', NULL);

INSERT INTO despachos (num_despacho, assunto, descricao, responsavel, status, prioridade, data_criacao) VALUES 
('DSP-2026-00001', 'Autorização de horas extras para equipa de estiva', 'Autorizar horas extras para a equipa de estiva durante a operação do MV Atlantic Star', 'Chefe de Operações', 'Concluído', 'Urgente', '2026-06-25');

INSERT INTO autorizacoes_credito (num_autorizacao, beneficiario, valor, descricao, status, data_criacao) VALUES 
('AC-2026-00001', 'Materiais Marítimos Lda.', 450000, 'Autorização de crédito para aquisição de cabos de aço', 'Aprovada', '2026-06-22');

INSERT INTO isencoes (num_isencao, beneficiario, tipo, motivo, valor_isento, status, data_solicitacao) VALUES 
('ISN-2026-00001', 'ONG Humanitária Africa Aid', 'Armazenagem', 'Carga humanitária - Material médico para zona de crise', 125000, 'Aprovada', '2026-06-18');

INSERT INTO compromissos (titulo, data_hora, local, participantes, status, descricao) VALUES 
('Reunião de Planeamento Estratégico', '2026-06-29 11:00:00', 'Sala Executiva', 'Diretor Geral, Chefes de Departamento', 'Programado', 'Alinhar prioridades de investimento para o próximo trimestre.');

-- 10. Auditoria e Logs
INSERT INTO logs_sistema (tipo, mensagem, detalhe, usuario) VALUES 
('Sistema', 'Inicialização do banco de dados', 'Seed data carregado com sucesso.', 'Sistema');

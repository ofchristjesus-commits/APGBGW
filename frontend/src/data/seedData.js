// ============================================================
// Porto Cais — Dados de Exemplo (Seed Data)
// ============================================================

export const seedNavios = [
  { id: 1, nome: 'MV Atlantic Star', imo: '9876543', bandeira: 'Panamá', tipo: 'Porta-Containers', comprimento: 294, calado: 14.5, capacidadeTEUs: 4500, armador: 'MSC Mediterranean', agenteMaritimo: 'Agência Marítima Oeste', status: 'Atracado' },
  { id: 2, nome: 'MV Sahel Explorer', imo: '9876544', bandeira: 'Libéria', tipo: 'Graneleiro', comprimento: 225, calado: 12.0, capacidadeTEUs: 0, armador: 'Bolloré Logistics', agenteMaritimo: 'SAGA Togo', status: 'Em Operação' },
  { id: 3, nome: 'MV Costa Verde', imo: '9876545', bandeira: 'Togo', tipo: 'Carga Geral', comprimento: 180, calado: 9.5, capacidadeTEUs: 800, armador: 'Maersk Line', agenteMaritimo: 'SDV Togo', status: 'Esperado' },
  { id: 4, nome: 'MV Gulf Trader', imo: '9876546', bandeira: 'Grécia', tipo: 'Tanque', comprimento: 250, calado: 13.0, capacidadeTEUs: 0, armador: 'Trafigura', agenteMaritimo: 'Inchcape Shipping', status: 'Partiu' },
  { id: 5, nome: 'MV Africa Pioneer', imo: '9876547', bandeira: 'Singapura', tipo: 'Ro-Ro', comprimento: 200, calado: 8.5, capacidadeTEUs: 1200, armador: 'Grimaldi Lines', agenteMaritimo: 'Agência Neptune', status: 'Esperado' },
];

export const seedAtracagens = [
  { id: 1, navioId: 1, navioNome: 'MV Atlantic Star', cais: 'Cais 1', dataPrevista: '2026-06-25T08:00', dataAtracagem: '2026-06-25T09:30', dataDesatracagem: null, status: 'Em Operação', portoOrigem: 'Roterdão, Holanda', portoDestino: 'Lomé, Togo', numViagem: 'VOY-2026-0012' },
  { id: 2, navioId: 2, navioNome: 'MV Sahel Explorer', cais: 'Cais 3', dataPrevista: '2026-06-24T06:00', dataAtracagem: '2026-06-24T07:15', dataDesatracagem: null, status: 'Atracado', portoOrigem: 'Dakar, Senegal', portoDestino: 'Lomé, Togo', numViagem: 'VOY-2026-0013' },
  { id: 3, navioId: 3, navioNome: 'MV Costa Verde', cais: 'Cais 2', dataPrevista: '2026-06-28T14:00', dataAtracagem: null, dataDesatracagem: null, status: 'Aprovado', portoOrigem: 'Abidjan, Costa do Marfim', portoDestino: 'Lomé, Togo', numViagem: 'VOY-2026-0014' },
  { id: 4, navioId: 5, navioNome: 'MV Africa Pioneer', cais: 'Cais 4', dataPrevista: '2026-06-30T10:00', dataAtracagem: null, dataDesatracagem: null, status: 'Notificado', portoOrigem: 'Tema, Gana', portoDestino: 'Lomé, Togo', numViagem: 'VOY-2026-0015' },
];

export const seedArmazens = [
  { id: 1, nome: 'Armazém A1', codigo: 'ARM-A1', capacidade: 5000, ocupacaoAtual: 3200, tipo: 'Coberto', status: 'Ativo', localizacao: 'Zona Norte - Terminal 1' },
  { id: 2, nome: 'Armazém B2', codigo: 'ARM-B2', capacidade: 8000, ocupacaoAtual: 7500, tipo: 'Descoberto', status: 'Ativo', localizacao: 'Zona Sul - Terminal 2' },
  { id: 3, nome: 'Câmara Frigorífica C1', codigo: 'ARM-C1', capacidade: 2000, ocupacaoAtual: 800, tipo: 'Frigorífico', status: 'Ativo', localizacao: 'Zona Leste - Terminal 1' },
  { id: 4, nome: 'Armazém Perigosos D1', codigo: 'ARM-D1', capacidade: 1000, ocupacaoAtual: 150, tipo: 'Perigoso', status: 'Ativo', localizacao: 'Zona Isolada - Terminal 3' },
];

export const seedEquipamentos = [
  { id: 1, nome: 'Grua Pórtico GP-01', codigo: 'EQ-GP01', tipo: 'Grua Pórtico', capacidade: '45 toneladas', status: 'Operacional', dataManutencao: '2026-05-15', proximaManutencao: '2026-08-15', operadorAtual: 'João Mensah', horasOperacao: 12500 },
  { id: 2, nome: 'Grua Móvel GM-01', codigo: 'EQ-GM01', tipo: 'Grua Móvel', capacidade: '100 toneladas', status: 'Operacional', dataManutencao: '2026-04-20', proximaManutencao: '2026-07-20', operadorAtual: 'Kofi Adzoh', horasOperacao: 8900 },
  { id: 3, nome: 'Empilhadeira EF-03', codigo: 'EQ-EF03', tipo: 'Empilhadeira', capacidade: '5 toneladas', status: 'Em Manutenção', dataManutencao: '2026-06-20', proximaManutencao: '2026-09-20', operadorAtual: null, horasOperacao: 6200 },
  { id: 4, nome: 'Reach Stacker RS-01', codigo: 'EQ-RS01', tipo: 'Reach Stacker', capacidade: '45 toneladas', status: 'Avariado', dataManutencao: '2026-06-10', proximaManutencao: null, operadorAtual: null, horasOperacao: 15800 },
];

export const seedFuncionarios = [
  { id: 1, nome: 'Kwame Adjo', matricula: 'FUN-001', categoria: 'Estivador Efetivo', departamento: 'Operações', telefone: '+228 90 12 34 56', email: 'kwame@portocais.tg', dataAdmissao: '2020-03-15', dataNascimento: '1965-06-15', status: 'Ativo', salarioBase: 180000, documentoIdentidade: 'ID-TG-1234567', banco: 'Banco Nacional', numeroConta: '001-123456-01' },
  { id: 2, nome: 'Akouvi Mensah', matricula: 'FUN-002', categoria: 'Conferente', departamento: 'Conferência', telefone: '+228 91 23 45 67', email: 'akouvi@portocais.tg', dataAdmissao: '2019-07-01', dataNascimento: '1970-11-02', status: 'Ativo', salarioBase: 220000, documentoIdentidade: 'ID-TG-2345678', banco: 'Banco do Atlântico', numeroConta: '002-654321-09' },
  { id: 3, nome: 'Kofi Adzoh', matricula: 'FUN-003', categoria: 'Operador de Máquina', departamento: 'Equipamentos', telefone: '+228 92 34 56 78', email: 'kofi@portocais.tg', dataAdmissao: '2018-01-10', dataNascimento: '1980-02-20', status: 'Ativo', salarioBase: 250000, documentoIdentidade: 'ID-TG-3456789', banco: 'Banco Mercantil', numeroConta: '003-987654-22' },
  { id: 4, nome: 'Ama Dosseh', matricula: 'FUN-004', categoria: 'Administrativo', departamento: 'Administração', telefone: '+228 93 45 67 89', email: 'ama@portocais.tg', dataAdmissao: '2021-09-20', dataNascimento: '1990-08-10', status: 'Férias', salarioBase: 200000, documentoIdentidade: 'ID-TG-4567890', banco: 'Banco Nacional', numeroConta: '004-112233-44' },
  { id: 5, nome: 'Yao Agbeko', matricula: 'FUN-005', categoria: 'Fiscal', departamento: 'Fiscalização', telefone: '+228 94 56 78 90', email: 'yao@portocais.tg', dataAdmissao: '2017-05-05', dataNascimento: '1959-04-01', status: 'Ativo', salarioBase: 280000, documentoIdentidade: 'ID-TG-5678901', banco: 'Banco do Atlântico', numeroConta: '005-445566-77' },
  { id: 6, nome: 'Paulo Silva', matricula: 'FUN-006', categoria: 'Estivador Efetivo', departamento: 'Operações', telefone: '+228 95 11 22 33', email: 'paulo@portocais.tg', dataAdmissao: '2010-02-10', dataNascimento: '1958-03-20', status: 'Ativo', salarioBase: 190000, documentoIdentidade: 'ID-TG-6789012', banco: 'Banco Mercantil', numeroConta: '006-778899-00' },
  { id: 7, nome: 'André Koffi', matricula: 'FUN-007', categoria: 'Conferente', departamento: 'Conferência', telefone: '+228 96 22 33 44', email: 'andre@portocais.tg', dataAdmissao: '2012-11-05', dataNascimento: '1968-07-10', status: 'Ativo', salarioBase: 210000, documentoIdentidade: 'ID-TG-7890123', banco: 'Banco Nacional', numeroConta: '007-334455-88' },
];

export const seedReformas = [
  { id: 1, funcionarioId: 5, nome: 'Yao Agbeko', dataNascimento: '1959-04-01', idade: 66, dataAdicionado: '2026-06-20', status: 'Em Reforma' },
  { id: 2, funcionarioId: 6, nome: 'Paulo Silva', dataNascimento: '1958-03-20', idade: 67, dataAdicionado: '2026-06-22', status: 'Pendente' },
];

export const seedPagamentos = [
  { id: 1, funcionarioId: 1, nome: 'Kwame Adjo', perfil: 'Estivador Efetivo', horasExtras: 2, valorHorasExtras: 4500, valorTotal: 184500, contribuicaoSocial: 14760, data: '2026-06-30', status: 'Pago' },
  { id: 2, funcionarioId: 2, nome: 'Akouvi Mensah', perfil: 'Conferente', horasExtras: 3, valorHorasExtras: 8250, valorTotal: 228250, contribuicaoSocial: 18260, data: '2026-06-30', status: 'Pago' },
];

export const seedPontos = [
  { id: 1, funcionarioId: 1, funcionarioNome: 'Kwame Adjo', matricula: 'FUN-001', departamento: 'Operações', data: '2026-06-30', horaEntrada: '08:00', horaSaida: '17:00', status: 'Completado' },
  { id: 2, funcionarioId: 2, funcionarioNome: 'Akouvi Mensah', matricula: 'FUN-002', departamento: 'Conferência', data: '2026-06-30', horaEntrada: '08:15', horaSaida: '17:10', status: 'Completado' },
];

export const seedManifestos = [
  { id: 1, numManifesto: 'MAN-2026-00001', navioId: 1, navioNome: 'MV Atlantic Star', data: '2026-06-25', portoOrigem: 'Roterdão, Holanda', totalBLs: 12, totalContainers: 45, pesoTotal: 850000, status: 'Em Conferência', consignatario: 'West Africa Trading Co.', agente: 'Agência Marítima Oeste' },
  { id: 2, numManifesto: 'MAN-2026-00002', navioId: 2, navioNome: 'MV Sahel Explorer', data: '2026-06-24', portoOrigem: 'Dakar, Senegal', totalBLs: 8, totalContainers: 0, pesoTotal: 320000, status: 'Registrado', consignatario: 'Sahel Import-Export', agente: 'SAGA Togo' },
];

export const seedBLs = [
  { id: 1, numBL: 'BL-ATL-2026-001', navioId: 1, navioNome: 'MV Atlantic Star', manifestoId: 1, consignatario: 'Lomé Comércio Lda.', notificado: 'Agência Marítima Oeste', descricaoMercadoria: 'Equipamentos eletrónicos variados', tipoCarga: 'Container', volumes: 120, pesoDeclarado: 45000, pesoConferido: 44800, numContainer: 'MSCU1234567', selo: 'SL-2026-001', statusConferencia: 'Conferido OK', conferente: 'Akouvi Mensah', dataConferencia: '2026-06-26T10:30', observacoes: 'Carga em bom estado', localArmazenagem: 'Armazém A1', portoOrigem: 'Roterdão', portoDestino: 'Lomé' },
  { id: 2, numBL: 'BL-ATL-2026-002', navioId: 1, navioNome: 'MV Atlantic Star', manifestoId: 1, consignatario: 'Togo Agri SARL', notificado: 'SDV Togo', descricaoMercadoria: 'Fertilizantes agrícolas', tipoCarga: 'Granel', volumes: 1, pesoDeclarado: 120000, pesoConferido: null, numContainer: null, selo: null, statusConferencia: 'Pendente', conferente: null, dataConferencia: null, observacoes: null, localArmazenagem: null, portoOrigem: 'Roterdão', portoDestino: 'Lomé' },
  { id: 3, numBL: 'BL-SAH-2026-001', navioId: 2, navioNome: 'MV Sahel Explorer', manifestoId: 2, consignatario: 'Sahel Motors', notificado: 'SAGA Togo', descricaoMercadoria: 'Peças automóveis', tipoCarga: 'Carga Geral', volumes: 85, pesoDeclarado: 32000, pesoConferido: 33200, numContainer: 'SGAU7654321', selo: 'SL-2026-002', statusConferencia: 'Divergência', conferente: 'Akouvi Mensah', dataConferencia: '2026-06-25T15:00', observacoes: 'Peso conferido superior ao declarado em 1200kg', localArmazenagem: 'Armazém B2', portoOrigem: 'Dakar', portoDestino: 'Lomé' },
];

export const seedPesagens = [
  { id: 1, numTicket: 'PES-2026-00001', tipo: 'Container 20\'', numContainer: 'MSCU1234567', placa: 'LT-1234-AB', pesoBruto: 28500, tara: 4200, pesoLiquido: 24300, navioId: 1, navioNome: 'MV Atlantic Star', consignatario: 'Lomé Comércio Lda.', tipoOperacao: 'Importação', status: 'Concluída', operador: 'Kwame Adjo', dataHora: '2026-06-26T08:30' },
  { id: 2, numTicket: 'PES-2026-00002', tipo: 'Container 40\'', numContainer: 'SGAU7654321', placa: 'LT-5678-CD', pesoBruto: 35000, tara: 5100, pesoLiquido: 29900, navioId: 2, navioNome: 'MV Sahel Explorer', consignatario: 'Sahel Motors', tipoOperacao: 'Importação', status: 'Primeira Pesagem', operador: 'Kwame Adjo', dataHora: '2026-06-26T14:15' },
];

export const seedContainers = [
  { id: 1, numContainer: 'MSCU1234567', tipo: '20 pés', blId: 1, consignatario: 'Lomé Comércio Lda.', navioNome: 'MV Atlantic Star', bloco: 'A', fila: '3', nivel: '2', dataEntrada: '2026-06-26', dataSaida: null, status: 'No Parque', peso: 24300, selo: 'SL-2026-001', condicao: 'Bom' },
  { id: 2, numContainer: 'SGAU7654321', tipo: '40 pés', blId: 3, consignatario: 'Sahel Motors', navioNome: 'MV Sahel Explorer', bloco: 'B', fila: '1', nivel: '1', dataEntrada: '2026-06-25', dataSaida: null, status: 'Retido', peso: 33200, selo: 'SL-2026-002', condicao: 'Bom' },
  { id: 3, numContainer: 'MSKU9876543', tipo: '20 pés Reefer', blId: null, consignatario: 'Togo Fresh Foods', navioNome: 'MV Atlantic Star', bloco: 'C', fila: '2', nivel: '1', dataEntrada: '2026-06-24', dataSaida: '2026-06-27', status: 'Liberado', peso: 18500, selo: 'SL-2026-003', condicao: 'Bom' },
];

export const seedFaturas = [
  { id: 1, numFatura: 'FAT-2026-00001', cliente: 'Lomé Comércio Lda.', nif: 'TG-NIF-123456', descricao: 'Serviço de armazenagem - Container MSCU1234567', valorTotal: 35000, valorExtenso: 'Trinta e cinco mil francos CFA', formaPagamento: 'Tesouraria', status: 'Paga', dataEmissao: '2026-06-26', dataVencimento: '2026-07-26', dataPagamento: '2026-06-28', navioNome: 'MV Atlantic Star', numBL: 'BL-ATL-2026-001', tipoServico: 'Armazenagem' },
  { id: 2, numFatura: 'FAT-2026-00002', cliente: 'Sahel Motors', nif: 'TG-NIF-789012', descricao: 'Serviço de estiva e pesagem - Container SGAU7654321', valorTotal: 175000, valorExtenso: 'Cento e setenta e cinco mil francos CFA', formaPagamento: 'Banco', status: 'Emitida', dataEmissao: '2026-06-27', dataVencimento: '2026-07-27', dataPagamento: null, navioNome: 'MV Sahel Explorer', numBL: 'BL-SAH-2026-001', tipoServico: 'Estiva' },
  { id: 3, numFatura: 'FAT-2026-00003', cliente: 'West Africa Trading Co.', nif: 'TG-NIF-345678', descricao: 'Serviço de atracagem - MV Atlantic Star', valorTotal: 520000, valorExtenso: 'Quinhentos e vinte mil francos CFA', formaPagamento: 'Banco', status: 'Vencida', dataEmissao: '2026-05-15', dataVencimento: '2026-06-15', dataPagamento: null, navioNome: 'MV Atlantic Star', numBL: null, tipoServico: 'Atracagem' },
];

export const seedNotificacoes = [
  { id: 1, titulo: 'Navio MV Africa Pioneer notificado', mensagem: 'O navio MV Africa Pioneer foi notificado para atracagem no Cais 4. Chegada prevista: 30/06/2026.', tipo: 'Atracagem', destinatario: 'Todos', lida: false, referencia: 'ATR-004', modulo: 'Atracagem', dataCriacao: '2026-06-28T09:00' },
  { id: 2, titulo: 'Manutenção programada - Empilhadeira EF-03', mensagem: 'A Empilhadeira EF-03 entrou em manutenção preventiva. Previsão de retorno: 3 dias.', tipo: 'Alerta', destinatario: 'Equipa Equipamentos', lida: false, referencia: 'EQ-EF03', modulo: 'Equipamentos', dataCriacao: '2026-06-27T14:30' },
  { id: 3, titulo: 'Fatura FAT-2026-00003 vencida', mensagem: 'A fatura FAT-2026-00003 do cliente West Africa Trading Co. encontra-se vencida desde 15/06/2026. Valor: 520.000 XOF.', tipo: 'Urgente', destinatario: 'Tesouraria', lida: true, referencia: 'FAT-2026-00003', modulo: 'Faturação', dataCriacao: '2026-06-26T08:00' },
];

export const seedNoticias = [
  { id: 1, titulo: 'Porto Cais inaugura novo terminal de contentores', resumo: 'O novo terminal de contentores aumenta a capacidade do porto em 40%, permitindo receber navios de grande porte e impulsionando o comércio regional.', imagem: null, data: '2026-06-20', publicada: true, conteudo: 'O Porto Cais inaugurou oficialmente o seu novo terminal de contentores, uma infraestrutura moderna que representa um investimento significativo na modernização das operações portuárias.' },
  { id: 2, titulo: 'Sistema de pesagem automática já em funcionamento', resumo: 'As novas báscolas digitais calibradas internacionalmente estão operacionais, oferecendo maior precisão e rapidez nos processos de pesagem.', imagem: null, data: '2026-06-15', publicada: true, conteudo: 'O porto implementou um sistema de pesagem totalmente digital com báscolas calibradas segundo padrões internacionais.' },
];

export const seedFAQs = [
  { id: 1, pergunta: 'Como solicitar a atracagem de um navio?', resposta: 'O agente marítimo deve notificar a administração portuária com antecedência mínima de 48 horas, indicando o tipo de navio, calado, comprimento e natureza da carga. A solicitação é analisada e, uma vez aprovada, o cais é designado.', ativa: true },
  { id: 2, pergunta: 'Quais são os horários de operação do porto?', resposta: 'O porto opera 24 horas por dia, 7 dias por semana, com turnos organizados: Manhã (06h-14h), Tarde (14h-22h) e Noite (22h-06h). A administração funciona de segunda a sexta, das 08h às 17h.', ativa: true },
  { id: 3, pergunta: 'Como funciona o serviço de pesagem?', resposta: 'A pesagem é realizada em báscolas calibradas. O camião entra na báscola para obter o peso bruto, é descarregado, e uma segunda pesagem determina a tara. O peso líquido é calculado automaticamente. Um ticket oficial é emitido para cada operação.', ativa: true },
  { id: 4, pergunta: 'Qual é o prazo de armazenagem gratuita?', resposta: 'A armazenagem gratuita é de 15 dias corridos a partir da descarga do navio. Após este período, são aplicadas taxas diárias conforme o tipo de mercadoria e zona de armazenagem. Consulte a tabela de tarifas no balcão de atendimento.', ativa: true },
];

export const seedEscalas = [
  { id: 1, tipo: 'Estivadores Efetivos', navioId: 1, navioNome: 'MV Atlantic Star', data: '2026-06-26', turno: 'Manhã 06h-14h', funcionarios: ['Kwame Adjo', 'Paulo Silva', 'André Koffi'], chefeEquipa: 'Kwame Adjo', status: 'Concluída' },
  { id: 2, tipo: 'Conferentes', navioId: 1, navioNome: 'MV Atlantic Star', data: '2026-06-26', turno: 'Manhã 06h-14h', funcionarios: ['Akouvi Mensah'], chefeEquipa: 'Akouvi Mensah', status: 'Concluída' },
  { id: 3, tipo: 'Estivadores Efetivos', navioId: 1, navioNome: 'MV Atlantic Star', data: '2026-06-27', turno: 'Tarde 14h-22h', funcionarios: ['Kwame Adjo', 'Paulo Silva'], chefeEquipa: 'Kwame Adjo', status: 'Programada' },
];

export const seedFiscalizacoes = [
  { id: 1, numAuto: 'FIS-2026-00001', tipo: 'Inspeção de Segurança', local: 'Cais 1 - Terminal Principal', dataHora: '2026-06-25T10:00', fiscalResponsavel: 'Yao Agbeko', navioNome: 'MV Atlantic Star', descricao: 'Inspeção de segurança de rotina no cais 1 durante operações de descarga', resultado: 'Conforme', acoesCorretivas: null, prazoRegularizacao: null },
  { id: 2, numAuto: 'FIS-2026-00002', tipo: 'Ambiental', local: 'Zona de Armazenagem B', dataHora: '2026-06-26T14:30', fiscalResponsavel: 'Yao Agbeko', navioNome: null, descricao: 'Verificação de conformidade ambiental na zona de armazenagem de produtos químicos', resultado: 'Não Conforme', acoesCorretivas: 'Instalar barreiras de contenção adicionais e verificar sistema de drenagem', prazoRegularizacao: '2026-07-10' },
];

export const seedCompras = [
  { id: 1, numRequisicao: 'REQ-2026-00001', departamento: 'Operações', descricao: 'Cabos de aço para gruas - 200m', fornecedor: 'Materiais Marítimos Lda.', valorEstimado: 450000, status: 'Aprovada', dataSolicitacao: '2026-06-20', dataAprovacao: '2026-06-22', dataEntrega: null, aprovadoPor: 'Diretor de Operações', urgencia: 'Normal' },
  { id: 2, numRequisicao: 'REQ-2026-00002', departamento: 'Administração', descricao: 'Material de escritório e toners de impressora', fornecedor: 'Papelaria Central', valorEstimado: 85000, status: 'Entregue', dataSolicitacao: '2026-06-15', dataAprovacao: '2026-06-16', dataEntrega: '2026-06-23', aprovadoPor: 'Chefe Administrativo', urgencia: 'Normal' },
];

export const seedAudiencias = [
  { id: 1, titulo: 'Reunião com agentes marítimos', tipo: 'Reunião', dataHora: '2026-06-28T10:00', local: 'Sala de Conferências', participantes: 'Diretor Geral, Agentes Marítimos, Chefes de Departamento', descricao: 'Reunião trimestral com os agentes marítimos para discutir melhorias nos serviços', status: 'Programada', notas: '' },
  { id: 2, titulo: 'Audiência com Ministério dos Transportes', tipo: 'Audiência', dataHora: '2026-07-02T09:00', local: 'Gabinete do Diretor Geral', participantes: 'Diretor Geral, Representantes do Ministério', descricao: 'Discussão sobre o plano de expansão portuária', status: 'Programada', notas: '' },
];

export const seedCorrespondencias = [
  { id: 1, numReferencia: 'CORR-2026-00001', tipo: 'Entrada', remetente: 'Ministério dos Transportes', destinatario: 'Direção Geral', assunto: 'Plano de expansão portuária - Fase 2', data: '2026-06-20', status: 'Recebida', urgencia: 'Normal', observacoes: 'Documento requer resposta até 15/07/2026' },
  { id: 2, numReferencia: 'CORR-2026-00002', tipo: 'Saída', remetente: 'Direção Geral', destinatario: 'Autoridade Marítima Nacional', assunto: 'Relatório mensal de operações - Maio 2026', data: '2026-06-05', status: 'Enviada', urgencia: 'Normal', observacoes: null },
];

export const seedDespachos = [
  { id: 1, numDespacho: 'DSP-2026-00001', assunto: 'Autorização de horas extras para equipa de estiva', descricao: 'Autorizar horas extras para a equipa de estiva durante a operação do MV Atlantic Star', responsavel: 'Chefe de Operações', status: 'Concluído', prioridade: 'Urgente', dataCriacao: '2026-06-25' },
];

export const seedAutorizacoesCredito = [
  { id: 1, numAutorizacao: 'AC-2026-00001', beneficiario: 'Materiais Marítimos Lda.', valor: 450000, descricao: 'Autorização de crédito para aquisição de cabos de aço', status: 'Aprovada', dataCriacao: '2026-06-22' },
];

export const seedIsencoes = [
  { id: 1, numIsencao: 'ISN-2026-00001', beneficiario: 'ONG Humanitária Africa Aid', tipo: 'Armazenagem', motivo: 'Carga humanitária - Material médico para zona de crise', valorIsento: 125000, status: 'Aprovada', dataSolicitacao: '2026-06-18' },
];

export const seedCompromissos = [
  { id: 1, titulo: 'Reunião de Planeamento Estratégico', dataHora: '2026-06-29T11:00', local: 'Sala Executiva', participantes: 'Diretor Geral, Chefes de Departamento', status: 'Programado', descricao: 'Alinhar prioridades de investimento para o próximo trimestre.' },
];

export const seedContatos = [];

export const seedServicos = [
  { id: 1, titulo: 'Atracagem de Navios', descricao: 'Gestão de atracagem e desatracagem com cais modernos e rebocadores de alta capacidade.', icone: 'Ship', ativo: true },
  { id: 2, titulo: 'Armazenagem', descricao: 'Armazéns cobertos, descobertos, frigoríficos e para mercadorias perigosas com monitorização 24/7.', icone: 'Warehouse', ativo: true },
  { id: 3, titulo: 'Serviço de Pesagem', descricao: 'Báscolas digitais calibradas com emissão automática de tickets e integração direta com a faturação.', icone: 'Scale', ativo: true },
  { id: 4, titulo: 'Fiscalização', descricao: 'Inspeções de segurança, ambientais e documentais rigorosas por equipas especializadas.', icone: 'Shield', ativo: true },
];

export const seedVideos = [
  { id: 1, titulo: 'Vídeo Institucional', url: 'https://example.com/video1.mp4', descricao: 'Conheça as operações do Porto Cais.', ativo: true },
];

export const seedEmpresa = [
  { id: 1, nome: 'Porto Cais S.A.', nif: 'TG-NIF-000001', endereco: 'Avenida da República, Lomé', email: 'geral@portocais.tg', telefone: '+228 22 23 45 67', logo: null }
];

export const seedUtilizadores = [
  { id: 1, nome: 'Admin Principal', email: 'admin@portocais.tg', perfil: 'Administrador', ativo: true },
  { id: 2, nome: 'João Mensah', email: 'jmensah@portocais.tg', perfil: 'Operador', ativo: true },
];

// Mapa de todas as sementes por entidade
export const allSeeds = {
  navios: seedNavios,
  atracagens: seedAtracagens,
  armazens: seedArmazens,
  equipamentos: seedEquipamentos,
  funcionarios: seedFuncionarios,
  reformas: seedReformas,
  manifestos: seedManifestos,
  bls: seedBLs,
  pesagens: seedPesagens,
  containers: seedContainers,
  faturas: seedFaturas,
  notificacoes: seedNotificacoes,
  noticias: seedNoticias,
  faqs: seedFAQs,
  escalas: seedEscalas,
  fiscalizacoes: seedFiscalizacoes,
  compras: seedCompras,
  pagamentos: seedPagamentos,
  pontos: seedPontos,
  audiencias: seedAudiencias,
  correspondencias: seedCorrespondencias,
  compromissos: seedCompromissos,
  despachos: seedDespachos,
  autorizacoesCredito: seedAutorizacoesCredito,
  isencoes: seedIsencoes,
  contatos: seedContatos,
  servicos: seedServicos,
  videos: seedVideos,
  empresa: seedEmpresa,
  utilizadores: seedUtilizadores,
};

// ============================================================
// Porto Cais — Biblioteca de Utilitários Portuários
// ============================================================

// ---- Valor por Extenso (Português) ----

const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const especiais = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezasseis', 'dezassete', 'dezoito', 'dezanove'];
const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function converterGrupo(n) {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  let resultado = '';
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const d = Math.floor(resto / 10);
  const u = resto % 10;

  if (c > 0) {
    resultado += centenas[c];
    if (resto > 0) resultado += ' e ';
  }

  if (d === 1) {
    resultado += especiais[u];
  } else {
    if (d > 1) {
      resultado += dezenas[d];
      if (u > 0) resultado += ' e ';
    }
    if (u > 0) {
      resultado += unidades[u];
    }
  }

  return resultado;
}

export function numeroParaExtenso(valor) {
  if (valor === 0) return 'zero francos CFA';
  if (valor < 0) return 'menos ' + numeroParaExtenso(-valor);

  const inteiro = Math.floor(valor);
  const partes = [];
  const escalas = [
    { divisor: 1000000000000, singular: 'trilião', plural: 'triliões' },
    { divisor: 1000000000, singular: 'bilião', plural: 'biliões' },
    { divisor: 1000000, singular: 'milhão', plural: 'milhões' },
    { divisor: 1000, singular: 'mil', plural: 'mil' },
    { divisor: 1, singular: '', plural: '' },
  ];

  let resto = inteiro;
  for (const escala of escalas) {
    const grupo = Math.floor(resto / escala.divisor);
    resto = resto % escala.divisor;

    if (grupo > 0) {
      const texto = converterGrupo(grupo);
      if (escala.divisor === 1) {
        partes.push(texto);
      } else if (grupo === 1 && escala.divisor === 1000) {
        partes.push('mil');
      } else if (grupo === 1) {
        partes.push(`${texto} ${escala.singular}`);
      } else {
        partes.push(`${texto} ${escala.plural}`);
      }
    }
  }

  let extenso = partes.join(' ');
  extenso = extenso.charAt(0).toUpperCase() + extenso.slice(1);
  return `${extenso} francos CFA`;
}

// ---- Regra de Pagamento Bancária ----

export function determinarFormaPagamento(valor) {
  return valor <= 50000 ? 'Tesouraria' : 'Banco';
}

// ---- Formatação de Moeda ----

export function formatarMoeda(valor) {
  if (valor == null || isNaN(valor)) return '0 XOF';
  return new Intl.NumberFormat('pt-PT').format(valor) + ' XOF';
}

// ---- Ano Corrente (Forçado para 2026) ----

export function getCurrentYear() {
  return 2026;
}

// ---- Geração de Números Sequenciais ----

export function gerarNumero(prefixo, sequencia) {
  const ano = getCurrentYear();
  const seq = String(sequencia).padStart(5, '0');
  return `${prefixo}-${ano}-${seq}`;
}

// ---- Cores de Status ----

const statusColors = {
  // Atracagem
  'Notificado': 'bg-violet-100 text-violet-800',
  'Aprovado': 'bg-blue-100 text-blue-800',
  'Atracado': 'bg-sky-100 text-sky-800',
  'Em Operação': 'bg-amber-100 text-amber-800',
  'Desatracado': 'bg-green-100 text-green-800',

  // Navios
  'Esperado': 'bg-violet-100 text-violet-800',
  'Partiu': 'bg-gray-100 text-gray-800',

  // Geral
  'Ativo': 'bg-green-100 text-green-800',
  'Inativo': 'bg-gray-100 text-gray-800',
  'Operacional': 'bg-green-100 text-green-800',
  'Em Manutenção': 'bg-amber-100 text-amber-800',
  'Avariado': 'bg-red-100 text-red-800',

  // BL / Conferência
  'Pendente': 'bg-amber-100 text-amber-800',
  'Em Conferência': 'bg-blue-100 text-blue-800',
  'Conferido OK': 'bg-green-100 text-green-800',
  'Divergência': 'bg-red-100 text-red-800',

  // Manifestos
  'Registrado': 'bg-violet-100 text-violet-800',
  'Conferido': 'bg-green-100 text-green-800',
  'Fechado': 'bg-gray-100 text-gray-800',

  // Pesagem
  'Primeira Pesagem': 'bg-amber-100 text-amber-800',
  'Segunda Pesagem': 'bg-blue-100 text-blue-800',
  'Concluída': 'bg-green-100 text-green-800',

  // Faturação
  'Emitida': 'bg-blue-100 text-blue-800',
  'Paga': 'bg-green-100 text-green-800',
  'Parcialmente Paga': 'bg-amber-100 text-amber-800',
  'Cancelada': 'bg-red-100 text-red-800',
  'Vencida': 'bg-red-100 text-red-800',

  // Compras
  'Solicitada': 'bg-violet-100 text-violet-800',
  'Em Análise': 'bg-amber-100 text-amber-800',
  'Aprovada': 'bg-blue-100 text-blue-800',
  'Em Compra': 'bg-sky-100 text-sky-800',
  'Entregue': 'bg-green-100 text-green-800',

  // Escalas
  'Programada': 'bg-violet-100 text-violet-800',
  'Em Andamento': 'bg-amber-100 text-amber-800',

  // Pessoal
  'Férias': 'bg-sky-100 text-sky-800',
  'Licença': 'bg-amber-100 text-amber-800',

  // Containers
  'No Parque': 'bg-blue-100 text-blue-800',
  'Em Trânsito': 'bg-amber-100 text-amber-800',
  'Liberado': 'bg-green-100 text-green-800',
  'Retido': 'bg-red-100 text-red-800',

  // Fiscalização
  'Conforme': 'bg-green-100 text-green-800',
  'Não Conforme': 'bg-red-100 text-red-800',

  // Correspondências
  'Recebida': 'bg-blue-100 text-blue-800',
  'Respondida': 'bg-green-100 text-green-800',
  'Arquivada': 'bg-gray-100 text-gray-800',
  'Enviada': 'bg-sky-100 text-sky-800',

  // Despachos
  'Em Curso': 'bg-amber-100 text-amber-800',
  'Concluído': 'bg-green-100 text-green-800',

  // Autorizações
  'Executada': 'bg-green-100 text-green-800',

  // Urgências
  'Normal': 'bg-gray-100 text-gray-800',
  'Urgente': 'bg-amber-100 text-amber-800',
  'Muito Urgente': 'bg-red-100 text-red-800',

  // Armazéns
  'Disponível': 'bg-green-100 text-green-800',
  'Lotado': 'bg-red-100 text-red-800',

  // Containers condição
  'Bom': 'bg-green-100 text-green-800',
  'Danificado': 'bg-amber-100 text-amber-800',
};

export function getStatusColor(status) {
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

// ---- Ícones de Notificação ----

const notifIcons = {
  'Atracagem': '⚓',
  'Operação': '🔧',
  'Alerta': '⚠️',
  'Informação': 'ℹ️',
  'Urgente': '🚨',
};

export function getNotifIcon(tipo) {
  return notifIcons[tipo] || '📋';
}

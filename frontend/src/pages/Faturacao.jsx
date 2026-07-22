import { useState } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import StatsCard from '../components/shared/StatsCard';
import { useEntity } from '../hooks/useEntity';
import { numeroParaExtenso, determinarFormaPagamento, formatarMoeda, gerarNumero } from '../lib/portUtils';
import { Receipt, CheckCircle2, FileText, Banknote, Building2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Faturacao() {
  const { items, create, update } = useEntity('faturas');
  const [pesquisa, setPesquisa] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalViewAberto, setModalViewAberto] = useState(false);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [faturaAtual, setFaturaAtual] = useState(null);

  // States for new invoice calculation
  const [valorTemp, setValorTemp] = useState('');

  // States for filters
  const [filtros, setFiltros] = useState({
    status: '',
    dataEmissaoInicio: '',
    dataEmissaoFim: '',
    cliente: '',
  });
  
  const filtrados = items.filter(f => 
    f.numFatura.toLowerCase().includes(pesquisa.toLowerCase()) || 
    f.cliente.toLowerCase().includes(pesquisa.toLowerCase()) ||
    f.nif.toLowerCase().includes(pesquisa.toLowerCase())
  );

  const totalEmitido = items.reduce((acc, f) => acc + f.valorTotal, 0);
  const totalPago = items.reduce((acc, f) => acc + (f.status === 'Paga' ? f.valorTotal : 0), 0);
  const totalVencido = items.reduce((acc, f) => acc + (f.status === 'Vencida' ? f.valorTotal : 0), 0);

  const abrirModalNova = () => {
    setValorTemp('');
    setFaturaAtual(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (fatura) => {
    setValorTemp(String(fatura.valorTotal || ''));
    setFaturaAtual(fatura);
    setModalAberto(true);
  };

  const fecharModalFatura = () => {
    setModalAberto(false);
    setFaturaAtual(null);
    setValorTemp('');
  };

  const abrirModalFiltro = () => {
    setModalFiltroAberto(true);
  };

  const fecharModalFiltro = () => {
    setModalFiltroAberto(false);
  };

  const aplicarFiltros = () => {
    const faturasFiltr = items.filter(f => {
      const cumpreStatus = !filtros.status || f.status === filtros.status;
      const cumpreDataInicio = !filtros.dataEmissaoInicio || new Date(f.dataEmissao) >= new Date(filtros.dataEmissaoInicio);
      const cumpreDataFim = !filtros.dataEmissaoFim || new Date(f.dataEmissao) <= new Date(filtros.dataEmissaoFim);
      const cumpreCliente = !filtros.cliente || f.cliente.toLowerCase().includes(filtros.cliente.toLowerCase());
      return cumpreStatus && cumpreDataInicio && cumpreDataFim && cumpreCliente;
    });

    imprimirRelatarioPersonalizado(faturasFiltr);
    fecharModalFiltro();
  };

  const imprimirRelatarioPersonalizado = (faturas) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';
    const totalFaturas = faturas.reduce((acc, f) => acc + f.valorTotal, 0);
    const totalPago = faturas.filter(f => f.status === 'Paga').reduce((acc, f) => acc + f.valorTotal, 0);

    let linhasTabela = faturas.map(f => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.numFatura}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.cliente}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.nif}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarData(f.dataEmissao)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarMoeda(f.valorTotal)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${f.status}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Faturação</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            .cabecalho { margin-bottom: 24px; }
            .titulo { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .subtitulo { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
            .filtros { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            .resumo { display: flex; gap: 24px; margin-bottom: 24px; }
            .card-resumo { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
            .label { font-size: 12px; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
            .valor { font-size: 20px; font-weight: 700; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 700; font-size: 13px; border-bottom: 2px solid #d1d5db; }
            td { padding: 8px; }
            .rodape { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <div class="titulo">Relatório de Faturação</div>
            <div class="subtitulo">Data de emissão: ${formatarData(new Date().toISOString())}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.status ? `Status: ${filtros.status}<br>` : ''}
              ${filtros.dataEmissaoInicio ? `Período: ${formatarData(filtros.dataEmissaoInicio)}` : ''} ${filtros.dataEmissaoFim ? `a ${formatarData(filtros.dataEmissaoFim)}` : ''}<br>
              ${filtros.cliente ? `Cliente: ${filtros.cliente}` : ''}
            </div>
          </div>

          <div class="resumo">
            <div class="card-resumo">
              <div class="label">Total de Faturas</div>
              <div class="valor">${faturas.length}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Valor Total</div>
              <div class="valor">${formatarMoeda(totalFaturas)}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Valor Pago</div>
              <div class="valor">${formatarMoeda(totalPago)}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Pendente</div>
              <div class="valor">${formatarMoeda(totalFaturas - totalPago)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nº Fatura</th>
                <th>Cliente</th>
                <th>NIF</th>
                <th>Data Emissão</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${linhasTabela}
            </tbody>
          </table>

          <div class="rodape">
            <p>Relatório gerado pelo Sistema de Gestão Porto Cais</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const imprimirFatura = (fatura) => {
    const printWindow = window.open('', '_blank', 'width=900,height=900');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy') : '—';
    const conteudo = `
      <html>
        <head>
          <title>Fatura ${fatura.numFatura}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
            .top { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
            .title { font-size:18px; font-weight:700; }
            .cliente { font-size:16px; font-weight:700; }
            .muted { color:#6b7280; font-size:13px; }
            .card { background:#eff6ff; border:1px solid #dbeafe; border-radius:10px; padding:18px; margin-top:12px; }
            .total { font-size:28px; font-weight:800; color:#0ea5e9; }
            .linha { display:flex; justify-content:space-between; margin:6px 0; }
            .pill { display:inline-block; padding:6px 10px; border-radius:999px; background:#fff; border:1px solid #e5e7eb; font-size:13px; }
            .extenso { font-style:italic; }
          </style>
        </head>
        <body>
          <div class="top">
            <div>
              <div class="title">Fatura ${fatura.numFatura}</div>
              <div class="cliente">${fatura.cliente}</div>
              <div class="muted">NIF: ${fatura.nif}</div>
            </div>
            <div class="muted">Status: ${fatura.status}</div>
          </div>

          <div style="display:flex; gap:20px;">
            <div style="flex:1;">
              <div style="margin-bottom:8px;"><strong>Serviço / Descrição</strong></div>
              <div class="muted">${fatura.tipoServico}</div>
              <div style="margin-top:6px;">${fatura.descricao}</div>
            </div>
            <div style="width:220px;">
              <div style="margin-bottom:8px;" class="muted">Datas</div>
              <div class="linha"><span class="muted">Emissão</span><span>${formatarData(fatura.dataEmissao)}</span></div>
              <div class="linha"><span class="muted">Vencimento</span><span style="color:#ef4444;">${formatarData(fatura.dataVencimento)}</span></div>
            </div>
          </div>

          <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div><strong>Total a Pagar</strong></div>
              <div class="total">${formatarMoeda(fatura.valorTotal)}</div>
            </div>
            <div style="border-top:1px solid #dbeafe; margin-top:12px; padding-top:10px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div class="muted">Valor por Extenso:</div>
                <div class="extenso">${fatura.valorExtenso || ''}</div>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                <div class="muted">Regra de Pagamento:</div>
                <div class="pill">${fatura.formaPagamento || ''}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(conteudo);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const verFatura = (fatura) => {
    setFaturaAtual(fatura);
    setModalViewAberto(true);
  };

  const marcarComoPaga = () => {
    if (!faturaAtual?.id) return;
    update(faturaAtual.id, {
      status: 'Paga',
      dataPagamento: faturaAtual.dataPagamento || new Date().toISOString().split('T')[0],
    });
    setFaturaAtual({ ...faturaAtual, status: 'Paga', dataPagamento: faturaAtual.dataPagamento || new Date().toISOString().split('T')[0] });
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const valor = Number(formData.get('valorTotal'));
    
    const status = formData.get('status') || 'Emitida';
    const dados = {
      cliente: formData.get('cliente'),
      nif: formData.get('nif'),
      descricao: formData.get('descricao'),
      tipoServico: formData.get('tipoServico'),
      valorTotal: valor,
      valorExtenso: numeroParaExtenso(valor),
      formaPagamento: determinarFormaPagamento(valor),
      dataEmissao: formData.get('dataEmissao'),
      dataVencimento: formData.get('dataVencimento'),
      status,
      dataPagamento: status === 'Paga' ? (faturaAtual?.dataPagamento || new Date().toISOString().split('T')[0]) : null,
      navioNome: formData.get('navioNome') || null,
      numBL: formData.get('numBL') || null,
    };

    if (faturaAtual?.id) {
      update(faturaAtual.id, dados);
    } else {
      create({ 
        ...dados, 
        numFatura: gerarNumero('FAT', items.length + 1),
        status: 'Emitida',
        dataPagamento: null,
      });
    }

    fecharModalFatura();
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Faturação" 
        subtitulo="Gestão de faturação e recebimentos" 
        onPrint={abrirModalFiltro}
          textoBotaoImprimir="Imprimir Relatório"
        textoBotao="Nova Fatura"
        onAdd={abrirModalNova}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard titulo="Total Emitido" valor={formatarMoeda(totalEmitido)} icone={Receipt} cor="blue" />
        <StatsCard titulo="Total Recebido (Pago)" valor={formatarMoeda(totalPago)} icone={CheckCircle2} cor="green" />
        <StatsCard titulo="Total Vencido" valor={formatarMoeda(totalVencido)} icone={FileText} cor="red" />
      </div>

      <div className="card p-4">
        <div className="max-w-md mb-4">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar por nº fatura, cliente ou NIF..." />
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nº Fatura</th>
                <th>Cliente / NIF</th>
                <th>Serviço</th>
                <th>Data Emissão</th>
                <th className="text-right">Valor Total</th>
                <th>Pagamento (Regra)</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(f => (
                <tr key={f.id}>
                  <td className="font-medium text-primary whitespace-nowrap">{f.numFatura}</td>
                  <td>
                    <div className="font-medium">{f.cliente}</div>
                    <div className="text-xs text-muted-foreground">NIF: {f.nif}</div>
                  </td>
                  <td>{f.tipoServico}</td>
                  <td>{format(new Date(f.dataEmissao), 'dd/MM/yyyy')}</td>
                  <td className="text-right font-mono font-medium">{formatarMoeda(f.valorTotal)}</td>
                  <td>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-xs font-medium">
                      {f.formaPagamento === 'Tesouraria' ? <Building2 size={12}/> : <Banknote size={12}/>}
                      {f.formaPagamento}
                    </div>
                  </td>
                  <td><StatusBadge status={f.status} /></td>
                  <td className="flex gap-2 items-center">
                    <button onClick={() => abrirModalEditar(f)} className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                      <Edit2 size={14} /> Editar
                    </button>
                    <button onClick={() => verFatura(f)} className="text-sm font-semibold text-muted-foreground hover:underline">
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Criar Fatura */}
      <Modal
        aberto={modalAberto}
        onFechar={fecharModalFatura}
        titulo={faturaAtual ? 'Editar Fatura' : 'Nova Fatura'}
      >
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Cliente</label>
              <input name="cliente" type="text" className="input" defaultValue={faturaAtual?.cliente || ''} required />
            </div>
            <div>
              <label className="label">NIF</label>
              <input name="nif" type="text" className="input" defaultValue={faturaAtual?.nif || ''} required />
            </div>
            <div>
              <label className="label">Tipo de Serviço</label>
              <select name="tipoServico" className="select" defaultValue={faturaAtual?.tipoServico || 'Armazenagem'} required>
                <option>Armazenagem</option>
                <option>Estiva</option>
                <option>Pesagem</option>
                <option>Atracagem</option>
                <option>Reboque</option>
                <option>Outros</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="select" defaultValue={faturaAtual?.status || 'Emitida'} required>
                <option value="Emitida">Emitida</option>
                <option value="Vencida">Vencida</option>
                <option value="Paga">Paga</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Descrição Detalhada</label>
              <textarea name="descricao" className="textarea" rows="2" defaultValue={faturaAtual?.descricao || ''} required></textarea>
            </div>
            <div>
              <label className="label">Data de Emissão</label>
              <input name="dataEmissao" type="date" className="input" required defaultValue={faturaAtual?.dataEmissao || new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="label">Data de Vencimento</label>
              <input name="dataVencimento" type="date" className="input" required defaultValue={faturaAtual?.dataVencimento || ''} />
            </div>
            <div>
              <label className="label">Valor Total (XOF)</label>
              <input 
                name="valorTotal" 
                type="number" 
                className="input font-mono text-lg" 
                required 
                value={valorTemp}
                onChange={e => setValorTemp(e.target.value)}
                defaultValue={faturaAtual?.valorTotal || ''}
              />
            </div>
            <div className="flex flex-col justify-end pb-2">
              {valorTemp && Number(valorTemp) > 0 && (
                <div className="text-sm">
                  <span className="block text-muted-foreground text-xs">Forma Pagamento (Regra Auto)</span>
                  <span className="font-semibold inline-flex items-center gap-1 text-primary">
                    {determinarFormaPagamento(Number(valorTemp)) === 'Tesouraria' ? <Building2 size={14}/> : <Banknote size={14}/>}
                    {determinarFormaPagamento(Number(valorTemp))}
                  </span>
                </div>
              )}
            </div>
            {valorTemp && Number(valorTemp) > 0 && (
              <div className="col-span-2 bg-muted/50 p-3 rounded-lg border border-border text-sm italic">
                <span className="font-semibold not-italic text-foreground">Extenso: </span> 
                {numeroParaExtenso(Number(valorTemp))}
              </div>
            )}
            
            <div className="col-span-2 border-t border-border mt-2 pt-4">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Referências Opcionais</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label text-xs">Navio Associado</label>
                  <input name="navioNome" type="text" className="input" />
                </div>
                <div>
                  <label className="label text-xs">Nº BL Associado</label>
                  <input name="numBL" type="text" className="input" />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={fecharModalFatura} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Emitir Fatura</button>
          </div>
        </form>
      </Modal>

      {/* Modal Ver Fatura */}
      <Modal
        aberto={modalViewAberto}
        onFechar={() => setModalViewAberto(false)}
        titulo={`Fatura ${faturaAtual?.numFatura}`}
      >
        {faturaAtual && (
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-border">
              <div>
                <h3 className="font-bold text-lg">{faturaAtual.cliente}</h3>
                <p className="text-sm text-muted-foreground">NIF: {faturaAtual.nif}</p>
              </div>
              <StatusBadge status={faturaAtual.status} />
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Serviço / Descrição</span>
                <span className="font-medium block">{faturaAtual.tipoServico}</span>
                <span className="text-muted-foreground">{faturaAtual.descricao}</span>
              </div>
              
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Datas</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-muted-foreground text-xs block">Emissão</span>
                    <span className="font-medium">{format(new Date(faturaAtual.dataEmissao), 'dd/MM/yyyy')}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block">Vencimento</span>
                    <span className="font-medium text-rose-600">{format(new Date(faturaAtual.dataVencimento), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-primary/5 border border-primary/20 rounded-xl p-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg">Total a Pagar</span>
                  <span className="font-mono text-2xl font-bold text-primary">{formatarMoeda(faturaAtual.valorTotal)}</span>
                </div>
                
                <div className="space-y-2 text-sm border-t border-primary/10 pt-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valor por Extenso:</span>
                    <span className="font-medium italic text-right max-w-[60%]">{faturaAtual.valorExtenso}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Regra de Pagamento:</span>
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background border border-primary/20 font-medium text-primary">
                      {faturaAtual.formaPagamento === 'Tesouraria' ? <Building2 size={14}/> : <Banknote size={14}/>}
                      {faturaAtual.formaPagamento}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({faturaAtual.formaPagamento === 'Tesouraria' ? '≤ 50k XOF' : '> 50k XOF'})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between gap-3 border-t border-border mt-6">
              <button onClick={() => imprimirFatura(faturaAtual)} className="btn-secondary">
                <FileText size={16} /> Imprimir PDF
              </button>
              
              <div className="flex gap-2">
                <button onClick={() => setModalViewAberto(false)} className="btn-secondary">Fechar</button>
                {faturaAtual.status !== 'Paga' && faturaAtual.status !== 'Cancelada' && (
                  <button onClick={marcarComoPaga} className="btn-success">
                    <CheckCircle2 size={16} /> Marcar como Paga
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Filtro Relatório Personalizado */}
      <Modal
        aberto={modalFiltroAberto}
        onFechar={fecharModalFiltro}
        titulo="Relatório Personalizado - Filtros"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Status da Fatura</label>
            <select 
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Emitida">Emitida</option>
              <option value="Vencida">Vencida</option>
              <option value="Paga">Paga</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data de Emissão - Início</label>
              <input 
                type="date"
                value={filtros.dataEmissaoInicio}
                onChange={(e) => setFiltros({...filtros, dataEmissaoInicio: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="label">Data de Emissão - Fim</label>
              <input 
                type="date"
                value={filtros.dataEmissaoFim}
                onChange={(e) => setFiltros({...filtros, dataEmissaoFim: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Cliente</label>
            <input 
              type="text"
              placeholder="Deixe em branco para não filtrar por cliente"
              value={filtros.cliente}
              onChange={(e) => setFiltros({...filtros, cliente: e.target.value})}
              className="input"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <button type="button" onClick={fecharModalFiltro} className="btn-secondary">
              Cancelar
            </button>
            <button type="button" onClick={aplicarFiltros} className="btn-primary">
              Gerar Relatório
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

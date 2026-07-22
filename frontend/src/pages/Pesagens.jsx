import { useState, useMemo } from 'react';
import PageHeader from '../components/shared/PageHeader';
import SearchInput from '../components/shared/SearchInput';
import StatusBadge from '../components/shared/StatusBadge';
import Modal from '../components/shared/Modal';
import { useEntity } from '../hooks/useEntity';
import { gerarNumero } from '../lib/portUtils';
import { Scale, Truck, User, Printer } from 'lucide-react';
import { format } from 'date-fns';

export default function Pesagens() {
  const { items, create, update } = useEntity('pesagens');
  const { items: navios } = useEntity('navios');
  const [pesquisa, setPesquisa] = useState('');
  const [tabAtiva, setTabAtiva] = useState('Todos');
  const [modalAberto, setModalAberto] = useState(false);
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false);
  const [pesagemAtual, setPesagemAtual] = useState(null);

  // Auto-cálculo
  const [pesoBruto, setPesoBruto] = useState('');
  const [tara, setTara] = useState('');

  // Filtros para relatório
  const [filtros, setFiltros] = useState({
    tipo: '',
    dataInicio: '',
    dataFim: '',
    status: '',
  });
  
  const tabs = ['Todos', "Container 20'", "Container 40'", 'Granel'];

  const pesagensFiltradas = useMemo(() => {
    return items.filter(p => {
      const matchTab = tabAtiva === 'Todos' || p.tipo === tabAtiva;
      const matchSearch = p.numTicket.toLowerCase().includes(pesquisa.toLowerCase()) || 
                          p.placa.toLowerCase().includes(pesquisa.toLowerCase()) ||
                          p.numContainer?.toLowerCase().includes(pesquisa.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [items, pesquisa, tabAtiva]);

  const abrirModal = (pesagem = null) => {
    setPesagemAtual(pesagem);
    setPesoBruto(pesagem?.pesoBruto || '');
    setTara(pesagem?.tara || '');
    setModalAberto(true);
  };

  const handleSalvar = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const pb = Number(formData.get('pesoBruto')) || 0;
    const t = Number(formData.get('tara')) || 0;
    
    const dados = {
      tipo: formData.get('tipo'),
      numContainer: formData.get('numContainer'),
      placa: formData.get('placa'),
      pesoBruto: pb,
      tara: t,
      pesoLiquido: pb - t, // Auto-cálculo
      navioId: Number(formData.get('navioId')),
      navioNome: navios.find(n => n.id === Number(formData.get('navioId')))?.nome || '',
      consignatario: formData.get('consignatario'),
      tipoOperacao: formData.get('tipoOperacao'),
      operador: 'Admin', // User logado na realidade
    };

    if (pesagemAtual?.id) {
      const novoStatus = (pb > 0 && t > 0) ? 'Concluída' : 'Segunda Pesagem';
      update(pesagemAtual.id, { ...dados, status: novoStatus });
    } else {
      create({ 
        ...dados, 
        numTicket: gerarNumero('PES', items.length + 1),
        status: (pb > 0 && t > 0) ? 'Concluída' : 'Primeira Pesagem',
        dataHora: new Date().toISOString()
      });
    }
    setModalAberto(false);
  };

  const abrirModalFiltro = () => {
    setModalFiltroAberto(true);
  };

  const fecharModalFiltro = () => {
    setModalFiltroAberto(false);
  };

  const aplicarFiltros = () => {
    const pesagensFiltr = items.filter(p => {
      const cumpreTipo = !filtros.tipo || p.tipo === filtros.tipo;
      const cumpreDataInicio = !filtros.dataInicio || new Date(p.dataHora) >= new Date(filtros.dataInicio);
      const cumpreDataFim = !filtros.dataFim || new Date(p.dataHora) <= new Date(filtros.dataFim);
      const cumpreStatus = !filtros.status || p.status === filtros.status;
      return cumpreTipo && cumpreDataInicio && cumpreDataFim && cumpreStatus;
    });

    imprimirRelatorioPesagens(pesagensFiltr);
    fecharModalFiltro();
  };

  const imprimirRelatorioPesagens = (pesagensFiltr) => {
    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy HH:mm') : '—';
    const totalPesoBruto = pesagensFiltr.reduce((acc, p) => acc + (p.pesoBruto || 0), 0);
    const totalPesoLiquido = pesagensFiltr.reduce((acc, p) => acc + (p.pesoLiquido || 0), 0);

    let linhasTabela = pesagensFiltr.map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.numTicket}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.tipo}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.placa}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.numContainer || '—'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.pesoBruto}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.tara}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${p.pesoLiquido}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${p.status}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${formatarData(p.dataHora)}</td>
      </tr>
    `).join('');

    const conteudo = `
      <html>
        <head>
          <title>Relatório de Pesagens</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; background: #f8fafc; }
            .cabecalho { margin-bottom: 24px; }
            .titulo { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
            .subtitulo { font-size: 14px; color: #6b7280; margin-bottom: 16px; }
            .filtros { background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
            .resumo { display: flex; gap: 24px; margin-bottom: 24px; flex-wrap: wrap; }
            .card-resumo { flex: 1; min-width: 150px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; background: white; }
            .label { font-size: 12px; color: #6b7280; font-weight: 700; margin-bottom: 4px; }
            .valor { font-size: 20px; font-weight: 700; color: #1f2937; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; background: white; border-radius: 12px; overflow: hidden; }
            th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 700; font-size: 13px; border-bottom: 2px solid #d1d5db; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
            .rodape { margin-top: 32px; font-size: 11px; color: #6b7280; text-align: center; }
          </style>
        </head>
        <body>
          <div class="cabecalho">
            <div class="titulo">Relatório de Pesagens</div>
            <div class="subtitulo">Data de emissão: ${formatarData(new Date().toISOString())}</div>
            <div class="filtros">
              <strong>Filtros Aplicados:</strong><br>
              ${filtros.tipo ? `Tipo: ${filtros.tipo}<br>` : ''}
              ${filtros.dataInicio ? `Período: ${formatarData(filtros.dataInicio)}` : ''} ${filtros.dataFim ? `a ${formatarData(filtros.dataFim)}` : ''}<br>
              ${filtros.status ? `Status: ${filtros.status}` : ''}
            </div>
          </div>

          <div class="resumo">
            <div class="card-resumo">
              <div class="label">Total de Registos</div>
              <div class="valor">${pesagensFiltr.length}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Peso Bruto Total (kg)</div>
              <div class="valor">${totalPesoBruto.toLocaleString('pt-PT')}</div>
            </div>
            <div class="card-resumo">
              <div class="label">Peso Líquido Total (kg)</div>
              <div class="valor">${totalPesoLiquido.toLocaleString('pt-PT')}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Tipo</th>
                <th>Placa</th>
                <th>Contentor</th>
                <th>Peso Bruto</th>
                <th>Tara</th>
                <th>Peso Líquido</th>
                <th>Status</th>
                <th>Data/Hora</th>
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

  const imprimirTicketPesagem = async (p) => {
    const qrText = `PESAGEM:${p.numTicket}|PLACA:${p.placa}|TIPO:${p.tipo}|PESO:${p.pesoLiquido || 0}`;
    let qrDataUrl;

    try {
      const qrcode = await import('qrcode');
      qrDataUrl = await qrcode.toDataURL(qrText, { errorCorrectionLevel: 'H', margin: 1, width: 220 });
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      qrDataUrl = '';
    }

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    if (!printWindow) return;

    const formatarData = (data) => data ? format(new Date(data), 'dd/MM/yyyy HH:mm') : '—';

    const conteudo = `
      <html>
        <head>
          <title>Ticket de Pesagem - ${p.numTicket}</title>
          <style>
            body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #111827; }
            .ticket { max-width: 520px; margin: 0 auto; background: white; border: 1px solid #e5e7eb; border-radius: 24px; padding: 24px; box-shadow: 0 16px 45px rgba(15, 23, 42, 0.08); }
            .brand { font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase; color: #0f172a; font-weight: 700; margin-bottom: 12px; }
            .title { font-size: 24px; font-weight: 800; margin-bottom: 16px; }
            .section { margin-bottom: 20px; }
            .label { display: block; font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
            .value { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 10px; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
            .block { padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; }
            .block strong { display: block; font-size: 14px; margin-bottom: 6px; }
            .block span { font-size: 18px; font-weight: 800; color: #0f172a; }
            .footer { margin-top: 24px; font-size: 12px; color: #64748b; text-align: center; }
            .barcode { text-align: center; margin-top: 18px; }
            .barcode span { display: inline-block; letter-spacing: 0.4em; font-size: 14px; font-weight: 700; color: #0f172a; }
            .qr { margin: 20px auto 0; width: 220px; height: 220px; background: white; padding: 12px; border-radius: 24px; display: block; }
            .qr img { width: 100%; height: 100%; object-fit: contain; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="brand">Sistema de Gestão Porto Cais</div>
            <div class="title">Ticket de Pesagem</div>
            <div class="grid">
              <div class="block">
                <strong>Ticket</strong>
                <span>${p.numTicket}</span>
              </div>
              <div class="block">
                <strong>Data / Hora</strong>
                <span>${formatarData(p.dataHora)}</span>
              </div>
              <div class="block">
                <strong>Tipo</strong>
                <span>${p.tipo}</span>
              </div>
              <div class="block">
                <strong>Status</strong>
                <span>${p.status}</span>
              </div>
            </div>
            <div class="section">
              <div class="label">Placa</div>
              <div class="value">${p.placa}</div>
              <div class="label">Contentor</div>
              <div class="value">${p.numContainer || '—'}</div>
              <div class="label">Operação</div>
              <div class="value">${p.tipoOperacao}</div>
              <div class="label">Consignatário</div>
              <div class="value">${p.consignatario}</div>
            </div>
            <div class="grid">
              <div class="block">
                <strong>Bruto</strong>
                <span>${p.pesoBruto || 0} kg</span>
              </div>
              <div class="block">
                <strong>Tara</strong>
                <span>${p.tara || 0} kg</span>
              </div>
              <div class="block">
                <strong>Líquido</strong>
                <span>${p.pesoLiquido || 0} kg</span>
              </div>
            </div>
            ${qrDataUrl ? `<div class="qr"><img src="${qrDataUrl}" alt="QR Code" /></div>` : ''}
            <div class="barcode"><span>${p.numTicket}</span></div>
            <div class="footer">Documento emitido pelo Sistema de Gestão Porto Cais</div>
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

  const calcLiquido = (b, t) => {
    const v = (Number(b) || 0) - (Number(t) || 0);
    return v > 0 ? v : 0;
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        titulo="Serviço de Báscola" 
        subtitulo="Registo de pesagens de mercadorias" 
        onPrint={abrirModalFiltro}
          textoBotaoImprimir="Imprimir Relatório"
        textoBotao="Nova Pesagem"
        onAdd={() => abrirModal()}
      />

      <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b-0 rounded-b-none">
        <div className="w-full sm:max-w-md">
          <SearchInput value={pesquisa} onChange={setPesquisa} placeholder="Pesquisar ticket, placa ou contentor..." />
        </div>
      </div>
      
      <div className="tabs px-4 bg-card border-x border-b border-border rounded-b-xl -mt-6 pt-2">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`tab ${tabAtiva === tab ? 'active' : ''}`}
            onClick={() => setTabAtiva(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {pesagensFiltradas.map(p => (
          <div key={p.id} className="card p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Scale size={120} />
            </div>
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-primary tracking-wider">{p.numTicket}</span>
                <h3 className="font-bold text-lg mt-1">{p.placa}</h3>
              </div>
              <StatusBadge status={p.status} />
            </div>

            <div className="space-y-3 text-sm mb-6 flex-1">
              <div className="flex justify-between pb-2 border-b border-border border-dashed">
                <span className="text-muted-foreground">Tipo de Carga</span>
                <span className="font-medium">{p.tipo}</span>
              </div>
              {p.numContainer && (
                <div className="flex justify-between pb-2 border-b border-border border-dashed">
                  <span className="text-muted-foreground">Contentor</span>
                  <span className="font-medium">{p.numContainer}</span>
                </div>
              )}
              <div className="flex justify-between pb-2 border-b border-border border-dashed">
                <span className="text-muted-foreground">Operação</span>
                <span className="font-medium">{p.tipoOperacao}</span>
              </div>
              
              <div className="bg-muted p-3 rounded-lg mt-4 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="block text-[10px] uppercase text-muted-foreground font-bold">Bruto</span>
                  <span className="font-mono text-sm">{p.pesoBruto || 0}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-muted-foreground font-bold">Tara</span>
                  <span className="font-mono text-sm">{p.tara || 0}</span>
                </div>
                <div className="text-primary">
                  <span className="block text-[10px] uppercase font-bold">Líquido (Kg)</span>
                  <span className="font-mono text-base font-bold">{p.pesoLiquido || 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-4 border-t border-border">
              <span className="flex items-center gap-1"><User size={14} /> {p.operador}</span>
              <span>{format(new Date(p.dataHora), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            
            <div className="mt-4 grid gap-3">
              <button onClick={() => imprimirTicketPesagem(p)} className="btn-secondary w-full justify-center text-sm py-2 flex items-center justify-center gap-2">
                <Printer size={16} /> Imprimir Ticket
              </button>
              {p.status !== 'Concluída' && (
                <button onClick={() => abrirModal(p)} className="btn-primary w-full justify-center text-sm py-2">
                  Registar {p.status === 'Primeira Pesagem' ? '2ª' : '1ª'} Pesagem
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        titulo={pesagemAtual ? `Atualizar Pesagem - ${pesagemAtual.numTicket}` : 'Nova Pesagem'}
      >
        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo de Carga</label>
              <select name="tipo" className="select" required defaultValue={pesagemAtual?.tipo}>
                <option>Container 20'</option>
                <option>Container 40'</option>
                <option>Granel</option>
                <option>Carga Solta</option>
              </select>
            </div>
            <div>
              <label className="label">Placa do Veículo</label>
              <input name="placa" type="text" className="input uppercase" required defaultValue={pesagemAtual?.placa} placeholder="XX-1234-YY" />
            </div>
            <div>
              <label className="label">Nº Contentor (Opcional)</label>
              <input name="numContainer" type="text" className="input uppercase" defaultValue={pesagemAtual?.numContainer} placeholder="ABCD1234567" />
            </div>
            <div>
              <label className="label">Tipo de Operação</label>
              <select name="tipoOperacao" className="select" required defaultValue={pesagemAtual?.tipoOperacao || 'Importação'}>
                <option>Importação</option>
                <option>Exportação</option>
                <option>Trânsito</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Navio Associado</label>
              <select name="navioId" className="select" required defaultValue={pesagemAtual?.navioId}>
                <option value="">Selecione um navio...</option>
                {navios.filter(n => n.status !== 'Partiu').map(n => (
                  <option key={n.id} value={n.id}>{n.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Consignatário / Cliente</label>
              <input name="consignatario" type="text" className="input" required defaultValue={pesagemAtual?.consignatario} />
            </div>
            
            <div className="col-span-2 bg-primary/5 p-4 rounded-xl border border-primary/20 mt-2">
              <h4 className="font-semibold text-primary mb-3 text-sm uppercase tracking-wider">Dados de Pesagem (Kg)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label text-xs">Peso Bruto</label>
                  <input 
                    name="pesoBruto" 
                    type="number" 
                    className="input font-mono text-right" 
                    value={pesoBruto} 
                    onChange={e => setPesoBruto(e.target.value)}
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="label text-xs">Tara do Veículo</label>
                  <input 
                    name="tara" 
                    type="number" 
                    className="input font-mono text-right" 
                    value={tara} 
                    onChange={e => setTara(e.target.value)}
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="label text-xs text-primary">Peso Líquido</label>
                  <input 
                    type="text" 
                    className="input font-mono text-right bg-transparent font-bold text-primary border-primary" 
                    value={calcLiquido(pesoBruto, tara)} 
                    readOnly 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setModalAberto(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">Guardar e Imprimir Ticket</button>
          </div>
        </form>
      </Modal>

      {/* Modal Filtro Relatório Personalizado */}
      <Modal
        aberto={modalFiltroAberto}
        onFechar={fecharModalFiltro}
        titulo="Relatório Personalizado - Filtros"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Tipo de Carga</label>
            <select 
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Container 20'">Container 20'</option>
              <option value="Container 40'">Container 40'</option>
              <option value="Granel">Granel</option>
              <option value="Carga Solta">Carga Solta</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data - Início</label>
              <input 
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="label">Data - Fim</label>
              <input 
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Status</label>
            <select 
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
              className="select"
            >
              <option value="">Todos</option>
              <option value="Primeira Pesagem">Primeira Pesagem</option>
              <option value="Segunda Pesagem">Segunda Pesagem</option>
              <option value="Concluída">Concluída</option>
            </select>
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

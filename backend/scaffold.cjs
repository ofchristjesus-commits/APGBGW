const fs = require('fs');
const path = require('path');

const pages = [
  'Dashboard', 'Navios', 'Atracagem', 'Escalas', 'Pesagens',
  'Manifestos', 'BLs', 'Armazens', 'ParqueContainers', 'Equipamentos',
  'Fiscalizacao', 'Faturacao', 'Tesouraria', 'Compras', 'Pessoal',
  'Estatisticas', 'Notificacoes', 'Secretaria', 'Diretoria'
];

const dir = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

pages.forEach(page => {
  const file = path.join(dir, `${page}.jsx`);
  if (!fs.existsSync(file)) {
    const content = `import PageHeader from '../components/shared/PageHeader';

export default function ${page}() {
  return (
    <div className="space-y-6">
      <PageHeader titulo="${page}" />
      <div className="card p-6">
        <p className="text-muted-foreground">Módulo em desenvolvimento...</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(file, content);
    console.log(`Created ${page}.jsx`);
  }
});

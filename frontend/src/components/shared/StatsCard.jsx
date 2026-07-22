export default function StatsCard({ titulo, valor, icone: Icone, cor, subtitulo }) {
  const bgMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    violet: 'bg-violet-50 text-violet-600',
    sky: 'bg-sky-50 text-sky-600',
    gray: 'bg-gray-50 text-gray-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  const iconBg = bgMap[cor] || bgMap.blue;

  return (
    <div className="card p-5 card-hover">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium truncate">{titulo}</p>
          <p className="text-2xl font-bold mt-1 text-card-foreground">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-muted-foreground mt-1">{subtitulo}</p>
          )}
        </div>
        {Icone && (
          <div className={`p-2.5 rounded-lg ${iconBg}`}>
            <Icone size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

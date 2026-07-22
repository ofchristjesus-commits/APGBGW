import { Inbox } from 'lucide-react';

export default function EmptyState({ mensagem, icone: Icone }) {
  const Icon = Icone || Inbox;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-muted mb-4">
        <Icon size={32} className="text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">
        {mensagem || 'Nenhum registo encontrado'}
      </p>
    </div>
  );
}

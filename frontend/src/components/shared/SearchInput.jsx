import { Search } from 'lucide-react';

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        className="input pl-9"
        placeholder={placeholder || 'Pesquisar...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

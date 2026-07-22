export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
    </div>
  );
}

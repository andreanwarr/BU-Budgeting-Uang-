import { Plus } from 'lucide-react';

interface QuickTransactionButtonProps {
  onClick: () => void;
}

export function QuickTransactionButton({ onClick }: QuickTransactionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group active:scale-95"
      aria-label="Quick add transaction"
    >
      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
    </button>
  );
}

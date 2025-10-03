import { type Rating } from '../db/schema';

interface GradeBarProps {
  onGrade: (rating: Rating) => void;
  disabled?: boolean;
}

export function GradeBar({ onGrade, disabled = false }: GradeBarProps) {
  const buttons: Array<{ rating: Rating; label: string; color: string; key: string }> = [
    { rating: 'again', label: 'Again', color: 'bg-red-500 hover:bg-red-600', key: '1' },
    { rating: 'hard', label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600', key: '2' },
    { rating: 'good', label: 'Good', color: 'bg-green-500 hover:bg-green-600', key: '3' },
    { rating: 'easy', label: 'Easy', color: 'bg-blue-500 hover:bg-blue-600', key: '4' },
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-6">
      <div className="grid grid-cols-4 gap-2">
        {buttons.map((btn) => (
          <button
            key={btn.rating}
            onClick={() => onGrade(btn.rating)}
            disabled={disabled}
            className={`
              ${btn.color}
              text-white font-semibold py-4 px-3 rounded-lg
              shadow-md transition-all duration-150
              active:scale-95
              disabled:opacity-50 disabled:cursor-not-allowed
              min-h-[44px] text-sm sm:text-base
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500
            `}
            aria-label={`Grade as ${btn.label} (Press ${btn.key})`}
          >
            <div className="flex flex-col items-center">
              <span>{btn.label}</span>
              <span className="text-xs opacity-75">{btn.key}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

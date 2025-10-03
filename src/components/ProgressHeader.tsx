interface ProgressHeaderProps {
  current: number;
  total: number;
  dueCount?: number;
}

export function ProgressHeader({ current, total, dueCount }: ProgressHeaderProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full bg-white shadow-sm border-b border-gray-200 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {current} / {total} cards
          </span>
          {dueCount !== undefined && (
            <span className="text-sm text-gray-500">{dueCount} due</span>
          )}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

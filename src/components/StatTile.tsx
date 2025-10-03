interface StatTileProps {
  label: string;
  value: number | string;
  color?: 'blue' | 'green' | 'purple' | 'red' | 'orange';
}

export function StatTile({ label, value, color = 'blue' }: StatTileProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div
      className={`
        ${colorClasses[color]}
        rounded-lg p-4 border-2 text-center
      `}
    >
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}

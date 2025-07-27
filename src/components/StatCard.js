import { formatNumber } from '../utils/helpers';

export default function StatCard({ title, value, change, icon }) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          {icon}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatTile } from '../components/StatTile';
import { getDueCount, getTodayStats, type TodayStats } from '../services/reviewService';

export function Home() {
  const navigate = useNavigate();
  const [dueCount, setDueCount] = useState(0);
  const [stats, setStats] = useState<TodayStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [due, todayStats] = await Promise.all([getDueCount(), getTodayStats()]);
      setDueCount(due);
      setStats(todayStats);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  const accuracy =
    stats && stats.reviewed > 0
      ? Math.round(
          ((stats.goodCount + stats.easyCount) / stats.reviewed) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TagalogFlash</h1>
          <p className="text-gray-600">Master Tagalog vocabulary with spaced repetition</p>
        </div>

        {/* Main CTA */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/review')}
            disabled={dueCount === 0}
            className={`
              w-full py-6 px-8 rounded-2xl font-bold text-xl shadow-lg
              transition-all duration-200
              ${
                dueCount > 0
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {dueCount > 0 ? (
              <>
                Start Review
                <span className="block text-sm font-normal mt-1">
                  {dueCount} card{dueCount !== 1 ? 's' : ''} due
                </span>
              </>
            ) : (
              <>
                No cards due
                <span className="block text-sm font-normal mt-1">
                  Great job! Come back later
                </span>
              </>
            )}
          </button>
        </div>

        {/* Today's Stats */}
        {stats && stats.reviewed > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Today's Progress</h2>
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Reviewed" value={stats.reviewed} color="blue" />
              <StatTile label="Accuracy" value={`${accuracy}%`} color="green" />
            </div>

            {/* Recall Distribution */}
            <div className="mt-4 p-4 bg-white rounded-lg shadow">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Recall Distribution</h3>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div>
                  <div className="text-red-600 font-bold">{stats.againCount}</div>
                  <div className="text-gray-500">Again</div>
                </div>
                <div>
                  <div className="text-orange-600 font-bold">{stats.hardCount}</div>
                  <div className="text-gray-500">Hard</div>
                </div>
                <div>
                  <div className="text-green-600 font-bold">{stats.goodCount}</div>
                  <div className="text-gray-500">Good</div>
                </div>
                <div>
                  <div className="text-blue-600 font-bold">{stats.easyCount}</div>
                  <div className="text-gray-500">Easy</div>
                </div>
              </div>
            </div>

            {stats.leechCount > 0 && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ {stats.leechCount} leech{stats.leechCount !== 1 ? 'es' : ''} detected
                  (difficult cards)
                </p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">Quick Actions</h2>
          <button
            onClick={() => navigate('/decks')}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow border border-gray-200 transition-colors"
          >
            Browse Decks
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg shadow border border-gray-200 transition-colors"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { awsApiClient } from '../services/awsApiClient';
import type { SnapshotCalculateResponse } from '../types/api';
import { AWS_REGIONS } from '../constants';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function SnapshotCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SnapshotCalculateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState('us-east-1');
  const [volumeSizeGB, setVolumeSizeGB] = useState(500);
  const [usedPercent, setUsedPercent] = useState(70);
  const [dailyChangePercent, setDailyChangePercent] = useState(5);
  const [retentionDays, setRetentionDays] = useState(30);
  const [storageType, setStorageType] = useState<'standard' | 'archive'>('standard');
  const [compressionFactor, setCompressionFactor] = useState(1.0);

  const calculateCost = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await awsApiClient.calculateSnapshots(
        region,
        volumeSizeGB,
        usedPercent,
        dailyChangePercent,
        retentionDays,
        storageType,
        compressionFactor
      );

      console.log('Snapshot API response:', response);

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || `API returned success: ${response.success}. Check console for details.`);
      }
    } catch (err) {
      console.error('Snapshot calculation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Snapshot Configuration
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Volume Size (GB)
                </label>
                <input
                  type="number"
                  min="1"
                  value={volumeSizeGB}
                  onChange={(e) => setVolumeSizeGB(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Used Space: {usedPercent}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={usedPercent}
                  onChange={(e) => setUsedPercent(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daily Change Rate: {dailyChangePercent}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={dailyChangePercent}
                  onChange={(e) => setDailyChangePercent(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Retention Period: {retentionDays} days
                </label>
                <input
                  type="range"
                  min="1"
                  max="365"
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>1 day</span>
                  <span>1 year</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Storage Type
                </label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="archive">Archive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Compression Factor
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={compressionFactor}
                  onChange={(e) => setCompressionFactor(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Higher values indicate better compression (1.0 = no compression)
                </p>
              </div>
            </div>

            <button
              onClick={calculateCost}
              disabled={loading}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  Calculate Cost
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {result && (
            <>
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <h3 className="text-sm font-medium opacity-90 mb-2">Estimated Monthly Cost</h3>
                <p className="text-4xl font-bold">{formatCurrency(result.summary.monthly)}</p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-sm opacity-90">Annual Projection</p>
                  <p className="text-2xl font-semibold">{formatCurrency(result.summary.yearly)}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Storage Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">First Snapshot</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {result.breakdown.firstSnapshot.sizeGB.toFixed(2)} GB ({formatCurrency(result.breakdown.firstSnapshot.monthly)}/mo)
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Incremental Snapshots</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {result.breakdown.incrementalSnapshots.totalSizeGB.toFixed(2)} GB ({formatCurrency(result.breakdown.incrementalSnapshots.monthly)}/mo)
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Total Storage</span>
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {result.breakdown.total.sizeGB.toFixed(2)} GB
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Configuration Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Volume Size:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{volumeSizeGB} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Used Space:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{usedPercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Daily Change:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{dailyChangePercent}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Retention:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{retentionDays} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Storage Type:</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{storageType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Price per GB:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(result.pricing.pricePerGBMonth)}/GB/mo</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Database, Loader2 } from 'lucide-react';
import { awsApiClient } from '../services/awsApiClient';
import type { RDSCalculateRequest, RDSCalculateResponse } from '../types/api';
import { CostBreakdownCard } from '../components/CostBreakdownCard';
import { AWS_REGIONS, INSTANCE_TYPES } from '../constants';

export function RDSCalculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RDSCalculateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState('us-east-1');
  const [instanceType, setInstanceType] = useState('db.t3.medium');
  const [quantity, setQuantity] = useState(1);
  const [engine, setEngine] = useState<'MySQL' | 'PostgreSQL' | 'Aurora MySQL' | 'Aurora PostgreSQL' | 'MariaDB'>('MySQL');
  const [deploymentOption, setDeploymentOption] = useState<'Single-AZ' | 'Multi-AZ'>('Single-AZ');
  const [pricingModel, setPricingModel] = useState<'on-demand' | 'reserved'>('on-demand');
  const [reservedTerm, setReservedTerm] = useState<'1yr' | '3yr'>('1yr');
  const [paymentOption, setPaymentOption] = useState<'No Upfront' | 'Partial Upfront' | 'All Upfront'>('No Upfront');

  const [storageType, setStorageType] = useState<'gp3' | 'gp2' | 'io1' | 'magnetic'>('gp3');
  const [allocatedGB, setAllocatedGB] = useState(100);
  const [iops, setIops] = useState(3000);

  const [backupEnabled, setBackupEnabled] = useState(false);
  const [retentionDays, setRetentionDays] = useState(7);
  const [dailyChangePercent, setDailyChangePercent] = useState(5);
  const [manualSnapshotCount, setManualSnapshotCount] = useState(0);
  const [manualSnapshotSize, setManualSnapshotSize] = useState(0);

  const calculateCost = async () => {
    setLoading(true);
    setError(null);

    const request: RDSCalculateRequest = {
      region,
      instance: {
        type: instanceType,
        quantity,
        engine,
        deploymentOption,
        pricingModel,
        ...(pricingModel === 'reserved' && { reservedTerm, paymentOption }),
      },
      storage: {
        type: storageType,
        allocatedGB,
        ...(storageType !== 'magnetic' && storageType !== 'gp2' && { iops }),
      },
      ...(backupEnabled && {
        backup: {
          retentionDays,
          dailyChangePercent,
          ...(manualSnapshotCount > 0 && {
            manualSnapshots: {
              count: manualSnapshotCount,
              sizeGB: manualSnapshotSize,
            },
          }),
        },
      }),
    };

    try {
      const response = await awsApiClient.calculateRDS(request);
      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || 'Failed to calculate costs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              RDS Instance Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instance Type</label>
                <select
                  value={instanceType}
                  onChange={(e) => setInstanceType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INSTANCE_TYPES.rds.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Engine</label>
                <select
                  value={engine}
                  onChange={(e) => setEngine(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MySQL">MySQL</option>
                  <option value="PostgreSQL">PostgreSQL</option>
                  <option value="Aurora MySQL">Aurora MySQL</option>
                  <option value="Aurora PostgreSQL">Aurora PostgreSQL</option>
                  <option value="MariaDB">MariaDB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deployment</label>
                <select
                  value={deploymentOption}
                  onChange={(e) => setDeploymentOption(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Single-AZ">Single-AZ</option>
                  <option value="Multi-AZ">Multi-AZ</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pricing Model</label>
                <select
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="on-demand">On-Demand</option>
                  <option value="reserved">Reserved Instance</option>
                </select>
              </div>

              {pricingModel === 'reserved' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reserved Term</label>
                    <select
                      value={reservedTerm}
                      onChange={(e) => setReservedTerm(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1yr">1 Year</option>
                      <option value="3yr">3 Years</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Option</label>
                    <select
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="No Upfront">No Upfront</option>
                      <option value="Partial Upfront">Partial Upfront</option>
                      <option value="All Upfront">All Upfront</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Storage Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Storage Type</label>
                <select
                  value={storageType}
                  onChange={(e) => setStorageType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gp3">gp3</option>
                  <option value="gp2">gp2</option>
                  <option value="io1">io1 (Provisioned IOPS)</option>
                  <option value="magnetic">Magnetic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allocated Storage (GB)</label>
                <input
                  type="number"
                  min="20"
                  value={allocatedGB}
                  onChange={(e) => setAllocatedGB(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {(storageType === 'gp3' || storageType === 'io1') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IOPS</label>
                  <input
                    type="number"
                    min="1000"
                    value={iops}
                    onChange={(e) => setIops(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="backup"
                checked={backupEnabled}
                onChange={(e) => setBackupEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="backup" className="text-xl font-semibold text-gray-900 dark:text-white">
                Backup Configuration
              </label>
            </div>

            {backupEnabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Retention Days</label>
                    <input
                      type="number"
                      min="1"
                      max="35"
                      value={retentionDays}
                      onChange={(e) => setRetentionDays(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Daily Change %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={dailyChangePercent}
                      onChange={(e) => setDailyChangePercent(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Manual Snapshots (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Snapshot Count</label>
                      <input
                        type="number"
                        min="0"
                        value={manualSnapshotCount}
                        onChange={(e) => setManualSnapshotCount(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Size per Snapshot (GB)</label>
                      <input
                        type="number"
                        min="0"
                        value={manualSnapshotSize}
                        onChange={(e) => setManualSnapshotSize(parseInt(e.target.value))}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={calculateCost}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Calculate Cost
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {result && <CostBreakdownCard result={result} service="rds" />}
        </div>
      </div>
    </div>
  );
}

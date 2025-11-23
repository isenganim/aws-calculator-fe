import { useState } from 'react';
import { Calculator, Save, Loader2 } from 'lucide-react';
import { awsApiClient } from '../services/awsApiClient';
import type { EC2CalculateRequest, EC2CalculateResponse, EBSVolume } from '../types/api';
import { CostBreakdownCard } from '../components/CostBreakdownCard';
import { AWS_REGIONS, INSTANCE_TYPES } from '../constants';

export function EC2Calculator() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EC2CalculateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState('us-east-1');
  const [instanceType, setInstanceType] = useState('t3.medium');
  const [quantity, setQuantity] = useState(1);
  const [operatingSystem, setOperatingSystem] = useState<'Linux' | 'Windows' | 'RHEL' | 'SUSE'>('Linux');
  const [pricingModel, setPricingModel] = useState<'on-demand' | 'reserved'>('on-demand');
  const [reservedTerm, setReservedTerm] = useState<'1yr' | '3yr'>('1yr');
  const [paymentOption, setPaymentOption] = useState<'No Upfront' | 'Partial Upfront' | 'All Upfront'>('No Upfront');

  const [volumes, setVolumes] = useState<EBSVolume[]>([
    { type: 'gp3', sizeGB: 100, iops: 3000, throughputMBps: 125 },
  ]);

  const [snapshotsEnabled, setSnapshotsEnabled] = useState(false);
  const [snapshotFrequency, setSnapshotFrequency] = useState<'daily' | 'weekly'>('daily');
  const [snapshotRetention, setSnapshotRetention] = useState(30);
  const [snapshotChangePercent, setSnapshotChangePercent] = useState(5);
  const [snapshotStorageType, setSnapshotStorageType] = useState<'standard' | 'archive'>('standard');

  const [publicIPv4Count, setPublicIPv4Count] = useState(0);

  const addVolume = () => {
    setVolumes([...volumes, { type: 'gp3', sizeGB: 100, iops: 3000, throughputMBps: 125 }]);
  };

  const removeVolume = (index: number) => {
    setVolumes(volumes.filter((_, i) => i !== index));
  };

  const updateVolume = (index: number, field: keyof EBSVolume, value: string | number) => {
    const newVolumes = [...volumes];
    newVolumes[index] = { ...newVolumes[index], [field]: value };
    setVolumes(newVolumes);
  };

  const calculateCost = async () => {
    setLoading(true);
    setError(null);

    const request: EC2CalculateRequest = {
      region,
      instance: {
        type: instanceType,
        quantity,
        operatingSystem,
        pricingModel,
        ...(pricingModel === 'reserved' && { reservedTerm, paymentOption }),
      },
      ...(volumes.length > 0 && { storage: { volumes } }),
      ...(snapshotsEnabled && {
        snapshots: {
          enabled: true,
          frequency: snapshotFrequency,
          retentionDays: snapshotRetention,
          dailyChangePercent: snapshotChangePercent,
          storageType: snapshotStorageType,
        },
      }),
      ...(publicIPv4Count > 0 && { networking: { publicIPv4Count } }),
    };

    try {
      const response = await awsApiClient.calculateEC2(request);
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
              <Calculator className="w-5 h-5" />
              Instance Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Region
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AWS_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Instance Type
                </label>
                <select
                  value={instanceType}
                  onChange={(e) => setInstanceType(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {INSTANCE_TYPES.ec2.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Operating System
                </label>
                <select
                  value={operatingSystem}
                  onChange={(e) => setOperatingSystem(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Linux">Linux</option>
                  <option value="Windows">Windows</option>
                  <option value="RHEL">RHEL</option>
                  <option value="SUSE">SUSE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pricing Model
                </label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Reserved Term
                    </label>
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Option
                    </label>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Public IPv4 Addresses
                </label>
                <input
                  type="number"
                  min="0"
                  value={publicIPv4Count}
                  onChange={(e) => setPublicIPv4Count(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">EBS Storage</h2>
              <button
                onClick={addVolume}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Add Volume
              </button>
            </div>

            <div className="space-y-4">
              {volumes.map((volume, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 dark:text-white">Volume {index + 1}</h3>
                    {volumes.length > 1 && (
                      <button
                        onClick={() => removeVolume(index)}
                        className="text-red-600 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                      </label>
                      <select
                        value={volume.type}
                        onChange={(e) => updateVolume(index, 'type', e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="gp3">gp3</option>
                        <option value="gp2">gp2</option>
                        <option value="io1">io1</option>
                        <option value="io2">io2</option>
                        <option value="st1">st1</option>
                        <option value="sc1">sc1</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Size (GB)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={volume.sizeGB}
                        onChange={(e) => updateVolume(index, 'sizeGB', parseInt(e.target.value))}
                        className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {(volume.type === 'gp3' || volume.type === 'io1' || volume.type === 'io2') && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          IOPS
                        </label>
                        <input
                          type="number"
                          value={volume.iops || 3000}
                          onChange={(e) => updateVolume(index, 'iops', parseInt(e.target.value))}
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                    {volume.type === 'gp3' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Throughput (MB/s)
                        </label>
                        <input
                          type="number"
                          value={volume.throughputMBps || 125}
                          onChange={(e) =>
                            updateVolume(index, 'throughputMBps', parseInt(e.target.value))
                          }
                          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                id="snapshots"
                checked={snapshotsEnabled}
                onChange={(e) => setSnapshotsEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-700 rounded focus:ring-blue-500"
              />
              <label htmlFor="snapshots" className="text-xl font-semibold text-gray-900 dark:text-white">
                Snapshot Configuration
              </label>
            </div>

            {snapshotsEnabled && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Frequency
                  </label>
                  <select
                    value={snapshotFrequency}
                    onChange={(e) => setSnapshotFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Retention (days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={snapshotRetention}
                    onChange={(e) => setSnapshotRetention(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Daily Change %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={snapshotChangePercent}
                    onChange={(e) => setSnapshotChangePercent(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Storage Type
                  </label>
                  <select
                    value={snapshotStorageType}
                    onChange={(e) => setSnapshotStorageType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="archive">Archive</option>
                  </select>
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
                <Calculator className="w-5 h-5" />
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
          {result && <CostBreakdownCard result={result} service="ec2" />}
        </div>
      </div>
    </div>
  );
}

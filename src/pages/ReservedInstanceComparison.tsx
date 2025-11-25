import { useState } from 'react';
import { GitCompare, Loader2, TrendingDown } from 'lucide-react';
import { awsApiClient } from '../services/awsApiClient';
import type { ReservedInstanceCompareResponse } from '../types/api';
import { AWS_REGIONS, INSTANCE_TYPES } from '../constants';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ReservedInstanceComparison() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReservedInstanceCompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [region, setRegion] = useState('us-east-1');
  const [service, setService] = useState<'ec2' | 'rds'>('ec2');
  const [instanceType, setInstanceType] = useState('m5.xlarge');
  const [quantity, setQuantity] = useState(5);
  const [operatingSystem, setOperatingSystem] = useState<'Linux' | 'Windows'>('Linux');
  const [engine, setEngine] = useState('MySQL');

  const compareInstances = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await awsApiClient.compareReservedInstances({
        region,
        service,
        instanceType,
        quantity,
        ...(service === 'ec2' && { operatingSystem }),
        ...(service === 'rds' && { engine }),
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error?.message || 'Failed to compare instances');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <GitCompare className="w-5 h-5" />
          Configuration
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
            <select
              value={service}
              onChange={(e) => {
                setService(e.target.value as any);
                setInstanceType(e.target.value === 'ec2' ? 'm5.xlarge' : 'db.m5.large');
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ec2">EC2</option>
              <option value="rds">RDS</option>
            </select>
          </div>

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
              {(service === 'ec2' ? INSTANCE_TYPES.ec2 : INSTANCE_TYPES.rds).map((type) => (
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

          {service === 'ec2' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operating System</label>
              <select
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value as any)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Linux">Linux</option>
                <option value="Windows">Windows</option>
              </select>
            </div>
          )}

          {service === 'rds' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Database Engine</label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="MySQL">MySQL</option>
                <option value="PostgreSQL">PostgreSQL</option>
              </select>
            </div>
          )}
        </div>

        <button
          onClick={compareInstances}
          disabled={loading}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <GitCompare className="w-5 h-5" />
              Compare Pricing
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-medium mb-4">On-Demand Pricing</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-90">Hourly</p>
                <p className="text-2xl font-bold">{formatCurrency(result.comparison.onDemand.hourlyRate)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Monthly</p>
                <p className="text-2xl font-bold">{formatCurrency(result.comparison.onDemand.monthlyRate)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Annual</p>
                <p className="text-2xl font-bold">{formatCurrency(result.comparison.onDemand.yearlyRate)}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">3-Year Total</p>
                <p className="text-2xl font-bold">{formatCurrency(result.comparison.onDemand.yearlyRate * 3)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reserved Instance Options</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Term</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Payment</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Upfront</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Monthly</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Yearly</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {result.comparison.reserved.map((option, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{option.term}</td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{option.paymentOption}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                        {formatCurrency(option.upfrontCost)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-right">
                        {formatCurrency(option.effectiveMonthly)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white text-right">
                        {formatCurrency(option.effectiveYearly)}
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <TrendingDown className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(option.savings.yearly)}/yr ({option.savings.percentageVsOnDemand.toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {result.recommendation && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Recommendation</h3>
              <p className="text-blue-800 dark:text-blue-200">{result.recommendation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { TrendingUp } from 'lucide-react';
import type { EC2CalculateResponse, RDSCalculateResponse } from '../types/api';

interface CostBreakdownCardProps {
  result: EC2CalculateResponse | RDSCalculateResponse;
  service: 'ec2' | 'rds';
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function CostBreakdownCard({ result, service }: CostBreakdownCardProps) {
  const isEC2 = service === 'ec2';
  const ec2Result = isEC2 ? (result as EC2CalculateResponse) : null;
  const rdsResult = !isEC2 ? (result as RDSCalculateResponse) : null;

  const monthlyCost = result.summary.monthly;
  const dailyCost = monthlyCost / 30;
  const hourlyCost = result.summary.hourly;

  return (
    <div className="sticky top-20 space-y-4">
      <div className="bg-blue-600 rounded-lg p-6 text-white">
        <div className="mb-2">
          <p className="text-sm text-blue-100">Monthly Cost</p>
        </div>
        <p className="text-3xl font-semibold mb-4">{formatCurrency(monthlyCost)}</p>
        <div className="space-y-2 pt-4 border-t border-blue-500">
          <div className="flex justify-between text-sm">
            <span className="text-blue-100">Daily</span>
            <span className="font-medium">{formatCurrency(dailyCost)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-blue-100">Hourly</span>
            <span className="font-medium">{formatCurrency(hourlyCost)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Cost Breakdown</h3>
        <div className="space-y-3">
          {isEC2 && ec2Result && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Compute {ec2Result.breakdown.compute.upfront ? '(Monthly)' : ''}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(ec2Result.breakdown.compute.monthly)}
                </span>
              </div>
              {ec2Result.breakdown.compute.upfront && ec2Result.breakdown.compute.upfront > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Compute (Upfront)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(ec2Result.breakdown.compute.upfront)}
                  </span>
                </div>
              )}
              {ec2Result.breakdown.storage.total.monthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(ec2Result.breakdown.storage.total.monthly)}
                  </span>
                </div>
              )}
              {ec2Result.breakdown.snapshots && ec2Result.breakdown.snapshots.total.monthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Snapshots</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(ec2Result.breakdown.snapshots.total.monthly)}
                  </span>
                </div>
              )}
              {ec2Result.breakdown.networking && ec2Result.breakdown.networking.publicIPv4.monthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Networking</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(ec2Result.breakdown.networking.publicIPv4.monthly)}
                  </span>
                </div>
              )}
            </>
          )}

          {!isEC2 && rdsResult && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Compute {rdsResult.breakdown.compute.upfront ? '(Monthly)' : ''}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(rdsResult.breakdown.compute.monthly)}
                </span>
              </div>
              {rdsResult.breakdown.compute.upfront && rdsResult.breakdown.compute.upfront > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Compute (Upfront)</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(rdsResult.breakdown.compute.upfront)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(rdsResult.breakdown.storage.monthly)}
                </span>
              </div>
              {rdsResult.breakdown.backup && rdsResult.breakdown.backup.monthly > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Backup</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(rdsResult.breakdown.backup.monthly)}
                  </span>
                </div>
              )}
            </>
          )}

          <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Total Monthly</span>
            <span className="font-semibold text-lg text-gray-900 dark:text-white">{formatCurrency(monthlyCost)}</span>
          </div>
          {result.summary.upfront && result.summary.upfront > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Total Upfront</span>
              <span className="font-semibold text-lg text-gray-900 dark:text-white">
                {formatCurrency(result.summary.upfront)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {result.summary.upfront ? 'First Year Total' : 'Annual Projection'}
            </p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">
              {formatCurrency(result.summary.yearly)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

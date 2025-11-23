import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { awsApiClient } from '../services/awsApiClient';
import type { HealthCheckResponse } from '../types/api';

export function HealthIndicator() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const data = await awsApiClient.healthCheck();
        setHealth(data);
        setError(false);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-pulse" />
        <span>Checking API...</span>
      </div>
    );
  }

  if (error || !health) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
        <AlertCircle className="w-3.5 h-3.5" />
        <span>API Offline</span>
      </div>
    );
  }

  const isHealthy = health.status === 'healthy';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs">
        <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
          {isHealthy ? 'API Healthy' : 'API Issues'}
        </span>
      </div>
      {isHealthy && health.services && (
        <div className="pl-4 space-y-1 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-between gap-3">
            <span>Database:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">{health.services.database.latencyMs}ms</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>Redis:</span>
            <span className="text-green-600 dark:text-green-400 font-medium">{health.services.redis.latencyMs}ms</span>
          </div>
        </div>
      )}
    </div>
  );
}

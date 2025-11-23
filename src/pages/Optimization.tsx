import { Lightbulb } from 'lucide-react';

export function Optimization() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
        <Lightbulb className="w-16 h-16 text-yellow-600 dark:text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Cost Optimization</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Get personalized recommendations to optimize your AWS costs based on usage patterns and workload requirements.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">Feature coming soon</p>
      </div>
    </div>
  );
}

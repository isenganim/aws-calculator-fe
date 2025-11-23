import { Link } from 'react-router-dom';
import {
  Calculator,
  Database,
  Camera,
  GitCompare,
  Search,
  Lightbulb,
  Globe,
  ChevronRight,
} from 'lucide-react';

const calculators = [
  {
    title: 'EC2 Calculator',
    description: 'Calculate costs for EC2 instances with storage, snapshots, and networking',
    icon: Calculator,
    href: '/ec2',
    color: 'bg-blue-600',
  },
  {
    title: 'RDS Calculator',
    description: 'Estimate RDS database costs including compute, storage, and backups',
    icon: Database,
    href: '/rds',
    color: 'bg-green-600',
  },
  {
    title: 'Snapshot Cost',
    description: 'Calculate EBS snapshot storage costs over time',
    icon: Camera,
    href: '/snapshots',
    color: 'bg-purple-600',
  },
  {
    title: 'RI Comparison',
    description: 'Compare on-demand vs reserved instance pricing and savings',
    icon: GitCompare,
    href: '/reserved-instances',
    color: 'bg-orange-600',
  },
];

const tools = [
  {
    title: 'Multi-Region',
    description: 'Compare costs across regions',
    icon: Globe,
    href: '/multi-region',
  },
  {
    title: 'Instance Search',
    description: 'Find the right instance',
    icon: Search,
    href: '/search',
  },
  {
    title: 'Optimization',
    description: 'Reduce your AWS costs',
    icon: Lightbulb,
    href: '/optimization',
  },
];

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 lg:p-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          AWS Pricing Calculator
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Estimate and optimize your AWS infrastructure costs with real-time pricing data
        </p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cost Calculators
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {calculators.map((calc) => {
            const Icon = calc.icon;
            return (
              <Link
                key={calc.title}
                to={calc.href}
                className="group bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className={`${calc.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">
                        {calc.title}
                      </h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {calc.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Analysis Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                to={tool.href}
                className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-3" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                  {tool.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

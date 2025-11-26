import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Calculator,
  Database,
  Camera,
  GitCompare,
  Search,
  Lightbulb,
  Save,
  LayoutDashboard,
  Globe,
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'EC2 Calculator', href: '/ec2', icon: Calculator },
  { name: 'RDS Calculator', href: '/rds', icon: Database },
  { name: 'Snapshot Cost', href: '/snapshots', icon: Camera },
  { name: 'RI Comparison', href: '/reserved-instances', icon: GitCompare },
  { name: 'Multi-Region', href: '/multi-region', icon: Globe },
  { name: 'Instance Search', href: '/search', icon: Search },
  { name: 'Optimization', href: '/optimization', icon: Lightbulb },
  { name: 'Saved Configs', href: '/saved', icon: Save },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = navigation.find((item) => item.href === location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div
        className={`fixed inset-0 bg-gray-900/50 dark:bg-black/50 lg:hidden z-40 transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform lg:translate-x-0 z-50 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">AWS Pricing</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cost Calculator</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-0.5">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currentPage?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

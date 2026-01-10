import { Link, useLocation } from 'react-router-dom';
import { Target, CheckSquare, BarChart3, Settings, Repeat, Home, Calendar } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/habits', icon: Repeat, label: 'Habits' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-md safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

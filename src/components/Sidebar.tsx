import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  CheckSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Bot
} from 'lucide-react';
import { RootState } from '../redux/store';
import { toggleSidebar } from '../redux/slices/uiSlice';

export const Sidebar: React.FC = () => {
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const dispatch = useDispatch();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'HCPs', path: '/hcps', icon: Users },
    { name: 'Log Interaction', path: '/log-interaction', icon: Bot },
    { name: 'Interactions', path: '/interactions', icon: FileText },
    { name: 'Calendar', path: '/calendar', icon: Calendar },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.div
      animate={{ width: sidebarOpen ? 256 : 76 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 shrink-0 z-40"
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-4 overflow-hidden select-none">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shrink-0 shadow-md glow-shadow">
            <ShieldCheck className="h-5 w-5" />
          </div>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col"
            >
              <span className="text-sm font-bold text-slate-800 leading-none">PharmaFlow</span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">AI CRM PLATFORM</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === '/hcps' && location.pathname.startsWith('/hcp/')) ||
            (item.path === '/interactions' && location.pathname.startsWith('/interactions/'));
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-brand-50 text-brand-500 font-semibold'
                  : 'text-slate-500 hover:bg-slate-55 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                isActive ? 'text-brand-500' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              
              {sidebarOpen ? (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {item.name}
                </motion.span>
              ) : (
                /* Tooltip for collapsed sidebar */
                <span className="absolute left-16 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 delay-150 shadow-md font-medium z-50 whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Trigger Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-55 hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center shadow-sm transition-colors"
          aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {sidebarOpen ? <ChevronLeft className="h-4.5 w-4.5" /> : <ChevronRight className="h-4.5 w-4.5" />}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;

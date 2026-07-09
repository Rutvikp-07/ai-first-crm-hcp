import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Search, LogOut, Settings as SettingsIcon, User, Check, Trash2 } from 'lucide-react';
import { RootState } from '../redux/store';
import { markAllNotificationsRead, clearNotifications } from '../redux/slices/uiSlice';
import Avatar from './Avatar';
import Badge from './Badge';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { notifications, settings } = useSelector((state: RootState) => state.ui);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Overview';
    if (path.startsWith('/hcps')) return 'Healthcare Providers';
    if (path.startsWith('/hcp/')) return 'HCP Profile Details';
    if (path.startsWith('/log-interaction')) return 'Log Interaction Detail';
    if (path.startsWith('/interactions')) return 'Interaction Archives';
    if (path.startsWith('/calendar')) return 'Meeting Calendar';
    if (path.startsWith('/tasks')) return 'Follow-up Tasks';
    if (path.startsWith('/reports')) return 'Analytics Reports';
    if (path.startsWith('/settings')) return 'Preferences & Settings';
    return 'Dashboard';
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Page Title & Context */}
      <div>
        <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none">
          {getPageTitle()}
        </h1>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Mock Search Bar */}
        <div className="relative w-64 hidden sm:block">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search HCPs, materials..."
            className="w-full bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors focus:border-transparent text-xs rounded-lg pl-9 pr-4 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-slate-450"
          />
        </div>

        {/* Notifications Icon & Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-9 w-9 rounded-lg border border-slate-200 bg-white hover:bg-slate-55 hover:bg-slate-50 text-slate-500 hover:text-slate-700 flex items-center justify-center shadow-sm transition-colors relative"
            aria-label="View notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-100 rounded-xl shadow-premium z-50 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-[10px] text-brand-500 font-bold hover:underline flex items-center gap-0.5"
                  >
                    <Check className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 transition-colors ${
                        notif.read ? 'bg-white' : 'bg-brand-50/20'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">
                          {notif.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap ml-2">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-400 select-none">
                    No new alerts
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-50 bg-slate-50/30 flex justify-center">
                  <button
                    onClick={() => dispatch(clearNotifications())}
                    className="text-[10px] text-rose-500 font-bold hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" /> Clear Notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div ref={profileRef} className="relative">
          <div
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 select-none"
          >
            <Avatar name={settings.repName} size="sm" />
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-none">
                {settings.repName}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
                Sales Executive
              </span>
            </div>
          </div>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-100 rounded-xl shadow-premium z-50 py-1.5 flex flex-col">
              <div className="px-4 py-2 border-b border-slate-100 mb-1 lg:hidden">
                <span className="text-xs font-bold text-slate-800 block truncate">
                  {settings.repName}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {settings.repEmail}
                </span>
              </div>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileDropdown(false);
                }}
                className="px-4 py-2 text-xs text-slate-655 text-slate-600 hover:bg-slate-55 hover:bg-slate-50 flex items-center gap-2.5 text-left w-full transition-colors"
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </button>

              <button
                onClick={() => {
                  navigate('/settings');
                  setShowProfileDropdown(false);
                }}
                className="px-4 py-2 text-xs text-slate-655 text-slate-600 hover:bg-slate-55 hover:bg-slate-50 flex items-center gap-2.5 text-left w-full transition-colors"
              >
                <SettingsIcon className="h-4 w-4 text-slate-400" />
                Account Settings
              </button>

              <div className="border-t border-slate-100 my-1.5" />

              <button
                onClick={() => {
                  navigate('/'); // redirect to Login
                  setShowProfileDropdown(false);
                }}
                className="px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 text-left w-full transition-colors font-medium"
              >
                <LogOut className="h-4 w-4 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

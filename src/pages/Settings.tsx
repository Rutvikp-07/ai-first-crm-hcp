import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings as SettingsIcon, Bell, Globe, Moon, Sun, UserCheck, ShieldAlert } from 'lucide-react';
import { RootState } from '../redux/store';
import { updateSettings, addNotification } from '../redux/slices/uiSlice';
import { getDisplayNameFromEmail } from '../redux/slices/authSlice';
import Card from '../components/Card';
import Input from '../components/Input';
import Dropdown from '../components/Dropdown';
import Button from '../components/Button';

export const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const currentSettings = useSelector((state: RootState) => state.ui.settings);
  const user = useSelector((state: RootState) => state.auth.user);

  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(currentSettings.language);
  const [notifsEnabled, setNotifsEnabled] = useState(currentSettings.notificationsEnabled);
  const [emailAlerts, setEmailAlerts] = useState(currentSettings.emailAlerts);

  useEffect(() => {
    if (user) {
      setProfileName(getDisplayNameFromEmail(user.email));
      setProfileEmail(user.email);
    }
  }, [user]);

  const languages = [
    { value: 'English', label: 'English (US/UK)' },
    { value: 'Spanish', label: 'Español' },
    { value: 'French', label: 'Français' },
    { value: 'German', label: 'Deutsch' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateSettings({
      repName: profileName,
      repEmail: profileEmail,
    }));
  };

  const handleSavePreferences = () => {
    dispatch(updateSettings({
      language: selectedLanguage,
      notificationsEnabled: notifsEnabled,
      emailAlerts: emailAlerts,
    }));
  };

  const toggleTheme = () => {
    const nextTheme = currentSettings.theme === 'light' ? 'dark' : 'light';
    dispatch(updateSettings({ theme: nextTheme }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Left Column: Personal details */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card premium className="p-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-5 flex items-center gap-2 select-none">
            <UserCheck className="h-4.5 w-4.5 text-slate-400" />
            Medical Representative Profile
          </h3>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <Input
                label="Corporate Email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Employee ID"
                value="EMP-2026-8941"
                disabled
                containerClassName="opacity-80"
              />
              <Input
                label="Designation Role"
                value="Senior Medical Representative"
                disabled
                containerClassName="opacity-80"
              />
            </div>

            <div className="self-end mt-2">
              <Button type="submit" size="sm">
                Save Profile
              </Button>
            </div>
          </form>
        </Card>

        {/* System parameters */}
        <Card premium className="p-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-5 flex items-center gap-2 select-none">
            <Globe className="h-4.5 w-4.5 text-slate-400" />
            Regional & Localization Preferences
          </h3>

          <div className="flex flex-col gap-5">
            <Dropdown
              label="Default Application Language"
              options={languages}
              value={selectedLanguage}
              onChange={(val) => setSelectedLanguage(val as any)}
            />

            <div className="flex flex-col gap-3 pt-2">
              <span className="text-xs font-bold text-slate-700 select-none">Email & Notifications</span>
              
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-655 text-slate-600">
                <input
                  type="checkbox"
                  checked={notifsEnabled}
                  onChange={(e) => setNotifsEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500 mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-850 text-slate-800">In-App Banner Notifications</span>
                  <span className="text-[10px] text-slate-450 mt-0.5">Receive alert slides when HCP additions or logs complete.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-slate-655 text-slate-600">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500 mt-0.5"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-850 text-slate-800">Daily Follow-up Digest Emails</span>
                  <span className="text-[10px] text-slate-450 mt-0.5">Email summary sheet of due tasks and AI follow-up actions.</span>
                </div>
              </label>
            </div>

            <div className="self-end mt-2">
              <Button onClick={handleSavePreferences} size="sm">
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Column: Theme & Security */}
      <div className="flex flex-col gap-6">
        {/* Theme mode */}
        <Card premium className="p-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 flex items-center gap-2 select-none">
            <Sun className="h-4.5 w-4.5 text-slate-400" />
            Appearance theme
          </h3>

          <div className="flex flex-col gap-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Switch application layout style between standard clean-white and low-light dark.
            </p>

            <div className="flex bg-slate-100 p-1.5 rounded-lg border border-slate-200/50">
              <button
                onClick={toggleTheme}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  currentSettings.theme === 'light'
                    ? 'bg-white text-brand-500 shadow-sm border border-slate-150'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sun className="h-4 w-4" />
                Light Mode
              </button>
              
              <button
                onClick={toggleTheme}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-bold transition-all ${
                  currentSettings.theme === 'dark'
                    ? 'bg-slate-800 text-yellow-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark Mode
              </button>
            </div>
          </div>
        </Card>

        {/* Security & Access */}
        <Card premium className="p-6">
          <h3 className="text-sm font-bold text-slate-800 border-b border-slate-50 pb-4 mb-4 flex items-center gap-2 select-none">
            <ShieldAlert className="h-4.5 w-4.5 text-slate-400" />
            Security Credentials
          </h3>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => alert('Demo Feature: Change Password dialog.')}
              className="w-full text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 py-2.5 rounded-lg shadow-sm transition-all"
            >
              Update Password
            </button>
            
            <button
              onClick={() => alert('Demo Feature: 2FA configuration.')}
              className="w-full text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 py-2.5 rounded-lg shadow-sm transition-all"
            >
              Configure Two-Factor Auth
            </button>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default Settings;

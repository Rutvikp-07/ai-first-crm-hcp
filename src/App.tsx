import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import HcpList from './pages/HcpList';
import HcpDetails from './pages/HcpDetails';
import LogInteraction from './pages/LogInteraction';
import InteractionHistory from './pages/InteractionHistory';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hcps" element={<HcpList />} />
        <Route path="/hcp/:id" element={<HcpDetails />} />
        <Route path="/log-interaction" element={<LogInteraction />} />
        <Route path="/interactions" element={<InteractionHistory />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

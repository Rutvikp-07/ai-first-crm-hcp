import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  // Simple mock login check (or bypass for simplicity, we can let user navigate)
  // If we wanted authentication check, we could check ui state, but since the user requested
  // no authentication logic, we can just allow everything.

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Workspace */}
      <div className="flex flex-col flex-grow min-w-0 overflow-hidden">
        {/* Top Header */}
        <Navbar />

        {/* Dynamic Scrollable Page Content */}
        <main className="flex-grow overflow-y-auto bg-[#F8FAFC] p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="page-container max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

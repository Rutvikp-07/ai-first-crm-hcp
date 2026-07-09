import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { RootState, AppDispatch } from '../redux/store';
import { fetchCurrentUserThunk } from '../redux/slices/authSlice';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const token = localStorage.getItem('token');
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [token, user, dispatch]);

  // Route protection checking local storage JWT token
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Display session recovery loading screen
  if (isLoading || (!user && token)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-[#F8FAFC]">
        <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Recovering authenticated operator session...</p>
      </div>
    );
  }

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


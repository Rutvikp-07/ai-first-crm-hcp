import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { authApi } from '../api/auth';
import { addNotification } from '../redux/slices/uiSlice';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        // Register API Call
        await authApi.register(email, password);
        dispatch(addNotification({
          title: 'Registration Successful',
          message: `Account created for ${email}. Please sign in.`,
          type: 'success',
        }));
        setIsRegister(false);
        setPassword('');
      } else {
        // Login API Call
        const data = await authApi.login(email, password);
        localStorage.setItem('token', data.access_token);
        dispatch(addNotification({
          title: 'Sign In Successful',
          message: 'Welcome back to your dashboard.',
          type: 'success',
        }));
        navigate('/dashboard');
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string') {
        setApiError(detail);
      } else if (Array.isArray(detail)) {
        setApiError(detail.map(d => d.msg).join(', '));
      } else {
        setApiError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <Card premium className="w-full max-w-md p-8 md:p-10 flex flex-col items-center">
        {/* Branding & Logo */}
        <div className="flex flex-col items-center select-none text-center">
          <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg glow-shadow mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {isRegister ? 'Register for PharmaFlow' : 'Welcome to PharmaFlow'}
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">
            Enterprise HCP Sales Portal
          </p>
        </div>

        {/* Global Error Banner */}
        {apiError && (
          <div className="w-full mt-5 p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
            {apiError}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="w-full mt-6 flex flex-col gap-5">
          <Input
            label="Email Address"
            type="email"
            placeholder="amit.kumar@pharmaco.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={<Mail className="h-4.5 w-4.5" />}
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-4.5 w-4.5" />}
          />

          {/* Registration Trigger toggle */}
          <div className="flex items-center justify-between text-xs font-medium mt-1">
            <button
              type="button"
              className="text-brand-500 hover:text-brand-600 hover:underline transition-colors"
              onClick={() => {
                setIsRegister(!isRegister);
                setApiError(null);
                setErrors({});
              }}
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
            
            {!isRegister && (
              <button
                type="button"
                className="text-slate-450 hover:text-slate-655 hover:underline transition-colors text-slate-400 font-semibold"
                onClick={() => alert('Demo Feature: Password recovery email sent.')}
              >
                Forgot Password?
              </button>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 py-3 text-sm font-semibold rounded-lg shadow-soft transition-all"
          >
            {isRegister ? 'Register Account' : 'Sign In'}
          </Button>
        </form>
      </Card>
      
      {/* Footer copyright */}
      <span className="text-[10px] text-slate-400 mt-6 select-none font-semibold">
        © 2026 PharmaFlow Inc. All rights reserved.
      </span>
    </div>
  );
};

export default Login;


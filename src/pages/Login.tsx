import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSignIn = (e: React.FormEvent) => {
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
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen w-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
      <Card premium className="w-full max-w-md p-8 md:p-10 flex flex-col items-center">
        {/* Branding & Logo */}
        <div className="flex flex-col items-center select-none text-center">
          <div className="h-12 w-12 rounded-2xl bg-brand-500 flex items-center justify-center text-white shadow-lg glow-shadow mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Welcome to PharmaFlow</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-wide">
            Enterprise HCP Sales Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="w-full mt-8 flex flex-col gap-5">
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs font-medium mt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-655 text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-355 text-brand-500 focus:ring-brand-500 h-4 w-4"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              className="text-brand-500 hover:text-brand-600 hover:underline transition-colors"
              onClick={() => alert('Demo Feature: Password recovery email sent.')}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full mt-2 py-3 text-sm font-semibold rounded-lg shadow-soft transition-all"
          >
            Sign In
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

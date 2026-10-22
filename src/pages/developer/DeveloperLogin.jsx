import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ShieldCheck, Mail, Lock, Sparkles, ArrowLeft } from 'lucide-react';

export default function DeveloperLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in your developer credentials.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome to Developer Administration Hub!', 'success');
      navigate('/developer/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please verify credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('developer@crackzo.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 mb-6 font-medium">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        <div className="flex justify-center mb-4">
          <img
            src="/CrackzoLogo.png"
            alt="Crackzo"
            className="w-16 h-16 object-contain drop-shadow-md"
          />
        </div>
        <h2 className="text-center text-2xl font-extrabold text-surface-text tracking-tight">
          Developer Admin Portal
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Central management for multi-tenant cracker shops, owners and platform security.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-modal rounded-3xl border border-surface-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Developer Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@crackers.com"
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button
              type="submit"
              isLoading={loading}
              className="w-full mt-2"
              size="lg"
            >
              Sign In as Developer
            </Button>
          </form>

          {/* Quick Demo Helper */}
          {/* <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-2">
              Quick Test Credentials
            </p>
            <button
              type="button"
              onClick={handleFillDemo}
              className="w-full text-left p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs transition-colors flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-gray-800 block">developer@crackzo.com</span>
                <span className="text-gray-500 text-[10px]">Password: admin123</span>
              </div>
              <span className="text-[11px] text-primary-600 font-bold">Auto-Fill</span>
            </button>
          </div> */}

          <div className="mt-6 text-center">
            <Link
              to="/admin/login"
              className="text-xs text-gray-500 hover:text-primary-600 font-medium"
            >
              Looking for Shop Owner portal? Sign in here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

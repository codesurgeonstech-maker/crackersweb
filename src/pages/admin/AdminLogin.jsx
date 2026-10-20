import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Store, Mail, Lock, Sparkles, ArrowLeft } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter your email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome to your Shop Owner Dashboard!', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setLoading(false);
    }
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
          Shop Owner Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Manage your crackers catalogue, process WhatsApp orders, and print counter QR codes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-modal rounded-3xl border border-surface-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Shop Owner Email"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@yourshop.com"
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
              Sign In to Store
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/developer/login"
              className="text-xs text-gray-500 hover:text-primary-600 font-medium"
            >
              Are you the platform developer? Developer Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

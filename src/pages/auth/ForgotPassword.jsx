import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send reset link', 'error');
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
          Reset Your Password
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500">
          Enter your registered email address to receive password recovery instructions.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-modal rounded-3xl border border-surface-border">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-surface-text text-base">Check Your Inbox</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                If an account exists for <strong>{email}</strong>, a password reset link has been dispatched.
              </p>
              <Link to="/admin/login">
                <Button size="sm" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                icon={Mail}
                placeholder="owner@crackers.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                isLoading={loading}
                className="w-full mt-2"
                size="lg"
              >
                Send Reset Link
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

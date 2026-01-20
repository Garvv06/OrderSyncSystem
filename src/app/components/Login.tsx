import { useState } from 'react';
import { Admin } from '../types';
import { api } from '../utils/api';
import logo from 'figma:asset/b83a330ecb651eee17bb0c1cb9db3f1f6df36a92.png';

interface LoginProps {
  onLoginSuccess: (token: string, admin: Admin) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await api.login(email, password);
        if (result.success && result.token && result.admin) {
          onLoginSuccess(result.token, result.admin);
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        const result = await api.register(email, password, name);
        setError(result.message || '');
        if (result.success) {
          setEmail('');
          setPassword('');
          setName('');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="MFOI Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-gray-900 mb-2">MFOI Order System</h1>
          <p className="text-gray-600">
            {isLogin ? 'Login to your account' : 'Request admin access'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Request Access'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-red-600 hover:text-red-700"
          >
            {isLogin ? 'Need access? Request here' : 'Already have access? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}

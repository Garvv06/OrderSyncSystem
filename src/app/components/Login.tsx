import { useState } from 'react';
import { Admin } from '../types';
import { supabase } from '../utils/supabase';
import { getAdmins } from '../utils/storage';
import logo from 'figma:asset/b83a330ecb651eee17bb0c1cb9db3f1f6df36a92.png';

interface LoginProps {
  onLoginSuccess: (admin: Admin) => void;
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
      if (!supabase) {
        setError('⚠️ Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Login with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) {
          console.error('Login error:', authError);
          setError(`Login failed: ${authError.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        if (!authData.user) {
          setError('Login failed - no user returned');
          setLoading(false);
          return;
        }

        // Get admin data from admins table
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('email', email)
          .single();

        if (adminError || !adminData) {
          console.error('Admin lookup error:', adminError);
          setError('Admin record not found. Please contact support.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (!adminData.approved) {
          setError('Your account is pending approval. Please wait for an admin to approve your request.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Map database admin to App's Admin type
        const admin: Admin = {
          email: adminData.email,
          name: adminData.name,
          role: adminData.role as 'superadmin' | 'admin',
          approved: adminData.approved,
          password: '', // Don't expose password
          createdAt: adminData.created_at,
        };

        onLoginSuccess(admin);
      } else {
        // Registration - create auth user first, then admin record
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            },
            emailRedirectTo: undefined, // Disable email confirmation for now
          },
        });

        if (authError) {
          console.error('Registration error:', authError);
          setError(`Registration failed: ${authError.message || 'Unknown error'}`);
          setLoading(false);
          return;
        }

        if (!authData.user) {
          setError('Registration failed - no user created');
          setLoading(false);
          return;
        }

        // Create admin record in admins table
        const { error: insertError } = await supabase
          .from('admins')
          .insert({
            user_id: authData.user.id,
            email: email,
            name: name,
            role: 'admin',
            approved: false, // Pending approval
            // NOTE: Password is NOT stored here - it's securely hashed by Supabase Auth
          });

        if (insertError) {
          console.error('Admin record creation error:', insertError);
          setError('Failed to create admin record: ' + insertError.message);
          setLoading(false);
          return;
        }

        setError('');
        alert('✅ Registration successful! Your request is pending approval from an existing admin.');
        setEmail('');
        setPassword('');
        setName('');
        setIsLogin(true);
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An error occurred. Please try again. Check browser console for details.');
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
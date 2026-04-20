import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { DataService } from '../services/dataService';
import { Button, Input, Card } from '../components/ui';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const user = await DataService.login(identifier, password);
      if (user) {
        navigate('/');
      } else {
        setError('Oops! Name or password was wrong.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === 'DATABASE_PERMISSION_ERROR') {
        setError('Database Access Denied: Please update your Google Script deployment to "Anyone" so shared users can log in.');
      } else {
        setError(err.message || 'Something went wrong connecting to the server. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <span className="text-4xl">🐼</span>
          </div>
          <h1 className="text-3xl font-bold text-[#FF9EAA]">Moodie</h1>
          <p className="text-gray-500 font-medium tracking-tight mt-1">Hello friend, welcome back!</p>
        </div>

        <Card>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
                {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 px-1">FULL NAME</label>
              <Input 
                type="text" 
                placeholder="Enter your full name" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 px-1">PASSWORD</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Your secret code" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#FF9EAA] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? 'Entering...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-sm text-gray-400">
          First time here? <Link to="/register" className="text-[#FF9EAA] font-bold">Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

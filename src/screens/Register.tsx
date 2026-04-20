import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { DataService } from '../services/dataService';
import { Button, Input, Card } from '../components/ui';

export const Register = () => {
  const [form, setForm] = useState({
    full_name: '',
    student_email: '',
    password: '',
    parent_name: '',
    parent_email: '',
    class_name: '',
    age: 12
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const responseUser = await DataService.registerUser({
        ...form,
        role: 'student'
      });
      
      // Auto login immediately using returned data, merging with form data as fallback
      const createdUser = {
        ...form,
        ...responseUser,
        role: 'student' as const
      };

      DataService.setUserSession(createdUser);
      navigate('/');
    } catch (err: any) {
      console.error(err);
      if (err.message === 'DATABASE_PERMISSION_ERROR') {
        setError('Database Access Denied: Please update your Google Script deployment to "Execute as: Me" and "Who has access: Anyone".');
      } else {
        setError(err.message || 'Could not create account. Please check your internet and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F8FF] flex flex-col items-center p-6 py-12">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#B0D8FF]">Create Account</h1>
          <p className="text-gray-400">Let's start your wellbeing journey!</p>
        </div>

        <Card className="space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
                {error}
              </div>
            )}
            <div className="space-y-3">
              <Input 
                placeholder="Full Name" 
                value={form.full_name}
                onChange={(e) => setForm({...form, full_name: e.target.value})}
                required
                disabled={loading}
              />
              <Input 
                type="email" 
                placeholder="School Email" 
                value={form.student_email}
                onChange={(e) => setForm({...form, student_email: e.target.value})}
                required
                disabled={loading}
              />
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Choose a Password" 
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  required
                  disabled={loading}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-[#B0D8FF] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <hr className="border-gray-50" />
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-gray-300 px-1">Guardian Info</label>
              <Input 
                placeholder="Parent/Guardian Name" 
                value={form.parent_name}
                onChange={(e) => setForm({...form, parent_name: e.target.value})}
                required
                disabled={loading}
              />
              <Input 
                type="email" 
                placeholder="Parent/Guardian Email" 
                value={form.parent_email}
                onChange={(e) => setForm({...form, parent_email: e.target.value})}
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-2">
              <div className="w-2/3 space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-300 px-1">Class</label>
                <Input 
                  placeholder="e.g. 5 Alpha" 
                  value={form.class_name}
                  onChange={(e) => setForm({...form, class_name: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              <div className="w-1/3 space-y-1">
                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-300 px-1">Age</label>
                <Input 
                  type="number" 
                  min="1"
                  max="100"
                  placeholder="Age" 
                  value={form.age}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setForm({...form, age: isNaN(val) ? 0 : Math.max(0, val)});
                  }}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-[#B0D8FF] hover:bg-[#9dc6f0]">
              {loading ? 'Creating Account...' : 'Start Now'}
            </Button>
          </form>
        </Card>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account? <Link to="/login" className="text-[#B0D8FF] font-bold">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

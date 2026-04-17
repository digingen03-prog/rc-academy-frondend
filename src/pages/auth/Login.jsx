import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, LogIn, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(`/${user.role}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row font-sans selection:bg-primary/20">
      {/* Brand Section */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden md:flex flex-1 bg-primary relative overflow-hidden flex-col justify-center p-20 text-white"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-20 -translate-y-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/5 rounded-full -translate-x-10 translate-y-10 blur-2xl"></div>
        
        <div className="relative z-10 space-y-8">
            <div className="w-16 h-16 bg-white flex items-center justify-center rounded-2xl shadow-2xl">
                <GraduationCap size={40} className="text-primary" />
            </div>
            <div className="space-y-4">
                <h1 className="text-6xl font-black tracking-tighter leading-none">
                    Welcome to <br /> School Management
                </h1>
                <p className="text-xl opacity-90 font-medium max-w-md">
                    Streamlining education with a powerful, multi-role management platform for administrators, staff, and students.
                </p>
            </div>
            <div className="flex gap-8 pt-10 border-t border-white/20">
                <div>
                    <h4 className="text-3xl font-black">4000+</h4>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Active Students</p>
                </div>
                <div>
                    <h4 className="text-3xl font-black">200+</h4>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-60">Expert Staff</p>
                </div>
            </div>
        </div>
      </motion.div>

      {/* Login Section */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md space-y-10"
        >
          <motion.div variants={itemVariants} className="space-y-2">
            <div className="md:hidden flex items-center gap-2 mb-8">
                <div className="p-2 bg-primary rounded-lg text-white"><GraduationCap size={24}/></div>
                <span className="text-2xl font-black tracking-tighter uppercase italic">RC Academy</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">Login to your account</h2>
            <p className="text-gray-500 font-medium">Enter your credentials to access your dashboard</p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 group-focus-within:text-primary transition-colors">Access Identifier</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="text" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold placeholder:text-gray-200"
                  placeholder="Email or Reg Number"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 group-focus-within:text-primary transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors" size={20} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold placeholder:text-gray-200"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded-lg border-2 border-border text-primary focus:ring-primary/20 transition-all cursor-pointer" />
                <span className="text-gray-500 group-hover:text-primary">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:underline">Forgot password?</a>
            </motion.div>

            <motion.button 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit" 
              className="w-full bg-primary py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:bg-orange-600 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <motion.p variants={itemVariants} className="text-center text-xs font-bold text-gray-400">
            Don't have an account? <a href="#" className="text-primary hover:underline">Contact Support</a>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

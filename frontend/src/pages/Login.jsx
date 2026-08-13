import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await loginUser(username, password);
      if (result.success) {
        navigate('/dashboard'); 
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#090C12] flex">
      {/* Left Side: Branding / Editorial (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 bg-black relative flex-col justify-between overflow-hidden">
          {/* Background Image / Gradient */}
          <div className="absolute inset-0 z-0 opacity-60 mix-blend-screen">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/60 to-transparent z-10" />
              <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop" 
                  alt="Students collaborating" 
                  className="w-full h-full object-cover"
              />
          </div>
          
          {/* Content */}
          <div className="relative z-10 p-12 h-full flex flex-col justify-between">
              <div>
                  <Link to="/">
                      <img 
                          src="/skillstream-logo-full.png" 
                          alt="SkillStream" 
                          className="h-10 brightness-0 invert opacity-90"
                      />
                  </Link>
              </div>
              
              <div className="max-w-xl">
                  <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-5xl font-extrabold text-white leading-tight mb-6"
                  >
                      Build skills that move businesses forward.
                  </motion.h1>
                  
                  <motion.ul 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4 text-gray-300 text-lg"
                  >
                      <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                          Premium corporate learning tracks
                      </li>
                      <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                          Real-time progress analytics
                      </li>
                      <li className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                          Verifiable digital certifications
                      </li>
                  </motion.ul>
              </div>
              
              <div className="text-gray-400 text-sm">
                  &copy; {new Date().getFullYear()} SkillStream Enterprise LMS
              </div>
          </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
          {/* Mobile Background Effect */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent -z-10 lg:hidden" />
          
          <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-md"
          >
              <div className="text-center lg:text-left mb-8">
                  <div className="lg:hidden mb-8">
                      <Link to="/">
                          <img src="/skillstream-logo-full.png" alt="SkillStream Logo" className="h-12 mx-auto object-contain" />
                      </Link>
                  </div>
                  <h2 className="text-3xl font-extrabold text-foreground mb-2">Welcome Back</h2>
                  <p className="text-muted-foreground">Sign in to your account to continue.</p>
              </div>

              <div className="bg-[#F6F8FD] dark:bg-[#11161F] p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-white/5 relative z-10">
          
                {successMessage && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-emerald-400">{successMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Username</label>
                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#FFFFFF] dark:bg-[#151B26] border border-gray-200 dark:border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 hover:opacity-90 text-white !rounded-tl-2xl !rounded-br-2xl !rounded-tr-md !rounded-bl-md font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isLoading ? 'Authenticating...' : 'Sign In'}
                  </button>
                  
                  <div className="mt-8 text-center">
                    <span className="text-muted-foreground text-sm">Don't have an account yet? </span>
                    <Link to="/register" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold text-sm transition-colors">
                      Create Account &rarr;
                    </Link>
                  </div>
                </form>
              </div>
          </motion.div>
      </div>
    </div>
  );
};

export default Login;
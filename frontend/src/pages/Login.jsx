import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BiShieldQuarter, BiLockAlt, BiUser } from 'react-icons/bi';

const Login = () => {
  const { loginUser } = useDashboard();
  const [username, setUsername] = useState('officer');
  const [password, setPassword] = useState('officer123');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await loginUser(username, password);
    if (!result.success) {
      setError(result.error || 'Invalid safety credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b13] relative overflow-hidden font-sans">
      {/* Decorative background grid and gradients */}
      <div className="absolute inset-0 bg-radial-gradient(at 50% 50%, rgba(6, 182, 212, 0.08) 0px, transparent 55%)"></div>
      <div className="absolute inset-0 border border-white/5 grid grid-cols-12 grid-rows-12 opacity-10 pointer-events-none">
        {Array.from({ length: 144 }).map((_, i) => (
          <div key={i} className="border border-white/5"></div>
        ))}
      </div>

      <div className="w-full max-w-md p-8 bg-[#101726]/90 backdrop-blur-md border border-[#1e293b] rounded-2xl shadow-2xl relative z-10 glass-panel">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-neon-cyan/10 border border-neon-cyan/35 rounded-2xl flex items-center justify-center text-neon-cyan mx-auto shadow-neon-cyan mb-4 animate-pulse">
            <BiShieldQuarter size={36} />
          </div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-white">SAIL Bhilai Steel Plant</h2>
          <p className="text-[10px] text-neon-cyan font-bold uppercase tracking-widest mt-1">AI Safety Control portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-neon-crimson/10 border border-neon-crimson/30 text-neon-crimson font-semibold rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold uppercase tracking-wide text-[10px]">Safety Username</label>
            <div className="bg-[#070b13] border border-[#1e293b] focus-within:border-neon-cyan rounded-lg flex items-center px-3 py-2.5 transition-all">
              <BiUser className="text-slate-400 mr-2" size={16} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter safety ID"
                className="bg-transparent border-none outline-none w-full text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold uppercase tracking-wide text-[10px]">Security Password</label>
            <div className="bg-[#070b13] border border-[#1e293b] focus-within:border-neon-cyan rounded-lg flex items-center px-3 py-2.5 transition-all">
              <BiLockAlt className="text-slate-400 mr-2" size={16} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-transparent border-none outline-none w-full text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3 bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-[#070b13] border border-neon-cyan/40 hover:border-neon-cyan rounded-xl font-bold uppercase tracking-wider transition-all duration-300 shadow-neon-cyan/10"
          >
            Acknowledge Session
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#1e293b]/50 text-center text-[10px] text-slate-400">
          <p>Hint: use <strong className="text-white">officer / officer123</strong> to log in as Safety Officer</p>
          <p>or <strong className="text-white">admin / admin123</strong> for Admin console</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

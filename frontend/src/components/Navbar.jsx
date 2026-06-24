import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BiBell, BiSearch, BiChip, BiUser, BiSun, BiMoon } from 'react-icons/bi';

const Navbar = () => {
  const { user, violations, theme, toggleTheme } = useDashboard();
  const [showNotif, setShowNotif] = useState(false);

  // Filter unresolved high-severity violations to display as alerts
  const pendingViolations = violations.filter(v => !v.is_resolved).slice(0, 4);

  return (
    <header className="h-16 bg-scada-panel border-b border-scada-border/70 flex items-center justify-between px-6 z-20">
      {/* 1. System title */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 font-sans hidden md:block">
          SAIL Bhilai Steel Plant <span className="text-neon-cyan">| Safety Command Center</span>
        </h2>
      </div>

      {/* 2. Search & Telemetry Controls */}
      <div className="flex items-center gap-6">
        {/* Dynamic AI CPU/GPU Inference Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-scada-bg border border-scada-border/50 rounded-lg text-xs">
          <BiChip className="text-neon-cyan animate-pulse" size={16} />
          <span className="text-scada-muted">CUDA Inference:</span>
          <span className="text-neon-emerald font-bold">98.4 FPS</span>
          <span className="w-1.5 h-3 bg-scada-border"></span>
          <span className="text-scada-muted">GPU Temp:</span>
          <span className="text-neon-amber font-bold">54°C</span>
        </div>

        {/* Theme Toggle Switch */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-scada-muted hover:text-white bg-steel-900 border border-scada-border/50 hover:border-scada-border rounded-lg transition-all flex items-center justify-center"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <BiSun size={20} /> : <BiMoon size={20} />}
        </button>

        {/* 3. Notification alert bell dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 text-scada-muted hover:text-white bg-steel-900 border border-scada-border/50 hover:border-scada-border rounded-lg relative transition-all"
          >
            <BiBell size={20} />
            {pendingViolations.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-neon-crimson rounded-full animate-ping shadow-neon-red"></span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-scada-panel border border-scada-border shadow-2xl rounded-xl z-50 overflow-hidden glass-panel">
              <div className="p-3 bg-steel-800 border-b border-scada-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-white">Active Safety Alerts</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-neon-crimson text-white rounded-full">
                  {pendingViolations.length} Pending
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-scada-border/50">
                {pendingViolations.length === 0 ? (
                  <div className="p-4 text-center text-xs text-scada-muted">
                    No active safety alarms triggered.
                  </div>
                ) : (
                  pendingViolations.map((v) => (
                    <div key={v.id} className="p-3 hover:bg-steel-900/40 transition-all flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-neon-crimson">{v.violation_type}</span>
                        <span className="text-[9px] text-scada-muted">
                          {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Offender: <strong className="text-white">{v.employee_name}</strong> at {v.location}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Active Safety Officer User Profile Card */}
        {user && (
          <div className="flex items-center gap-3 border-l border-scada-border/70 pl-6">
            <div className="text-right hidden sm:block">
              <h4 className="text-xs font-bold text-slate-100">{user.full_name}</h4>
              <p className="text-[10px] text-neon-cyan font-semibold">{user.role_name}</p>
            </div>
            <div className="w-9 h-9 bg-steel-800 border border-neon-cyan/35 rounded-lg flex items-center justify-center text-neon-cyan shadow-neon-cyan/15">
              <BiUser size={18} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import sailLogo from '../assets/sail_logo.png';
import { 
  BiSolidDashboard, BiVideoRecording, BiErrorCircle, 
  BiGroup, BiBarChartSquare, BiFile, BiLogOut, BiShieldQuarter
} from 'react-icons/bi';

const Sidebar = ({ activePage, setActivePage }) => {
  const { kpis, logoutUser } = useDashboard();

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <BiSolidDashboard size={20} /> },
    { id: 'live', name: 'Live Monitoring', icon: <BiVideoRecording size={20} /> },
    { id: 'violations', name: 'Violations', icon: <BiErrorCircle size={20} />, badge: kpis.activeAlerts },
    { id: 'employees', name: 'Employees', icon: <BiGroup size={20} /> },
    { id: 'analytics', name: 'Analytics', icon: <BiBarChartSquare size={20} /> },
    { id: 'reports', name: 'Reports', icon: <BiFile size={20} /> },
  ];

  return (
    <aside className="w-64 bg-scada-panel border-r border-scada-border/70 flex flex-col h-screen select-none z-30">
      {/* 1. Header BSP Identity */}
      <div className="p-5 border-b border-scada-border/50 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center p-1.5 shadow-md">
          <img src={sailLogo} alt="SAIL Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide text-white font-sans">SAIL BSP</h1>
          <p className="text-[10px] text-neon-cyan uppercase font-bold tracking-widest">AI Safety Node</p>
        </div>
      </div>

      {/* 2. Menu navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-steel-800 text-neon-cyan border border-neon-cyan/35 shadow-neon-cyan/10' 
                  : 'text-scada-muted hover:bg-steel-900/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-neon-cyan' : 'text-scada-muted'}>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              {item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold bg-neon-crimson text-white rounded-full animate-pulse shadow-neon-red">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. Footer branding status */}
      <div className="p-4 border-t border-scada-border/50 bg-scada-bg/40">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 bg-neon-emerald rounded-full animate-ping shadow-neon-green"></span>
          <span className="text-xs text-scada-muted font-medium">Inference System Online</span>
        </div>
        <button
          onClick={logoutUser}
          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-neon-crimson hover:bg-neon-crimson/10 rounded-lg transition-all"
        >
          <BiLogOut size={16} />
          <span>Logout Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

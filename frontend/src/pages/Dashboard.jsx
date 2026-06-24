import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, 
  BarChart, Bar, Cell
} from 'recharts';
import { 
  BiErrorCircle, BiCheckShield, BiVideo, BiTrendingUp, 
  BiBadgeCheck, BiChevronRight 
} from 'react-icons/bi';

const Dashboard = ({ setActivePage }) => {
  const { kpis, violations, resolveViolation } = useDashboard();

  // Pick recent 4 violations for visual ledger
  const recentViolations = violations.slice(0, 4);

  // 1. KPI config cards
  const kpiCards = [
    { title: 'Violations Today', value: kpis.violationsToday, icon: <BiErrorCircle size={24} />, color: 'neon-crimson', glow: 'glow-red', desc: 'Active safety infractions' },
    { title: 'Active Alert Queue', value: kpis.activeAlerts, icon: <BiCheckShield size={24} className="animate-pulse" />, color: 'neon-amber', glow: 'shadow-neon-red border-neon-amber/50', desc: 'Requires immediate closure' },
    { title: 'Cameras Online', value: `${kpis.camerasOnline}/6`, icon: <BiVideo size={24} />, color: 'neon-emerald', glow: 'glow-green', desc: 'RTSP video feeds locked' },
    { title: 'PPE Compliance Rate', value: `${kpis.ppeCompliance}%`, icon: <BiBadgeCheck size={24} />, color: 'neon-cyan', glow: 'glow-cyan', desc: 'Target plant safety threshold: >95%' },
    { title: 'Monthly Safety Score', value: `${kpis.safetyScore}/100`, icon: <BiBadgeCheck size={24} />, color: 'neon-cyan', glow: 'glow-cyan', desc: 'Historical safety index' },
  ];

  // 2. High-fidelity Recharts Data
  const weeklyTrends = [
    { name: 'Mon', Violations: 4, Compliance: 92 },
    { name: 'Tue', Violations: 2, Compliance: 95 },
    { name: 'Wed', Violations: 5, Compliance: 91 },
    { name: 'Thu', Violations: 1, Compliance: 97 },
    { name: 'Fri', Violations: 3, Compliance: 94 },
    { name: 'Sat', Violations: 0, Compliance: 99 },
    { name: 'Sun', Violations: kpis.violationsToday, Compliance: kpis.ppeCompliance },
  ];

  const departmentData = [
    { name: 'Blast Furnace', Score: 90.5, color: '#ef4444' },
    { name: 'SMS', Score: 88.2, color: '#f59e0b' },
    { name: 'Coke Oven', Score: 94.0, color: '#10b981' },
    { name: 'Power Plant', Score: 96.5, color: '#10b981' },
    { name: 'Rail Mill', Score: 92.1, color: '#06b6d4' },
    { name: 'IT Dept', Score: 100.0, color: '#06b6d4' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* A. KPI panels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
        {kpiCards.map((kpi, idx) => (
          <div key={idx} className={`glass-panel p-5 border flex flex-col justify-between h-36 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] ${kpi.glow}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-scada-muted font-bold uppercase tracking-wider">{kpi.title}</p>
                <h3 className="text-3xl font-extrabold font-sans text-white mt-2">{kpi.value}</h3>
              </div>
              <div className="p-2.5 bg-steel-900 rounded-lg text-slate-300 border border-scada-border">
                {kpi.icon}
              </div>
            </div>
            <p className="text-[10px] text-scada-muted font-medium mt-4">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* B. Middle visual charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly violation index chart */}
        <div className="lg:col-span-2 glass-panel p-5 border border-scada-border/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase text-white tracking-wider">Weekly Safety Ledger & Trend</h3>
              <p className="text-[10px] text-scada-muted">Cross-correlating active violations with PPE compliance coefficients</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-neon-cyan rounded"></span><span className="text-scada-muted">PPE %</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-neon-crimson rounded"></span><span className="text-scada-muted">Violations</span></div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="colorCompliance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#101726', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Area type="monotone" dataKey="Compliance" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCompliance)" />
                <Area type="monotone" dataKey="Violations" stroke="#ef4444" strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department compliance scores bar chart */}
        <div className="glass-panel p-5 border border-scada-border/60">
          <h3 className="text-sm font-bold uppercase text-white tracking-wider mb-2">Department Compliance Ratings</h3>
          <p className="text-[10px] text-scada-muted mb-4">Plant ranking sorted by safety compliance index</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#101726', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Bar dataKey="Score" radius={[0, 4, 4, 0]} barSize={12}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* C. Recent Violations Ledger Grid */}
      <div className="glass-panel p-5 border border-scada-border/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase text-white tracking-wider">Recent Safety Violations Feed</h3>
            <p className="text-[10px] text-scada-muted">Real-time edge detections synced with CCTV camera nodes</p>
          </div>
          <button 
            onClick={() => setActivePage('violations')}
            className="flex items-center gap-1.5 text-xs text-neon-cyan hover:underline font-bold"
          >
            <span>View Safety Center Ledger</span>
            <BiChevronRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-scada-border/80 text-[10px] text-scada-muted uppercase font-bold tracking-wider">
                <th className="pb-3">Worker ID / Name</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Camera Location</th>
                <th className="pb-3">Time Triggered</th>
                <th className="pb-3">Violation Type</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Action Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scada-border/30 text-xs">
              {recentViolations.map((v) => (
                <tr key={v.id} className="hover:bg-steel-900/10 transition-all">
                  <td className="py-4">
                    <div className="font-semibold text-white">{v.employee_name}</div>
                    <div className="text-[10px] text-scada-muted">{v.employee_id || 'UNKNOWN PERSON'}</div>
                  </td>
                  <td className="py-4 text-slate-300">{v.department}</td>
                  <td className="py-4 text-slate-300">{v.location}</td>
                  <td className="py-4 text-slate-300">
                    {new Date(v.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded bg-neon-crimson/10 text-neon-crimson border border-neon-crimson/25 font-semibold text-[10px]">
                      {v.violation_type}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      v.severity === 'Critical' 
                        ? 'bg-neon-crimson text-white shadow-neon-red' 
                        : v.severity === 'High' 
                        ? 'bg-neon-crimson/20 text-neon-crimson' 
                        : v.severity === 'Medium' 
                        ? 'bg-neon-amber/20 text-neon-amber' 
                        : 'bg-neon-cyan/20 text-neon-cyan'
                    }`}>
                      {v.severity}
                    </span>
                  </td>
                  <td className="py-4">
                    {v.is_resolved ? (
                      <span className="text-neon-emerald font-bold flex items-center gap-1">
                        Resolved
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const notes = prompt("Enter resolution notes:", "Attire corrected. Access granted.");
                          if (notes !== null) resolveViolation(v.id, notes);
                        }}
                        className="px-3 py-1 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/40 hover:border-neon-cyan rounded transition-all font-semibold"
                      >
                        Acknowledge & Resolve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

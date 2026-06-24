import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BiFilterAlt, BiInfoCircle, BiSearchAlt2, BiCheckCircle } from 'react-icons/bi';

const Violations = () => {
  const { violations, resolveViolation } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedViol, setSelectedViol] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // 1. Filter implementation
  const filteredViolations = violations.filter(v => {
    const matchesSearch = 
      (v.employee_name && v.employee_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.employee_id && v.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (v.violation_type && v.violation_type.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesDept = filterDept === 'All' || v.department === filterDept;
    const matchesSeverity = filterSeverity === 'All' || v.severity === filterSeverity;
    const matchesStatus = filterStatus === 'All' || 
      (filterStatus === 'Active' && !v.is_resolved) || 
      (filterStatus === 'Resolved' && v.is_resolved);

    return matchesSearch && matchesDept && matchesSeverity && matchesStatus;
  });

  const handleResolve = (id) => {
    const notes = resolutionNotes.trim() || "Compliance restored. Worker corrected attire.";
    resolveViolation(id, notes);
    setSelectedViol(null);
    setResolutionNotes('');
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical': return 'bg-neon-crimson text-white shadow-neon-red';
      case 'High': return 'bg-neon-crimson/25 text-neon-crimson border border-neon-crimson/20';
      case 'Medium': return 'bg-neon-amber/25 text-neon-amber border border-neon-amber/20';
      default: return 'bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* A. Filters & Search controls */}
      <div className="glass-panel p-5 border border-scada-border/50 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="w-full lg:w-72 bg-scada-bg border border-scada-border rounded-lg flex items-center px-3 py-2 text-xs">
          <BiSearchAlt2 className="text-scada-muted mr-2" size={18} />
          <input 
            type="text" 
            placeholder="Search by worker name, ID, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none w-full text-white placeholder-scada-muted"
          />
        </div>

        {/* Dropdowns */}
        <div className="w-full lg:w-auto flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <BiFilterAlt className="text-scada-muted" />
            <span className="text-scada-muted font-bold">Filters:</span>
          </div>

          <select 
            value={filterDept} 
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-steel-800 border border-scada-border rounded-lg px-3 py-2 text-white outline-none"
          >
            <option value="All">All Departments</option>
            <option value="Blast Furnace">Blast Furnace</option>
            <option value="Steel Melting Shop">Steel Melting Shop</option>
            <option value="Coke Oven">Coke Oven</option>
            <option value="Power Plant">Power Plant</option>
            <option value="Rail & Structural Mill">Rail Mill</option>
            <option value="Information Technology">IT Dept</option>
          </select>

          <select 
            value={filterSeverity} 
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="bg-steel-800 border border-scada-border rounded-lg px-3 py-2 text-white outline-none"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-steel-800 border border-scada-border rounded-lg px-3 py-2 text-white outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Alarm</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* B. Violations Data Grid */}
      <div className="glass-panel p-5 border border-scada-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-scada-border/80 text-[10px] text-scada-muted uppercase font-bold tracking-wider">
                <th className="pb-3">Incident ID</th>
                <th className="pb-3">Worker Info</th>
                <th className="pb-3">Location / Department</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Violation Type</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-scada-border/30 text-xs">
              {filteredViolations.map((v) => (
                <tr key={v.id} className="hover:bg-steel-900/10 transition-all">
                  <td className="py-4 font-mono font-bold text-neon-cyan">#{v.id}</td>
                  <td className="py-4">
                    <div className="font-semibold text-white">{v.employee_name || 'Unknown Worker'}</div>
                    <div className="text-[10px] text-scada-muted">{v.employee_id || 'UNKNOWN'}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-slate-200 font-semibold">{v.location || 'Unknown Location'}</div>
                    <div className="text-[10px] text-scada-muted">{v.department || 'Unknown Dept'}</div>
                  </td>
                  <td className="py-4 text-slate-300">
                    {new Date(v.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded bg-neon-crimson/10 text-neon-crimson border border-neon-crimson/20 font-semibold">
                      {v.violation_type}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getSeverityBadge(v.severity)}`}>
                      {v.severity}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className={`font-semibold ${v.is_resolved ? 'text-neon-emerald' : 'text-neon-amber animate-pulse'}`}>
                      {v.is_resolved ? 'Resolved' : 'Active Alarm'}
                    </span>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => setSelectedViol(v)}
                      className="px-3 py-1 bg-steel-800 hover:bg-steel-700 text-slate-200 border border-scada-border hover:border-slate-500 rounded transition-all font-semibold flex items-center gap-1.5"
                    >
                      <BiInfoCircle size={14} />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* C. Visual Incident Inspector Modal */}
      {selectedViol && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-panel border border-scada-border w-full max-w-2xl overflow-hidden rounded-2xl">
            {/* Modal header */}
            <div className="p-4 bg-steel-800 border-b border-scada-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider">Incident Inspection Portal</h3>
                <p className="text-[10px] text-neon-cyan font-bold">ALARM REFERENCE ID: #{selectedViol.id}</p>
              </div>
              <button 
                onClick={() => { setSelectedViol(null); setResolutionNotes(''); }}
                className="text-xs text-scada-muted hover:text-white"
              >
                Close Portal
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual Evidence Snapshot Box */}
                <div className="bg-black/60 border border-scada-border/70 rounded-xl p-4 flex flex-col items-center justify-center h-52 relative cctv-scanline">
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-[9px] font-bold text-neon-crimson border border-neon-crimson/30 rounded uppercase tracking-widest animate-pulse">
                    Evidence Capture
                  </div>
                  {/* Drawing overlapping bounding box in modal */}
                  <div className="text-center">
                    <div className="w-16 h-20 border border-neon-crimson shadow-neon-red flex items-center justify-center text-neon-crimson font-mono text-[9px] mx-auto animate-pulse">
                      BBOX: OFFENDER
                    </div>
                    <span className="text-[10px] text-scada-muted block mt-4 font-semibold uppercase tracking-wider">YOLOv8 Frame Crop locked</span>
                  </div>
                </div>

                {/* Audit Checklist & Worker details */}
                <div className="space-y-4 text-xs">
                  <h4 className="font-bold uppercase tracking-wider text-white border-b border-scada-border pb-1">Worker Ledger</h4>
                  <div className="space-y-2 text-slate-300">
                    <p>Name: <strong className="text-white">{selectedViol.employee_name || 'UNKNOWN WORKER'}</strong></p>
                    <p>Employee ID: <strong className="text-white">{selectedViol.employee_id || 'UNKNOWN PERSON'}</strong></p>
                    <p>Camera: <strong className="text-white">{selectedViol.location || 'UNKNOWN LOCATION'}</strong></p>
                    <p>Violation Time: <strong className="text-white">{new Date(selectedViol.timestamp).toLocaleString()}</strong></p>
                  </div>

                  <h4 className="font-bold uppercase tracking-wider text-white border-b border-scada-border pb-1 mt-4">PPE Gear Audit Checklist</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Safety Hardhat (Helmet):</span>
                      <span className={`font-bold ${selectedViol.violation_type === 'Helmet Missing' ? 'text-neon-crimson animate-pulse' : 'text-neon-emerald'}`}>
                        {selectedViol.violation_type === 'Helmet Missing' ? 'MISSING' : 'SECURE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Steel Toe Safety Shoes:</span>
                      <span className={`font-bold ${selectedViol.violation_type === 'Safety Shoes Missing' ? 'text-neon-crimson' : 'text-neon-emerald'}`}>
                        {selectedViol.violation_type === 'Safety Shoes Missing' ? 'MISSING' : 'SECURE'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reflective High-Vis Vest:</span>
                      <span className={`font-bold ${selectedViol.violation_type === 'Reflective Jacket Missing' ? 'text-neon-crimson' : 'text-neon-emerald'}`}>
                        {selectedViol.violation_type === 'Reflective Jacket Missing' ? 'MISSING' : 'SECURE'}
                      </span>
                    </div>
                    {selectedViol.location?.includes('Blast Furnace') || selectedViol.location?.includes('SMS') ? (
                      <div className="flex items-center justify-between">
                        <span>Tether Safety Harness (Belt):</span>
                        <span className={`font-bold ${selectedViol.violation_type === 'Safety Belt Missing' ? 'text-neon-crimson animate-pulse' : 'text-neon-emerald'}`}>
                          {selectedViol.violation_type === 'Safety Belt Missing' ? 'MISSING' : 'SECURE'}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Action Resolution box */}
              <div className="border-t border-scada-border/70 pt-4">
                {selectedViol.is_resolved ? (
                  <div className="p-4 bg-neon-emerald/10 border border-neon-emerald/25 rounded-xl flex items-center gap-3 text-xs">
                    <BiCheckCircle className="text-neon-emerald" size={24} />
                    <div className="text-slate-300">
                      <p className="font-bold text-white">Safety Incident Acknowledged & Resolved</p>
                      <p>Resolved by safety officer: <strong className="text-white">{selectedViol.resolved_by}</strong></p>
                      <p>Audit Notes: <em className="text-neon-cyan">"{selectedViol.resolution_notes}"</em></p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-scada-muted">Action and Resolution Log Notes</label>
                    <textarea 
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="e.g. Worker corrected attire. Safety rules acknowledged. Re-entry granted."
                      className="w-full bg-scada-bg border border-scada-border rounded-xl p-3 text-xs text-white outline-none focus:border-neon-cyan h-20 resize-none"
                    />
                    <div className="flex justify-end gap-3 mt-3">
                      <button 
                        onClick={() => handleResolve(selectedViol.id)}
                        className="px-4 py-2 bg-neon-emerald/20 hover:bg-neon-emerald text-neon-emerald hover:text-white border border-neon-emerald/40 rounded-xl text-xs font-bold transition-all"
                      >
                        Acknowledge & Close Alarm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Violations;

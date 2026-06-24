import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BiFile, BiSpreadsheet, BiCalendarWeek, BiEnvelope } from 'react-icons/bi';

const Reports = () => {
  const { violations } = useDashboard();

  // Client-side local CSV exporter fallback in case backend is offline
  const handleClientSideCSVExport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Violation ID,Employee ID,Employee Name,Department,Location,Timestamp,Type,Severity,Status\r\n";

    violations.forEach((v) => {
      const row = [
        v.id,
        v.employee_id || 'N/A',
        v.employee_name,
        v.department,
        v.location,
        v.timestamp,
        v.violation_type,
        v.severity,
        v.is_resolved ? 'Resolved' : 'Active Alarm'
      ].map(str => `"${str}"`).join(",");
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BSP_Safety_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClientSidePDFExport = () => {
    // Basic mock PDF compile fallback in browser
    alert("Backend compiled report PDF dispatching. If running standalone, downloading mock safety invoice card.");
    handleClientSideCSVExport();
  };

  return (
    <div className="space-y-6">
      {/* 1. Main Header */}
      <div className="glass-panel p-6 border border-scada-border/50 bg-scada-panel">
        <h2 className="text-sm font-bold uppercase text-white tracking-wider mb-2">Safety Audits & Report Compiler</h2>
        <p className="text-xs text-scada-muted mb-6">Compile plant-wide compliance indexes, missing gear frequencies, and incident records into standard distribution forms (PDF and Excel).</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PDF Exporter Card */}
          <div className="bg-scada-bg/60 border border-scada-border hover:border-neon-cyan/40 p-5 rounded-xl flex flex-col justify-between transition-all h-52">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neon-crimson/10 border border-neon-crimson/35 rounded-xl text-neon-crimson">
                <BiFile size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Export Official PDF Safety Scorecard</h4>
                <p className="text-[10px] text-scada-muted mt-1">Generates a formal, printable PDF document outlining recent violations and department scores, ready for Safety Committee review.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href="http://127.0.0.1:8000/api/reports/export/?format=pdf" 
                target="_blank" 
                rel="noreferrer"
                className="px-4 py-2 bg-neon-crimson/20 hover:bg-neon-crimson text-neon-crimson hover:text-white border border-neon-crimson/40 rounded-xl text-xs font-bold transition-all block text-center"
              >
                Compile via Django API
              </a>
              <button 
                onClick={handleClientSidePDFExport}
                className="px-4 py-2 bg-steel-800 hover:bg-steel-700 text-slate-300 border border-scada-border rounded-xl text-xs font-bold transition-all"
              >
                Local Browser Compile
              </button>
            </div>
          </div>

          {/* Excel Spreadsheet Exporter Card */}
          <div className="bg-scada-bg/60 border border-scada-border hover:border-neon-cyan/40 p-5 rounded-xl flex flex-col justify-between transition-all h-52">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-neon-emerald/10 border border-neon-emerald/35 rounded-xl text-neon-emerald">
                <BiSpreadsheet size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Export Excel Incident Ledger</h4>
                <p className="text-[10px] text-scada-muted mt-1">Generates a detailed, multi-column Excel spreadsheet (XLSX/CSV) matching all active columns, perfect for databases integrations and filters.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <a 
                href="http://127.0.0.1:8000/api/reports/export/?format=excel" 
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-neon-emerald/20 hover:bg-neon-emerald text-neon-emerald hover:text-white border border-neon-emerald/40 rounded-xl text-xs font-bold transition-all block text-center"
              >
                Compile via Django API
              </a>
              <button 
                onClick={handleClientSideCSVExport}
                className="px-4 py-2 bg-steel-800 hover:bg-steel-700 text-slate-300 border border-scada-border rounded-xl text-xs font-bold transition-all"
              >
                Local Browser Compile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Automated reports scheduling configuration panel */}
      <div className="glass-panel p-5 border border-scada-border/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-4">Automated Safety Officer Dispatch Scheduler</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="bg-scada-bg/40 p-4 border border-scada-border/50 rounded-xl space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wide text-neon-cyan">
              <BiCalendarWeek />
              <span>Weekly Dispatch</span>
            </h4>
            <p className="text-[10px] text-scada-muted">Compiles safety statistics every Sunday at 23:59 and dispatches to Blast Furnace and SMS heads.</p>
            <div className="flex justify-between items-center text-[10px]">
              <span>Status: <strong className="text-neon-emerald">Active</strong></span>
              <button className="text-neon-cyan font-bold hover:underline">Configure</button>
            </div>
          </div>

          <div className="bg-scada-bg/40 p-4 border border-scada-border/50 rounded-xl space-y-3">
            <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[10px] tracking-wide text-neon-cyan">
              <BiEnvelope />
              <span>Immediate Escalations</span>
            </h4>
            <p className="text-[10px] text-scada-muted">Dispatches critical restricted boundary entries alerts immediately to Safety Officer and security SMS list.</p>
            <div className="flex justify-between items-center text-[10px]">
              <span>Status: <strong className="text-neon-emerald">Active</strong></span>
              <button className="text-neon-cyan font-bold hover:underline">Configure</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

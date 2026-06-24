import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BiUserPlus, BiFingerprint, BiCamera, BiBadgeCheck, BiArrowBack } from 'react-icons/bi';

const Employees = () => {
  const { employees, departments, addEmployee } = useDashboard();
  const [showAddForm, setShowAddForm] = useState(false);
  const [enrollerEmp, setEnrollerEmp] = useState(null);

  // New Employee fields
  const [empId, setEmpId] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [deptId, setDeptId] = useState(1);
  const [designation, setDesignation] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  // 360° Face Registration State
  const [faceAngles, setFaceAngles] = useState({
    Front: null,
    Left: null,
    Right: null,
    Upper: null,
    Lower: null,
    Passport: null
  });
  const [activeAngle, setActiveAngle] = useState('Front');
  const [isScanning, setIsScanning] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!empId || !first || !last) {
      alert("Please fill required fields.");
      return;
    }
    const deptObj = departments.find(d => d.id === parseInt(deptId)) || departments[0];

    addEmployee({
      employee_id: empId,
      first_name: first,
      last_name: last,
      department: parseInt(deptId),
      designation,
      mobile_number: mobile,
      email_address: email,
      joining_date: joiningDate || new Date().toISOString().split('T')[0]
    });

    // Reset
    setShowAddForm(false);
    setEmpId('');
    setFirst('');
    setLast('');
    setDesignation('');
    setMobile('');
    setEmail('');
  };

  const handleCaptureAngle = () => {
    setIsScanning(true);
    setTimeout(() => {
      // Generate a mock face vector encoding
      const mockVector = Array.from({ length: 6 }, () => (Math.random() * 2 - 1).toFixed(4));
      
      setFaceAngles(prev => ({
        ...prev,
        [activeAngle]: {
          timestamp: new Date().toLocaleTimeString(),
          signature: `[${mockVector.join(', ')}...]`
        }
      }));
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* If 360 Face Registration Enroller Mode is active */}
      {enrollerEmp ? (
        <div className="space-y-6 animate-fade-in">
          {/* Back button */}
          <div className="flex items-center justify-between glass-panel p-4 border border-scada-border/50">
            <button 
              onClick={() => { setEnrollerEmp(null); setFaceAngles({ Front: null, Left: null, Right: null, Upper: null, Lower: null, Passport: null }); }}
              className="flex items-center gap-1.5 text-xs text-scada-muted hover:text-white transition-all font-bold"
            >
              <BiArrowBack size={18} />
              <span>Back to Directory</span>
            </button>
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wide">360° Facial Biometrics Enroller</h2>
              <p className="text-[10px] text-neon-cyan font-semibold">Enrolling biometric signatures for: {enrollerEmp.first_name} {enrollerEmp.last_name} ({enrollerEmp.employee_id})</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera Capture Stream Box */}
            <div className="lg:col-span-2 glass-panel p-5 border border-scada-border/50 flex flex-col h-[460px]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-4">Biometric Registration Stream</h3>
              
              <div className="flex-1 bg-black rounded-xl border border-scada-border relative overflow-hidden flex items-center justify-center cctv-scanline">
                <div className="absolute top-3 left-3 bg-black/60 px-2 py-0.5 text-[9px] font-bold text-neon-cyan border border-neon-cyan/30 rounded uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                  <BiCamera />
                  <span>Scanning: {activeAngle} Perspective</span>
                </div>

                {isScanning && (
                  <div className="absolute inset-0 bg-neon-cyan/5 flex flex-col items-center justify-center z-15">
                    {/* Animated laser scanline line */}
                    <div className="absolute inset-x-0 h-0.5 bg-neon-cyan animate-scanline shadow-neon-cyan"></div>
                    <div className="text-xs font-bold text-neon-cyan animate-pulse">Extracting Facial Embeddings...</div>
                  </div>
                )}

                <div className="text-center text-scada-muted">
                  <BiFingerprint size={64} className={`mx-auto ${isScanning ? 'text-neon-cyan animate-ping' : 'text-steel-600'}`} />
                  <span className="text-[10px] text-steel-500 font-bold uppercase tracking-widest block mt-4">Place worker face within camera guide</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-scada-muted">Active Profile Angle: <strong className="text-white">{activeAngle}</strong></span>
                <button
                  onClick={handleCaptureAngle}
                  disabled={isScanning}
                  className="px-6 py-2.5 bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-scada-bg border border-neon-cyan/40 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Capture & Generate Signature
                </button>
              </div>
            </div>

            {/* 360 Angles Checklist panel */}
            <div className="glass-panel p-5 border border-scada-border/50 flex flex-col h-[460px] overflow-y-auto">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-4">360° Facial Checklist</h3>
              
              <div className="flex-1 space-y-3">
                {Object.keys(faceAngles).map((angle) => {
                  const data = faceAngles[angle];
                  const isCurrent = activeAngle === angle;

                  return (
                    <button
                      key={angle}
                      onClick={() => setActiveAngle(angle)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isCurrent 
                          ? 'bg-steel-800 border-neon-cyan shadow-neon-cyan/10' 
                          : 'bg-scada-bg/40 border-scada-border hover:border-steel-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-white uppercase">{angle} Face Angle</div>
                        {data ? (
                          <div className="text-[8px] font-mono text-neon-cyan mt-1 max-w-[200px] truncate">{data.signature}</div>
                        ) : (
                          <div className="text-[9px] text-scada-muted">Pending biometric capture</div>
                        )}
                      </div>
                      {data ? (
                        <BiBadgeCheck className="text-neon-emerald" size={20} />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-scada-border"></span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Complete enroller check */}
              <button
                onClick={() => {
                  const allDone = Object.values(faceAngles).every(x => x !== null);
                  if (allDone) {
                    alert("All 360° profiles registered successfully. AI model cache compiled.");
                    setEnrollerEmp(null);
                  } else {
                    alert("Please capture all 6 facial angles first.");
                  }
                }}
                className="w-full mt-4 py-2.5 bg-neon-emerald/20 hover:bg-neon-emerald text-neon-emerald hover:text-white border border-neon-emerald/40 hover:border-neon-emerald rounded-xl text-xs font-bold transition-all"
              >
                Compile Biometric Embeddings
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Normal Employee Directory mode */
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex justify-between items-center glass-panel p-4 border border-scada-border/50">
            <div>
              <h2 className="text-sm font-bold uppercase text-white tracking-wider">Employee Registry & Biometrics</h2>
              <p className="text-[10px] text-scada-muted">Central directory of SAIL plant personnel and facial profiles</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-scada-bg border border-neon-cyan/40 hover:border-neon-cyan rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <BiUserPlus size={18} />
              <span>Register Employee</span>
            </button>
          </div>

          {/* Add Employee Form Drawer */}
          {showAddForm && (
            <div className="glass-panel p-5 border border-neon-cyan/40 animate-fade-in">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-4">Enroll New BSP Personnel</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">Employee ID (BSP Prefix) *</label>
                  <input type="text" placeholder="e.g. BSP2451" value={empId} onChange={(e) => setEmpId(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">First Name *</label>
                  <input type="text" placeholder="First Name" value={first} onChange={(e) => setFirst(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">Last Name *</label>
                  <input type="text" placeholder="Last Name" value={last} onChange={(e) => setLast(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">Department *</label>
                  <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan">
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.department_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">Designation *</label>
                  <input type="text" placeholder="e.g. Blast Operator" value={designation} onChange={(e) => setDesignation(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">Mobile Number *</label>
                  <input type="text" placeholder="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan" required />
                </div>
                <div>
                  <label className="block text-scada-muted mb-1 font-semibold">Email Address</label>
                  <input type="email" placeholder="email@sail-bsp.co.in" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-scada-bg border border-scada-border rounded-lg p-2.5 text-white outline-none focus:border-neon-cyan" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full py-2.5 bg-neon-cyan/20 hover:bg-neon-cyan text-neon-cyan hover:text-scada-bg border border-neon-cyan/40 hover:border-neon-cyan rounded-lg font-bold transition-all">
                    Save Roster Entry
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Employee Directory grid list */}
          <div className="glass-panel p-5 border border-scada-border/50">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-scada-border/80 text-[10px] text-scada-muted uppercase font-bold tracking-wider">
                    <th className="pb-3">Employee ID</th>
                    <th className="pb-3">Worker Name</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3">Designation</th>
                    <th className="pb-3">Mobile / Email</th>
                    <th className="pb-3">Active Violations</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">360° biometrics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-scada-border/30 text-xs">
                  {employees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-steel-900/10 transition-all">
                      <td className="py-4 font-mono font-bold text-neon-cyan">{emp.employee_id}</td>
                      <td className="py-4 font-semibold text-white">{emp.first_name} {emp.last_name}</td>
                      <td className="py-4 text-slate-300">{emp.department_name}</td>
                      <td className="py-4 text-slate-300">{emp.designation}</td>
                      <td className="py-4">
                        <div className="text-white">{emp.mobile_number}</div>
                        <div className="text-[10px] text-scada-muted">{emp.email_address}</div>
                      </td>
                      <td className="py-4 text-center font-bold text-slate-200">{emp.violations_count}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded-full bg-neon-emerald/20 text-neon-emerald text-[10px] font-bold">
                          {emp.employee_status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button
                          onClick={() => setEnrollerEmp(emp)}
                          className="px-3 py-1 bg-neon-cyan/15 hover:bg-neon-cyan/25 text-neon-cyan border border-neon-cyan/40 hover:border-neon-cyan rounded-lg font-semibold flex items-center gap-1.5 transition-all text-xs"
                        >
                          <BiFingerprint />
                          <span>360° Face Enroll</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { BiGridAlt, BiGridSmall, BiTv, BiStopwatch, BiExpand } from 'react-icons/bi';

const LiveMonitoring = () => {
  const { cameras, activeGridOverlay, violations, liveCameraFrames } = useDashboard();
  const [gridLayout, setGridLayout] = useState(4); // 1, 4, or 8 camera grids
  const [selectedCam, setSelectedCam] = useState(null);

  // Filter cameras based on active layout selections
  const visibleCameras = cameras.slice(0, gridLayout);

  const getLayoutClass = () => {
    switch (gridLayout) {
      case 1: return 'grid-cols-1';
      case 4: return 'grid-cols-1 md:grid-cols-2';
      case 8: return 'grid-cols-1 md:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-panel p-4 border border-scada-border/50">
        <div>
          <h2 className="text-sm font-bold uppercase text-white tracking-wider">CCTV Surveillance Grid Center</h2>
          <p className="text-[10px] text-scada-muted">Real-time edge analysis and YOLOv8 bounding box stream routing</p>
        </div>

        {/* Layout Grid Buttons */}
        <div className="flex items-center gap-2 bg-scada-bg border border-scada-border p-1 rounded-lg">
          <button 
            onClick={() => setGridLayout(1)} 
            className={`p-1.5 rounded transition-all text-xs font-bold flex items-center gap-1 ${gridLayout === 1 ? 'bg-steel-800 text-neon-cyan' : 'text-scada-muted hover:text-white'}`}
            title="Single Screen Full Monitor"
          >
            <BiTv size={16} />
            <span>1 Cam</span>
          </button>
          <button 
            onClick={() => setGridLayout(4)} 
            className={`p-1.5 rounded transition-all text-xs font-bold flex items-center gap-1 ${gridLayout === 4 ? 'bg-steel-800 text-neon-cyan' : 'text-scada-muted hover:text-white'}`}
            title="2x2 Quad Grid"
          >
            <BiGridAlt size={16} />
            <span>4 Cams</span>
          </button>
          <button 
            onClick={() => setGridLayout(8)} 
            className={`p-1.5 rounded transition-all text-xs font-bold flex items-center gap-1 ${gridLayout === 8 ? 'bg-steel-800 text-neon-cyan' : 'text-scada-muted hover:text-white'}`}
            title="4x2 Dense Grid"
          >
            <BiGridSmall size={16} />
            <span>8 Cams</span>
          </button>
        </div>
      </div>

      {/* 2. CCTV Cameras grid */}
      <div className={`grid ${getLayoutClass()} gap-5`}>
        {visibleCameras.map((cam) => {
          const overlays = activeGridOverlay[cam.camera_code] || [];
          const activeAlarms = violations.some(v => v.location === cam.location && !v.is_resolved);

          return (
            <div 
              key={cam.id} 
              className={`glass-panel border rounded-xl overflow-hidden flex flex-col relative h-[340px] transition-all group ${
                activeAlarms 
                  ? 'border-neon-crimson glow-red' 
                  : 'border-scada-border/70 hover:border-steel-700'
              }`}
            >
              {/* Camera header tag */}
              <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] text-white font-bold rounded border border-white/10 uppercase tracking-wide">
                    {cam.camera_code}
                  </span>
                  <span className="px-2 py-1 bg-black/60 backdrop-blur text-[10px] text-slate-300 font-bold rounded border border-white/10">
                    {cam.camera_name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shadow ${activeAlarms ? 'bg-neon-crimson animate-ping shadow-neon-red' : 'bg-neon-emerald shadow-neon-green'}`}></span>
                  <span className="px-1.5 py-0.5 bg-black/60 backdrop-blur text-[9px] text-neon-cyan font-bold rounded border border-white/10">
                    {cam.fps} FPS
                  </span>
                </div>
              </div>

              {/* Dynamic canvas stream overlay viewport */}
              <div className="flex-1 bg-black relative overflow-hidden flex items-center justify-center cctv-scanline">
                {/* Real-time frame rendering if stream is active */}
                {liveCameraFrames[cam.camera_code] ? (
                  <img 
                    src={liveCameraFrames[cam.camera_code]} 
                    alt={`Real CCTV feed ${cam.camera_code}`} 
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                  />
                ) : null}
                
                {/* Simulated worker rendering */}
                <div className="absolute inset-0 bg-slate-950/45 select-none pointer-events-none z-10">
                  {/* Dynamic canvas drawing bounding box */}
                  <svg className="absolute inset-0 w-full h-full">
                    {overlays.map((box) => (
                      <g key={box.id}>
                        {/* Person Bounding Box */}
                        <rect 
                          x={box.x} 
                          y={box.y} 
                          width={box.width} 
                          height={box.height} 
                          fill="none" 
                          stroke={box.color} 
                          strokeWidth={2}
                          strokeDasharray="4 2"
                        />
                        {/* Label Badge */}
                        <rect 
                          x={box.x} 
                          y={box.y - 20} 
                          width={110} 
                          height={20} 
                          fill={box.color} 
                          opacity={0.85}
                        />
                        <text 
                          x={box.x + 5} 
                          y={box.y - 6} 
                          fill="#ffffff" 
                          fontSize={9} 
                          fontWeight="bold"
                        >
                          {box.label}
                        </text>

                        {/* PPE status ticks inside overlay */}
                        <text x={box.x + 10} y={box.y + 30} fill={box.helmet === 'Missing' ? '#ef4444' : '#10b981'} fontSize={10} fontWeight="bold">{box.helmet}</text>
                        <text x={box.x + 10} y={box.y + 50} fill="#10b981" fontSize={10} fontWeight="bold">{box.shoes}</text>
                        <text x={box.x + 10} y={box.y + 70} fill={box.vest === 'Missing' ? '#ef4444' : '#10b981'} fontSize={10} fontWeight="bold">{box.vest}</text>
                        {box.harness !== 'N/A' && (
                          <text x={box.x + 10} y={box.y + 90} fill={box.harness.includes('Missing') ? '#ef4444' : '#10b981'} fontSize={10} fontWeight="bold">{box.harness}</text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Simulated static grids grid backgrounds */}
                <div className="absolute inset-0 border border-white/5 grid grid-cols-6 grid-rows-6 opacity-30 select-none pointer-events-none">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div key={i} className="border border-white/5"></div>
                  ))}
                </div>

                {/* If camera is power plant corridor and person count is 0 */}
                {cam.personCount === 0 && (
                  <div className="text-center select-none pointer-events-none z-10 flex flex-col items-center gap-2">
                    <BiStopwatch size={32} className="text-steel-600 animate-pulse" />
                    <span className="text-[10px] text-steel-500 font-bold uppercase tracking-wider">No workers detected</span>
                  </div>
                )}
              </div>

              {/* Camera footer metrics */}
              <div className="p-3 bg-scada-panel border-t border-scada-border/50 flex items-center justify-between text-xs">
                <span className="text-scada-muted">Location: <strong className="text-slate-200">{cam.location}</strong></span>
                <button 
                  onClick={() => setSelectedCam(cam)}
                  className="p-1 text-neon-cyan hover:text-white bg-steel-900 border border-scada-border rounded hover:border-neon-cyan transition-all"
                  title="Expand detailed camera diagnostic"
                >
                  <BiExpand size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed diagnostics modal on camera maximize */}
      {selectedCam && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="glass-panel border border-neon-cyan w-full max-w-4xl h-[600px] overflow-hidden flex flex-col">
            <div className="p-4 bg-steel-800 border-b border-scada-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white uppercase tracking-wider">{selectedCam.camera_code} Diagnostic Port</h3>
                <p className="text-[10px] text-neon-cyan font-bold">{selectedCam.camera_name} - {selectedCam.location}</p>
              </div>
              <button 
                onClick={() => setSelectedCam(null)}
                className="px-3 py-1 bg-neon-crimson/20 hover:bg-neon-crimson text-neon-crimson hover:text-white border border-neon-crimson/50 rounded-lg text-xs font-bold transition-all"
              >
                Close Diagnostic
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-black">
              {/* Max Stream */}
              <div className="flex-1 bg-slate-950 relative flex items-center justify-center cctv-scanline">
                {liveCameraFrames[selectedCam.camera_code] ? (
                  <img 
                    src={liveCameraFrames[selectedCam.camera_code]} 
                    alt={`Maximized CCTV feed ${selectedCam.camera_code}`} 
                    className="absolute inset-0 w-full h-full object-contain z-0" 
                  />
                ) : null}
                <div className="text-center select-none pointer-events-none z-10 flex flex-col items-center gap-3 bg-black/40 p-4 rounded-xl backdrop-blur-sm">
                  <div className="text-xs text-neon-cyan font-bold border border-neon-cyan/40 px-3 py-1 bg-neon-cyan/5 rounded animate-pulse">
                    Live Analytical Overlay Active
                  </div>
                  <span className="text-[10px] text-steel-500 font-bold uppercase tracking-widest mt-2">GPU CUDA Stream Locked</span>
                </div>
              </div>

              {/* Diagnostics telemetry stream logs list */}
              <div className="w-80 border-l border-scada-border/70 p-4 bg-scada-panel overflow-y-auto flex flex-col h-full">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-3">Live Inference Telemetry</h4>
                <div className="flex-1 space-y-2 font-mono text-[9px] text-neon-cyan max-h-[460px] overflow-y-auto">
                  <div>[SYS] Initiating CUDA memory caching...</div>
                  <div>[SYS] Model anchors loaded successfully.</div>
                  <div>[YOLO] Analyzing frame pipeline...</div>
                  <div className="text-neon-emerald">[YOLO] Frame 4801: Person detected.</div>
                  <div className="text-neon-emerald">[FaceRec] RAVI VERMA (BSP1021) matched. Conf: 98.4%</div>
                  <div className="text-neon-emerald">[PPE Check] Helmet: [OK] | Vest: [OK] | Shoes: [OK]</div>
                  <div>[YOLO] Inference processing latency: 12ms</div>
                  <div>[SYS] Synchronizing dashboard alerts queue...</div>
                  <div>[YOLO] Analyzing frame pipeline...</div>
                  <div className="text-neon-crimson">[YOLO] ALERT! Intrusive worker detected on ladle deck.</div>
                  <div className="text-neon-crimson">[PPE Check] Helmet: [MISSING] | Harness: [MISSING]</div>
                  <div className="text-neon-crimson">[API] Dispatched safety violation to REST server.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMonitoring;

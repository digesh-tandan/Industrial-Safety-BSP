import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { BiNetworkChart, BiDna, BiCheckSquare } from 'react-icons/bi';

const Analytics = () => {
  
  // 1. Violation Categories Pie Chart
  const violationCategories = [
    { name: 'Helmet Missing', value: 45, color: '#ef4444' },
    { name: 'Safety Shoes Missing', value: 25, color: '#f59e0b' },
    { name: 'Safety Belt Missing', value: 20, color: '#06b6d4' },
    { name: 'Reflective Vest Missing', value: 10, color: '#10b981' },
  ];

  // 2. AI Model Precision scores
  const modelMetrics = [
    { class: 'Person BBox', precision: 99.2, recall: 98.8, f1: 99.0 },
    { class: 'Helmet Hardhat', precision: 98.4, recall: 97.2, f1: 97.8 },
    { class: 'Safety Vest', precision: 97.5, recall: 98.1, f1: 97.8 },
    { class: 'Safety Shoes', precision: 94.2, recall: 92.5, f1: 93.3 },
    { class: 'Tether Harness', precision: 96.0, recall: 95.1, f1: 95.5 },
  ];

  return (
    <div className="space-y-6">
      {/* A. KPI matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 border border-scada-border/50 glow-cyan">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-scada-muted uppercase tracking-wider">AI Accuracy (mAP50)</h4>
            <BiNetworkChart className="text-neon-cyan" size={20} />
          </div>
          <h3 className="text-2xl font-extrabold text-white">98.40%</h3>
          <p className="text-[9px] text-scada-muted mt-2">Evaluated against 12,000+ benchmarked frames</p>
        </div>

        <div className="glass-panel p-5 border border-scada-border/50 glow-green">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-scada-muted uppercase tracking-wider">Avg Inference Latency</h4>
            <BiDna className="text-neon-emerald" size={20} />
          </div>
          <h3 className="text-2xl font-extrabold text-white">12.4 ms</h3>
          <p className="text-[9px] text-scada-muted mt-2">FPS throughput: ~80.6 frames/sec CUDA</p>
        </div>

        <div className="glass-panel p-5 border border-scada-border/50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-[10px] font-bold text-scada-muted uppercase tracking-wider">Face Recognition Confidence</h4>
            <BiCheckSquare className="text-neon-cyan" size={20} />
          </div>
          <h3 className="text-2xl font-extrabold text-white">99.12%</h3>
          <p className="text-[9px] text-scada-muted mt-2">Cosine similarity threshold: 0.65 margin</p>
        </div>
      </div>

      {/* B. Middle breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation breakdown */}
        <div className="glass-panel p-5 border border-scada-border/50 flex flex-col h-[320px]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-4">Safety Offense Class Distribution</h3>
          
          <div className="flex-1 flex items-center justify-between">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={violationCategories}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {violationCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#101726', borderColor: '#1e293b', color: '#f8fafc' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-1/2 space-y-3 text-xs pr-4">
              {violationCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-scada-muted">{cat.name}</span>
                  </div>
                  <span className="font-bold text-white">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Performance matrix */}
        <div className="glass-panel p-5 border border-scada-border/50 h-[320px] overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white border-b border-scada-border pb-2 mb-4">Neural Network Model evaluation Matrix</h3>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-scada-border/80 text-[10px] text-scada-muted uppercase font-bold tracking-wider">
                  <th className="pb-2">Object Class</th>
                  <th className="pb-2">Precision</th>
                  <th className="pb-2">Recall</th>
                  <th className="pb-2">F1 Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-scada-border/30">
                {modelMetrics.map((met, idx) => (
                  <tr key={idx} className="hover:bg-steel-900/10">
                    <td className="py-3 font-semibold text-white">{met.class}</td>
                    <td className="py-3 text-neon-cyan font-semibold">{met.precision}%</td>
                    <td className="py-3 text-neon-cyan font-semibold">{met.recall}%</td>
                    <td className="py-3 text-neon-emerald font-bold">{met.f1}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

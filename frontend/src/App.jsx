import React, { useState } from 'react';
import { DashboardProvider } from './context/DashboardContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page Imports
import Dashboard from './pages/Dashboard';
import LiveMonitoring from './pages/LiveMonitoring';
import Violations from './pages/Violations';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';

import Login from './pages/Login';
import { useDashboard } from './context/DashboardContext';

function AppContent({ activePage, setActivePage }) {
  const { user } = useDashboard();

  if (!user) {
    return <Login />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'live':
        return <LiveMonitoring />;
      case 'violations':
        return <Violations />;
      case 'employees':
        return <Employees />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-scada-bg overflow-hidden font-sans">
      {/* Left navigation sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Right workspace panels */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navigation header */}
        <Navbar />

        {/* Central display port page container */}
        <main className="flex-1 overflow-y-auto p-6 bg-scada-bg/20">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <DashboardProvider>
      <AppContent activePage={activePage} setActivePage={setActivePage} />
    </DashboardProvider>
  );
}

export default App;

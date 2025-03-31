import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import ThemeProvider from './theme/ThemeProvider';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import MissionSystem from './pages/Missions/MissionSystem';
import MissionPlanning from './pages/Missions/MissionPlanning';
import { MissionFormData } from './types/missionTypes';
import ClientManagement from './pages/Clients/ClientManagement';
import ContractSystem from './pages/Contracts/ContractSystem';
import FinancialManagement from './pages/Finance/FinancialManagement';
import EquipmentManagement from './pages/Equipment/EquipmentManagement';
import ComplianceDocumentation from './pages/Compliance/ComplianceDocumentation';
import ReportsDashboard from './pages/Reports/ReportsDashboard';
import UserProfile from './pages/Profile/UserProfile';
import AppSettings from './pages/Settings/AppSettings';
import './App.css';

function App() {

  const handleSaveMission = (missionData: MissionFormData) => {
    console.log('Saving mission:', missionData);
  };

  return (
    <ThemeProvider>
      <div className="app-background">
        <div className="app-blur-overlay">
          <ErrorBoundary FallbackComponent={({error}) => (
            <div>
              <h2>Something went wrong:</h2>
              <p>{error.message}</p>
            </div>
          )}>
            <BrowserRouter>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/missions" element={<MissionSystem />} />
                  <Route path="/mission-planning" element={<MissionPlanning onSave={handleSaveMission} />} />
                  <Route path="/clients" element={<ClientManagement />} />
                  <Route path="/clients/:id" element={<ClientManagement />} />
                  <Route path="/contracts" element={<ContractSystem />} />
                  <Route path="/finance" element={<FinancialManagement />} />
                  <Route path="/equipment" element={<EquipmentManagement />} />
                  <Route path="/compliance" element={<ComplianceDocumentation />} />
                  <Route path="/reports" element={<ReportsDashboard />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/settings" element={<AppSettings />} />
                </Routes>
              </MainLayout>
            </BrowserRouter>
          </ErrorBoundary>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App; 
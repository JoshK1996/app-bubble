import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import MissionManagement from './pages/Missions/MissionManagement';
import ClientManagement from './pages/Clients/ClientManagement';
import ContractSystem from './pages/Contracts/ContractSystem';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout title="Dashboard">
            <Dashboard />
          </MainLayout>
        } />
        <Route path="/missions" element={
          <MainLayout title="Mission Management">
            <MissionManagement />
          </MainLayout>
        } />
        <Route path="/clients" element={
          <MainLayout title="Client Management">
            <ClientManagement />
          </MainLayout>
        } />
        <Route path="/contracts" element={
          <MainLayout title="Contract System">
            <ContractSystem />
          </MainLayout>
        } />
        {/* Add more routes for other pages here */}
      </Routes>
    </Router>
  );
}

export default App; 
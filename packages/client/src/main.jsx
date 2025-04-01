import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import App from './App';
import './index.css';

// Import the mock AWS configuration
// In production, this would be replaced with the auto-generated aws-exports.js file
import awsConfig from '../../amplify/amplifyconfiguration.json';

// Configure Amplify with our mock or real config
Amplify.configure(awsConfig);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
); 
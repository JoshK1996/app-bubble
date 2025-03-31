import React, { useState } from 'react';
import { captureError, logMessage } from '../utils/errorLogging';

/**
 * Component to test error handling and logging
 */
const ErrorTest: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);

  const handleLogClick = () => {
    // Example of manual logging
    logMessage(
      'User clicked the log button', 
      { timestamp: new Date().toISOString() },
      'info'
    );
    alert('Message logged successfully!');
  };

  const handleErrorClick = () => {
    try {
      // Simulate an error
      throw new Error('This is a test error from ErrorTest component');
    } catch (error) {
      captureError(error as Error, { 
        component: 'ErrorTest',
        action: 'handleErrorClick',
        timestamp: new Date().toISOString()
      });
      alert('Error captured manually with Sentry!');
    }
  };

  const handleFatalErrorClick = () => {
    setShouldThrow(true);
  };

  // This will trigger the error boundary
  if (shouldThrow) {
    throw new Error('Fatal error thrown from ErrorTest component');
  }

  return (
    <div className="error-test-container">
      <h2>Error Testing Panel</h2>
      <p>Use these buttons to test error handling and logging:</p>
      
      <div className="error-test-buttons">
        <button 
          onClick={handleLogClick}
          className="log-button"
        >
          Log Message
        </button>

        <button 
          onClick={handleErrorClick}
          className="error-button"
        >
          Test Handled Error
        </button>

        <button 
          onClick={handleFatalErrorClick}
          className="fatal-error-button"
        >
          Test Fatal Error
        </button>
      </div>
    </div>
  );
};

export default ErrorTest; 
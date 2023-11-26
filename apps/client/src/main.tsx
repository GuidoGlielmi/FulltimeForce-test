import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import ErrorFeedbackProvider from './context/ErrorFeedbackContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorFeedbackProvider>
      <App />
    </ErrorFeedbackProvider>
  </React.StrictMode>,
);

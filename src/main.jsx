import React from 'react'; 
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
// ✅ FIXED: Changed import path to .jsx
import { CognitiveFieldProvider } from "./store/cognitiveField.jsx"; 

// Mount to #root (assumes public/index.html has <div id="root"></div>)
const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    {/* ✅ UPDATED: Provider is now correctly imported */}
    <CognitiveFieldProvider>
      <App />
    </CognitiveFieldProvider>
  </React.StrictMode>
);

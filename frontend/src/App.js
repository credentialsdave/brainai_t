import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Login from '../src/pages/Login/login';
import ChatbotUI from './pages/Chatbot/ChatBotUi';
import PhoneNumberVerification from './pages/Phone Verification/PhoneNumberVerification';

import ErrorBoundary from '../src/pages/ErrorBoundary';
import OTPVerification from './pages/Phone Verification/OTPVerification';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Login />} />
          {/* <Route path="/chat" element={<Chatbot />} /> */}
          <Route path="/verify-phone" element={<PhoneNumberVerification />} />
          <Route path="/otpverification" element={<OTPVerification />} />
          <Route path="/chatui" element={<ChatbotUI />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
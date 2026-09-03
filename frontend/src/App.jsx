import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentStatusCard from './components/PaymentStatusCard';
import DeliveryVerificationCard from './components/DeliveryVerificationCard';
import PaymentForm from './components/PaymentForm';
import Homepage from './pages/Homepage';

const App = () => {
  return (
    <Router>
      <div className="">
        <Routes>
          {/* Default view */}
          <Route path="/" element={<Homepage />} />
          
          {/* Corrected Checkout Route: 
              Don't add "?token" here. The PaymentForm 
              already reads it from the URL.
          */}
          <Route path="/checkout" element={<PaymentForm />} />
          
          {/* Verification view (The path from Paystack) */}
          <Route path="/verify/:reference" element={<DeliveryVerificationCard />} />
          
          {/* Fallback for undefined routes */}
          <Route path="*" element={<h1 className="text-center mt-10">Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
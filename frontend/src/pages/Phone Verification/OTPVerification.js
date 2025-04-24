// src/pages/OTPVerification/OTPVerification.js
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './otpverification.css';

// Import your assets
import brainLogo from '../../assets/images/brain_logo.svg';
import geometricVector from '../../assets/images/geometric_vector.svg';

const OTPVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto focus to next input
    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
      inputRefs[index - 1].current.focus();
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Side - Background with Brain Logo and Name */}
      <div className="w-full md:w-3/5 bg-[#242525] flex flex-col items-center justify-center relative p-4 md:p-8 min-h-[300px] md:min-h-full">
        {/* Background geometric pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20 overflow-hidden">
          <img src={geometricVector} alt="Geometric Pattern" className="w-full h-full object-cover" />
        </div>
        
        {/* Logo and Title */}
        <div className="flex flex-col sm:flex-row items-center z-10">
          <img src={brainLogo} alt="Brain Logo" className="w-[111px] h-[95px]" />
          <h1 className="text-white text-[35px] font-medium mt-4 sm:mt-0 sm:ml-4 tracking-[-2px] font-poppins">BrainAI</h1>
        </div>
      </div>
      
      {/* Right Side - OTP Verification Form */}
      <div className="w-full md:w-2/5 flex flex-col items-center justify-center bg-[#141718] p-6 md:p-8 min-h-[400px] md:min-h-full">
        <div className="w-full max-w-500px flex flex-col items-center justify-between h-full">
          <div className="flex-grow"></div> {/* This creates space at the top */}
          
          <div className="w-full flex flex-col items-center">
            {/* OTP Verification Header */}
            <h2 className="text-[#FFFFFF] text-[38px] font-semibold mb-8 text-left w-full font-poppins leading-tight">
              Verify Phone <br/>Number
            </h2>
            
            {/* OTP Input Fields */}
            <div className="flex justify-between w-full mb-8">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  className="w-16 h-16 text-center text-white bg-transparent border border-[#C2C3CB] rounded-[13px] text-[24px] font-medium focus:outline-none focus:border-white"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                />
              ))}
            </div>
            
            {/* Verification Button */}
            <button className="w-full bg-[#1B1E20] text-[#FFFFFF] rounded-[14px] py-3 px-4 font-poppins font-medium text-[16px] hover:bg-[#2a2e31] transition-all mb-4">
              Verification
            </button>
            
            {/* Send Again Button */}
            <button className="w-full bg-transparent border-2 border-[#1B1E20] text-[#B1B1B1] rounded-[14px] py-3 px-4 font-poppins font-medium text-[16px] hover:border-[#2a2e31] transition-all">
              Send Again
            </button>
          </div>
          
          <div className="flex-grow"></div> {/* This creates space in the middle */}
          
          {/* Footer Links */}
          <div className="mt-auto pt-8 text-center w-full">
            <div className="flex justify-center space-x-6 text-[#AFAFAF] text-[16px] mb-4 font-['Segoe_UI']">
              <Link to="/terms" className="hover-text-white transition-color">Terms of use</Link>
              <span className="text-[#AFAFAF]">|</span>
              <Link to="/privacy" className="hover-text-white transition-color">Privacy policy</Link>
            </div>
            
            {/* Small Brain Logo at Footer */}
            <div className="flex justify-center mt-4">
              <img src={brainLogo} alt="Brain Logo Small" className="w-[30px] h-[26px] opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
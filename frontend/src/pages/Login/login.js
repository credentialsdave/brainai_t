import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import './login.css';

// Import your assets
import appleIcon from '../../assets/images/apple_icon.svg';
import brainLogo from '../../assets/images/brain_logo.svg';
import geometricVector from '../../assets/images/geometric_vector.svg';
import googleIcon from '../../assets/images/google_icon.svg';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, redirect to chat
        navigate('/chatui');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Successfully signed in
      console.log("Google sign-in successful:", result.user);
      
      // Redirect to chat page after successful login
      navigate('/chatui');
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
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
      
      {/* Right Side - Login Form */}
      <div className="w-full md:w-2/5 flex flex-col items-center justify-center bg-[#141718] p-6 md:p-8 min-h-[400px] md:min-h-full">
        <div className="w-full max-w-500px flex flex-col items-center justify-between h-full">
          <div className="flex-grow"></div> {/* This creates space at the top */}
          
          <div className="w-full flex flex-col items-center content-shift mobile-content-shift">
            {/* Login Header */}
            <h2 className="text-[#ACADB9] text-[16px] font-medium mb-8 text-center font-poppins">Login or Sign Up With Account</h2>
            
            {/* Error Message */}
            {error && (
              <div className="w-full mb-4 px-4 py-2 bg-[#3A2425] border border-[#F44336] rounded-[8px] text-[#F44336] text-[14px] font-poppins">
                {error}
              </div>
            )}
            
            {/* Social Login Buttons */}
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8 w-full mobile-buttons-container">
              <button 
                className={`flex items-center justify-center bg-transparent border border-gray-600 rounded-full py-3 px-6 text-white hover-bg-gray-800 transition-all w-full sm:w-150px h-64px ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src={googleIcon} alt="Google Icon" className="w-6 h-6 mr-3" />
                {/* <span className="text-white">{loading ? 'Signing in...' :''}</span> */}
              </button>
              
              <button className="flex items-center justify-center bg-transparent border border-gray-600 rounded-full py-3 px-6 text-white hover-bg-gray-800 transition-all w-full sm:w-150px h-64px">
                <img src={appleIcon} alt="Apple Icon" className="w-6 h-6 mr-3" />
                {/* <span className="text-white"></span> */}
              </button>
            </div>
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

export default Login;
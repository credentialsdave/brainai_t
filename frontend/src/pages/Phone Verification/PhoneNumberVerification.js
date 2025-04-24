import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../../firebase";
import { setConfirmationResult } from "../Phone Verification/otpStore";
import './phonenumberverification.css';

// Import your assets
import brainLogo from '../../assets/images/brain_logo.svg';
import geometricVector from '../../assets/images/geometric_vector.svg';
import phoneIcon from '../../assets/images/phone-icon.svg';

const PhoneNumberVerification = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaContainerRef = useRef(null);

  // Clean up reCAPTCHA on mount and unmount
  useEffect(() => {
    console.log("Auth object on mount:", auth);
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
          window.recaptchaVerifier = null;
          console.log("reCAPTCHA cleared successfully");
        } catch (error) {
          console.error("Error clearing reCAPTCHA:", error);
        }
      }
    };
  }, []);

  const initializeRecaptcha = async (size = 'normal') => {
    try {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
        console.log("Existing reCAPTCHA cleared");
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        'recaptcha-container',
        {
          size,
          callback: (response) => {
            console.log("reCAPTCHA verified, response:", response);
          },
          'expired-callback': () => {
            console.log("reCAPTCHA expired");
            setError("reCAPTCHA has expired. Please verify again.");
            setLoading(false);
          },
          'error-callback': () => {
            console.log("reCAPTCHA error occurred");
            setError("reCAPTCHA verification failed. Please try again.");
            setLoading(false);
          }
        }
      );

      console.log("Rendering reCAPTCHA with size:", size);
      await window.recaptchaVerifier.render();
      return true;
    } catch (error) {
      console.error("reCAPTCHA initialization failed:", error);
      return false;
    }
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      // Validate phone number
      if (!phone || phone.trim() === "") {
        setError("Please enter a phone number");
        setLoading(false);
        return;
      }

      // Format phone number
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith('+')) {
        if (formattedPhone.startsWith('0')) {
          formattedPhone = '+91' + formattedPhone.substring(1);
        } else {
          formattedPhone = '+91' + formattedPhone;
        }
      }

      // Validate phone number length
      if (formattedPhone.replace(/\D/g, '').length < 10) {
        setError("Phone number is too short. Please enter a valid phone number.");
        setLoading(false);
        return;
      }

      // Validate auth object
      if (!auth) {
        console.error("Firebase auth is undefined");
        setError("Authentication service is not initialized. Please try again later.");
        setLoading(false);
        return;
      }

      // Verify reCAPTCHA container exists
      if (!recaptchaContainerRef.current) {
        console.error("reCAPTCHA container not found");
        setError("reCAPTCHA container not found. Please refresh the page.");
        setLoading(false);
        return;
      }

      // Initialize reCAPTCHA
      let recaptchaInitialized = await initializeRecaptcha('normal');
      if (!recaptchaInitialized) {
        console.log("Retrying reCAPTCHA with invisible mode");
        recaptchaInitialized = await initializeRecaptcha('invisible');
        if (!recaptchaInitialized) {
          throw new Error("Failed to initialize reCAPTCHA after multiple attempts. Please try again.");
        }
      }

      // Force reCAPTCHA verification
      console.log("Forcing reCAPTCHA verification");
      await window.recaptchaVerifier.verify().catch((error) => {
        console.error("reCAPTCHA verification error:", error);
        throw new Error("Failed to verify reCAPTCHA. Please try again.");
      });

      // Send OTP with retry logic
      console.log("Sending OTP to:", formattedPhone);
      let result;
      let retryCount = 0;
      const maxRetries = 2;
      while (retryCount < maxRetries) {
        try {
          result = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
          break;
        } catch (error) {
          console.error(`signInWithPhoneNumber attempt ${retryCount + 1} error:`, error);
          console.error("Error code:", error.code);
          console.error("Error message:", error.message);
          if (error.code === 'auth/invalid-app-credential' && retryCount < maxRetries - 1) {
            console.log("Retrying reCAPTCHA due to invalid-app-credential");
            recaptchaInitialized = await initializeRecaptcha('invisible');
            if (!recaptchaInitialized) {
              throw new Error("Failed to re-initialize reCAPTCHA. Please try again.");
            }
            await window.recaptchaVerifier.verify();
            retryCount++;
            continue;
          }
          throw error;
        }
      }

      // Log result details
      console.log("signInWithPhoneNumber result:", result);
      if (!result.verificationId) {
        console.error("No verificationId in result");
        setError("Failed to initiate OTP request. Please check Firebase configuration.");
        setLoading(false);
        return;
      }

      // Store confirmation result
      setConfirmationResult(result);
      console.log("Confirmation result stored:", result);

      // Show success message
      setMessage("OTP request initiated. Please check your phone. If you don't receive it, verify your phone number or Firebase settings.");

      // Navigate to OTP verification page
      setTimeout(() => {
        console.log("Navigating to /otpverification");
        navigate('/otpverification');
      }, 2000);

    } catch (err) {
      console.error("Firebase error:", err);
      // Handle specific Firebase errors
      switch (err.code) {
        case 'auth/invalid-phone-number':
          setError("The phone number format is incorrect. Please enter a valid phone number with country code (e.g., +91XXXXXXXXXX).");
          break;
        case 'auth/too-many-requests':
          setError("Too many requests. Please try again later.");
          break;
        case 'auth/quota-exceeded':
          setError("SMS quota exceeded. Please try again later or contact support.");
          break;
        case 'auth/invalid-app-credential':
          setError("reCAPTCHA verification failed. Please complete the reCAPTCHA again or refresh the page. Ensure your app's domain is authorized in Firebase Console.");
          break;
        case 'auth/missing-app-credential':
          setError("reCAPTCHA verification is required. Please complete the reCAPTCHA.");
          break;
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection and try again.");
          break;
        case 'auth/operation-not-allowed':
          setError("Phone authentication is not enabled in Firebase Console. Please enable it and try again.");
          break;
        default:
          setError(err.message || "Failed to send OTP. Please try again or check Firebase configuration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full">
      {/* Left Side - Background with Brain Logo and Name */}
      <div className="w-full md:w-3/5 bg-[#242525] flex flex-col items-center justify-center relative p-4 md:p-8 min-h-[300px] md:min-h-full">
        <div className="absolute top-0 left-0 w-full h-full opacity-20 overflow-hidden">
          <img src={geometricVector} alt="Geometric Pattern" className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col sm:flex-row items-center z-10">
          <img src={brainLogo} alt="Brain Logo" className="w-[111px] h-[95px]" />
          <h1 className="text-white text-[35px] font-medium mt-4 sm:mt-0 sm:ml-4 tracking-[-2px] font-poppins">BrainAI</h1>
        </div>
      </div>

      {/* Right Side - Phone Verification Form */}
      <div className="w-full md:w-2/5 flex flex-col items-center justify-center bg-[#141718] p-6 md:p-8 min-h-[400px] md:min-h-full">
        <div className="w-full max-w-500px flex flex-col items-center justify-between h-full">
          <div className="flex-grow"></div>
          <div className="w-full flex flex-col items-center">
            <h2 className="text-[#FFFFFF] text-[38px] font-semibold mb-8 text-left w-full font-poppins leading-tight">
              Enter Your Phone <br/>Number
            </h2>
            <div className="w-full mb-4">
              <div className="flex items-center bg-[#232627] rounded-[14px] px-4 py-3 w-full">
                <img src={phoneIcon} alt="Phone Icon" className="w-6 h-6 mr-3" />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-transparent border-none outline-none text-white w-full font-poppins text-[14px] placeholder-[#C2C3CB]"
                />
              </div>
            </div>
            <div id="recaptcha-container" ref={recaptchaContainerRef} className="w-full mb-4 flex justify-center"></div>
            {error && (
              <div className="w-full mb-4 px-4 py-2 bg-[#3A2425] border border-[#F44336] rounded-[8px] text-[#F44336] text-[14px] font-poppins">
                {error}
              </div>
            )}
            {message && (
              <div className="w-full mb-4 px-4 py-2 bg-[#263A25] border border-[#66BB6A] rounded-[8px] text-[#66BB6A] text-[14px] font-poppins">
                {message}
              </div>
            )}
            <button
              className={`w-full bg-[#1B1E20] text-[#FFFFFF] rounded-[14px] py-3 px-4 font-poppins font-medium text-[16px] hover:bg-[#2a2e31] transition-all mb-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Verification'}
            </button>
            <button
              className="w-full bg-transparent border-2 border-[#1B1E20] text-[#B1B1B1] rounded-[14px] py-3 px-4 font-poppins font-medium text-[16px] hover:border-[#2a2e31] transition-all"
              onClick={() => navigate('/chat')}
            >
              Later
            </button>
          </div>
          <div className="flex-grow"></div>
          <div className="mt-auto pt-8 text-center w-full">
            <div className="flex justify-center space-x-6 text-[#AFAFAF] text-[16px] mb-4 font-['Segoe_UI']">
              <Link to="/terms" className="hover-text-white transition-color">Terms of use</Link>
              <span className="text-[#AFAFAF]">|</span>
              <Link to="/privacy" className="hover-text-white transition-color">Privacy policy</Link>
            </div>
            <div className="flex justify-center mt-4">
              <img src={brainLogo} alt="Brain Logo Small" className="w-[30px] h-[26px] opacity-70" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneNumberVerification;
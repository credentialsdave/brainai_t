import axios from 'axios';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { auth } from '../../firebase';
import './chatbotui.css';

// Import your assets
import accountIcon from '../../assets/images/account_icon.svg';
import arrowIcon from '../../assets/images/arrow_icon.svg';
import brainLogo from '../../assets/images/brain_logo.svg';
import chatIcon from '../../assets/images/chat_icon.svg';
import deleteIcon from '../../assets/images/delete_icon.svg';
import faqIcon from '../../assets/images/faq_icon.svg';
import galleryIcon from '../../assets/images/gallery_icon.svg';
import logoutIcon from '../../assets/images/logout_icon.svg';
import recordIcon from '../../assets/images/record_icon.svg';
import sendIcon from '../../assets/images/send_icon.svg';

const ChatBotUI = () => {
  // Navigation
  const navigate = useNavigate();
  
  // State management
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voiceInput, setVoiceInput] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isChatActive, setIsChatActive] = useState(false);
  const [user, setUser] = useState(null);
  
  const chatEndRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        // If not authenticated, redirect to login
        navigate('/');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Redirect to login page after logout
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle sending a message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const currentInput = input;
    const userMessage = { text: currentInput, sender: 'user' };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsChatActive(true);

    try {
      // const response = await axios.post('http://localhost:5000/chat', { 
      //   text: currentInput,
      //   voice_output: voiceOutput
      // });
      const response = await axios.post(`${config.API_URL}/chat`, { 
        text: currentInput,
        voice_output: voiceOutput
      });
      
      const botMessage = { text: response.data.response, sender: 'bot' };
      setMessages((prev) => [...prev, botMessage]);

      if (voiceOutput) {
        speakResponse(response.data.response);
      }
    } catch (error) {
      console.error('Error fetching response', error);
      // Add error message to chat
      setMessages((prev) => [...prev, { 
        text: "I'm having trouble connecting right now. Please try again later.", 
        sender: 'bot' 
      }]);
    }
    setLoading(false);
  };

  // Text-to-speech functionality
  const speakResponse = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
  };

  // Speech recognition functionality
  const startListening = () => {
    // Check for SpeechRecognition API with browser prefixes
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
    };

    recognition.start();
  };

  // Handle category selection
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
    setIsChatActive(true);
    
    // Add a welcome message based on the selected category
    const welcomeMessage = {
      text: `Welcome to the ${category} section. How can I assist you today?`,
      sender: 'bot'
    };
    setMessages([welcomeMessage]);
  };

  // Clear conversation history
  const clearConversations = () => {
    setMessages([]);
    setIsChatActive(false);
    setActiveCategory(null);
  };

  // Auto-scroll to the most recent message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (!isChatActive) {
        // If not in chat mode, start a general chat
        handleCategorySelect('General');
        setTimeout(() => sendMessage(), 100);
      } else {
        sendMessage();
      }
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#121212]">
      {/* Left Sidebar */}
      <div className="sidebar w-64 flex-shrink-0 bg-[#1A1A1A] flex flex-col justify-between h-full overflow-y-auto">
        {/* Top Navigation */}
        <div className="sidebar-top p-4">
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer">
              <img src={chatIcon} alt="Chat Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">AI Chat Tool Ethics</span>
            </li>
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer">
              <img src={chatIcon} alt="Chat Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">AI Chat Tool Impact Writing</span>
            </li>
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer" onClick={() => clearConversations()}>
              <img src={chatIcon} alt="Chat Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">New chat</span>
            </li>
          </ul>
        </div>

        {/* Bottom Navigation */}
        <div className="sidebar-bottom p-4 border-t border-[#2A2A2A]">
          <ul className="space-y-4">
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer" onClick={() => clearConversations()}>
              <img src={deleteIcon} alt="Delete Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">Clear conversations</span>
            </li>
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer">
              <img src={accountIcon} alt="Account Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">My account</span>
            </li>
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer">
              <img src={faqIcon} alt="FAQ Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">Updates & FAQ</span>
            </li>
            <li className="flex items-center space-x-3 hover-bg-dark p-2 rounded-md cursor-pointer" onClick={handleLogout}>
              <img src={logoutIcon} alt="Logout Icon" className="w-5 h-5" />
              <span className="text-white font-inter text-[13px]">Log out</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full">
        {!isChatActive ? (
          // Home screen with categories
          <div className="flex-1 flex flex-col items-center justify-between h-full">
            <div className="flex flex-col items-center pt-24 w-full max-w-2xl">
              {/* Brain Logo and Title */}
              <div className="flex items-center space-x-4 mb-12"> 
                <img src={brainLogo} alt="Brain Logo" className="w-[63px] h-[54px]" />
                <h1 className="text-white text-[35px] font-medium tracking-[-2px] font-poppins">BrainAI</h1>
              </div>

              {/* User display */}
              {user && (
                <div className="bg-[#1A1A1A] p-3 rounded-lg text-white mb-12">
                  <p className="text-center">Welcome, {user.displayName || user.email}</p>
                </div>
              )}

              {/* Category Options */}
              <div className="w-full max-w-xl space-y-4 px-6">
                <button 
                  className="option-btn w-full flex items-center justify-between px-6 py-4 bg-transparent border border-[#949494] rounded-[36px] text-[#949494] font-sf-pro text-[16px] font-semibold"
                  onClick={() => handleCategorySelect('Healthcare')}
                >
                  <span>Healthcare</span>
                  <img src={arrowIcon} alt="Arrow" className="w-6 h-6" />
                </button>
                
                <button 
                  className="option-btn w-full flex items-center justify-between px-6 py-4 bg-transparent border border-[#949494] rounded-[36px] text-[#949494] font-sf-pro text-[16px] font-semibold"
                  onClick={() => handleCategorySelect('Education')}
                >
                  <span>Education</span>
                  <img src={arrowIcon} alt="Arrow" className="w-6 h-6" />
                </button>
                
                <button 
                  className="option-btn w-full flex items-center justify-between px-6 py-4 bg-transparent border border-[#949494] rounded-[36px] text-[#949494] font-sf-pro text-[16px] font-semibold"
                  onClick={() => handleCategorySelect('Entertainment')}
                >
                  <span>Entertainment</span>
                  <img src={arrowIcon} alt="Arrow" className="w-6 h-6" />
                </button>
                
                <button 
                  className="option-btn w-full flex items-center justify-between px-6 py-4 bg-transparent border border-[#949494] rounded-[36px] text-[#949494] font-sf-pro text-[16px] font-semibold"
                  onClick={() => handleCategorySelect('Others')}
                >
                  <span>Others</span>
                  <img src={arrowIcon} alt="Arrow" className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Input field fixed at bottom */}
            <div className="w-full">
              <div className="max-w-4xl mx-auto py-4 px-4">
                <div className="flex items-center bg-[#1B1E20] rounded-[16px] px-4 py-3">
                  <button 
                    className="mr-3"
                    onClick={startListening}
                  >
                    <img src={recordIcon} alt="Record" className="w-6 h-6" />
                  </button>
                  <button className="mr-3">
                    <img src={galleryIcon} alt="Gallery" className="w-6 h-6" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type message" 
                    className="bg-transparent border-none outline-none text-white flex-1 font-inter text-[14px] placeholder-white placeholder-opacity-20"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button 
                    className="ml-3"
                    onClick={() => {
                      if (input.trim()) {
                        handleCategorySelect('General');
                        setTimeout(() => sendMessage(), 100);
                      }
                    }}
                  >
                    <img src={sendIcon} alt="Send" className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Active chat interface
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 bg-[#121212] mx-6 mt-6">
              <div className="flex items-center space-x-3">
                <img src={brainLogo} alt="Brain Logo" className="w-8 h-7" />
                <h2 className="text-white font-medium text-lg font-poppins">{activeCategory || "BrainAI Chat"}</h2>
              </div>
              <div className="flex items-center space-x-6">
                <div 
                  className={`flex items-center space-x-2 cursor-pointer`}
                  onClick={() => setVoiceInput(!voiceInput)}
                >
                  <div className={`w-4 h-4 rounded-full ${voiceInput ? 'bg-white' : 'border border-white'}`}></div>
                  <span className="text-white text-sm">Voice Input</span>
                </div>
                
                <div 
                  className={`flex items-center space-x-2 cursor-pointer`}
                  onClick={() => setVoiceOutput(!voiceOutput)}
                >
                  <div className={`w-4 h-4 rounded-full ${voiceOutput ? 'bg-white' : 'border border-white'}`}></div>
                  <span className="text-white text-sm">Voice Output</span>
                </div>
              </div>
            </div>
            
            {/* Chat Messages */}
            <div 
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto px-6 py-4"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg mb-3 max-w-[80%] ${
                    msg.sender === 'user' 
                      ? 'bg-[#1A1A1A] text-white ml-auto' 
                      : 'bg-[#1A1A1A] text-white'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && (
                <motion.div 
                  className="p-4 rounded-lg bg-[#1A1A1A] text-white max-w-[80%]"
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  Thinking...
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area - Positioned at the bottom of the screen */}
            <div className="w-full">
              <div className="max-w-4xl mx-auto py-4 px-4">
                <div className="flex items-center bg-[#1B1E20] rounded-[16px] px-4 py-3">
                  <button 
                    className="mr-3"
                    onClick={startListening}
                  >
                    <img src={recordIcon} alt="Record" className="w-6 h-6" />
                  </button>
                  <button className="mr-3">
                    <img src={galleryIcon} alt="Gallery" className="w-6 h-6" />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Type message" 
                    className="bg-transparent border-none outline-none text-white opacity-20 flex-1 font-inter text-[14px] placeholder-white placeholder-opacity-20"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button 
                    className="ml-3"
                    onClick={sendMessage}
                  >
                    <img src={sendIcon} alt="Send" className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBotUI;
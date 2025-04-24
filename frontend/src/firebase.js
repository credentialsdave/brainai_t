// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-6F8XgTfw3l3yYdHW_iXqvjRXBbE6LTE",
  authDomain: "veccaai-7cee3.firebaseapp.com",
  projectId: "veccaai-7cee3",
  storageBucket: "veccaai-7cee3.firebasestorage.app",
  messagingSenderId: "1054128208740",
  appId: "1:1054128208740:web:b91627148d232a89611871",

};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// export const auth = getAuth(app);
export { app, auth };

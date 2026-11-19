import { initializeApp } from "firebase/app";
import { 
  getAuth, GoogleAuthProvider, signInWithPopup, 
  signOut, onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, collection, getDocs, doc, 
  getDoc, setDoc, addDoc, updateDoc, deleteDoc, 
  serverTimestamp, query, where 
} from "firebase/firestore";

// La tua configurazione reale di Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDKg9NrfSUnv4W5WCI79MIw8NVO7wn9fIA",
  authDomain: "concorso-fotografico-58d69.firebaseapp.com",
  projectId: "concorso-fotografico-58d69",
  storageBucket: "concorso-fotografico-58d69.firebasestorage.app",
  messagingSenderId: "573337146894",
  appId: "1:573337146894:web:dea74e9d5dd51f2f184e5f",
  measurementId: "G-M3E5CL6D4P"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
};
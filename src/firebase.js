// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRiU7ijlzPTkerT3zkrApb3R64y31R0JU",
  authDomain: "lunch-time-by-kris.firebaseapp.com",
  projectId: "lunch-time-by-kris",
  storageBucket: "lunch-time-by-kris.appspot.com",
  messagingSenderId: "938324412623",
  appId: "1:938324412623:web:0a57def4c01688cdd80fba",
  measurementId: "G-M7N84VG493",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();
export { auth, db };
export default app;

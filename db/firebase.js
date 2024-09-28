// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyANona2l7E9W1G4OBduv3yVzf184zfBHn8",
  authDomain: "water-save-398de.firebaseapp.com",
  projectId: "water-save-398de",
  storageBucket: "water-save-398de.appspot.com",
  messagingSenderId: "295906995754",
  appId: "1:295906995754:web:634af795cd7449543e5d53",
  measurementId: "G-CDSTVRRWJ5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);

export const db = getFirestore(app)
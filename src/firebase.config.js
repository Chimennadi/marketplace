// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from  "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCcpjXPWdehklf4xflI-0BQC1_RotqITM4",
  authDomain: "marketplace-671ed.firebaseapp.com",
  projectId: "marketplace-671ed",
  storageBucket: "marketplace-671ed.appspot.com",
  messagingSenderId: "673977330771",
  appId: "1:673977330771:web:07683da958f0f24c796aa6"
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
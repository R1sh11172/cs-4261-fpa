// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlvyN2ak6efcwjBgvHho3406Dk1jY2yHY",
  authDomain: "mas-fpa.firebaseapp.com",
  projectId: "mas-fpa",
  storageBucket: "mas-fpa.firebasestorage.app",
  messagingSenderId: "12686782991",
  appId: "1:12686782991:web:9a6a7ad0af7b47be18a97a",
  measurementId: "G-BWCVDJW6S3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
const analytics = getAnalytics(app);
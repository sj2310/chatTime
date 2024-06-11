import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAufR7ZqpP99KFQAlsy4r35G9NPibynsQg",
  authDomain: "chattime-5d2af.firebaseapp.com",
  projectId: "chattime-5d2af",
  storageBucket: "chattime-5d2af.appspot.com",
  messagingSenderId: "442747513260",
  appId: "1:442747513260:web:7417096f4b833982353209"
};

// Initialize Firebase
// eslint-disable-next-line no-unused-vars
const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()

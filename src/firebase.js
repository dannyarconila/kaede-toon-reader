import { initializeApp } from "firebase/app";

import {
  getFirestore,
} from "firebase/firestore";

import {
  getAuth,
} from "firebase/auth";

const firebaseConfig = {

  apiKey:
    "AIzaSyCg0-gQ1_1btIkGGYW-HUOC_V_ugrDOBHQ",

  authDomain:
    "kaede-toon.firebaseapp.com",

  projectId:
    "kaede-toon",

  storageBucket:
    "kaede-toon.firebasestorage.app",

  messagingSenderId:
    "10979639401",

  appId:
    "1:10979639401:web:d7321dabaf786cb073e2f8"

};

const app =
  initializeApp(firebaseConfig);

export const db =
  getFirestore(app);

export const auth =
  getAuth(app);
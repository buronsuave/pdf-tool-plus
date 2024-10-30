import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCo1LjsjOMN5649PtRyhsXIEmY3d7yVDW0",
  authDomain: "pdf-viewer-b83aa.firebaseapp.com",
  projectId: "pdf-viewer-b83aa",
  storageBucket: "pdf-viewer-b83aa.appspot.com",
  messagingSenderId: "584929333752",
  appId: "1:584929333752:web:dee5ec722e3784e85fc60d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
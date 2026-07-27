// Configuración compartida de Firebase para el proyecto Mori-01.
// La API key de Firebase no es secreta (ver conversación) — lo que la protege
// son las reglas de Firestore y, más adelante, la restricción por dominio.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBQTeFhaiS2Wg6V9OgGfr7qhAFqvdfB0LA",
  authDomain: "mori-01-b1a8d.firebaseapp.com",
  projectId: "mori-01-b1a8d",
  storageBucket: "mori-01-b1a8d.firebasestorage.app",
  messagingSenderId: "592994102590",
  appId: "1:592994102590:web:59a6c2ae5238819128d06f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


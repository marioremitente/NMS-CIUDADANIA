// Módulo de colonias — carga y gestión de colonias desde Firestore.
// Re-exporta funciones helper de mori01-data.js para que las páginas
// que solo necesiten glifos/planetImg no tangan que importar ambos módulos.
import { db } from './firebase-config.js';
import { glyphSVG, planetImageSlug, planetImg as _planetImg } from './mori01-data.js';
import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export { glyphSVG };
export const planetImg = _planetImg;

const coloniesRef = collection(db, 'colonies');

// Todas las colonias activas
export async function loadAllColonies(){
  const q = query(coloniesRef, where('status', '==', 'active'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
}

// Todas las colonias (para el admin — incluye borradores e inactivas)
export async function loadAllColoniesAdmin(){
  const q = query(coloniesRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ docId: d.id, ...d.data() }));
}

// Una colonia específica
export async function loadColony(colonyId){
  const snap = await getDoc(doc(db, 'colonies', colonyId));
  if(!snap.exists()) return null;
  return { docId: snap.id, ...snap.data() };
}

// Planetas de una colonia
export async function getColonyPlanets(colonyId){
  const colony = await loadColony(colonyId);
  return colony ? (colony.planets || []) : [];
}

// Crear o actualizar colonia
export async function saveColony(data){
  const id = data.id;
  if(!id) throw new Error('La colonia debe tener un id');
  const ref = doc(db, 'colonies', id);
  const existing = await getDoc(ref);
  if(existing.exists()){
    await updateDoc(ref, { ...data, updatedAt: Date.now() });
  } else {
    await setDoc(ref, { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  }
  return id;
}

// Eliminar colonia
export async function deleteColony(colonyId){
  await deleteDoc(doc(db, 'colonies', colonyId));
}

// Activar/desactivar colonia
export async function setColonyStatus(colonyId, status){
  await updateDoc(doc(db, 'colonies', colonyId), { status, updatedAt: Date.now() });
}

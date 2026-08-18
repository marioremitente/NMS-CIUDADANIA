// Módulo de colonias — carga y gestión de colonias desde Firestore.
// Re-exporta funciones helper de mori01-data.js y nms-glyphs.js
// para que las páginas no necesiten importar múltiples módulos.
import { db } from './firebase-config.js';
import { SYSTEM_INFO, PLANETS, SYSTEM_SIGNATURE, glyphSVG, planetImageSlug, planetImg as _planetImg } from './mori01-data.js';
import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  glyphsToCartesian as _glyphsToCartesian,
  cartesianToNormalized,
  validateSignature,
  formatHexAddress,
  formatPortalString,
  cartesianDistance,
} from './nms-glyphs.js';

export { glyphSVG };
export const planetImg = _planetImg;

// Re-exportar funciones del decodificador para compatibilidad
export const glyphsToCartesian = _glyphsToCartesian;
export { cartesianToNormalized, validateSignature, formatHexAddress, formatPortalString, cartesianDistance };

/**
 * Convierte firma a posición normalizada (0-1) para el mapa 2D del atlas.
 * Wrapper retrocompatible con el código existente que usa glyphToPosition().
 */
export function glyphToPosition(signature) {
  const coords = _glyphsToCartesian(signature);
  if (!coords) return null;
  return cartesianToNormalized(coords);
}

// ── MORI-01 embebido ──────────────────────────────────────────────────
// Siempre aparece como primera colonia sin necesidad de Firestore.
const _moriCoords = _glyphsToCartesian(SYSTEM_SIGNATURE);

export const MORI01_COLONY = Object.freeze({
  id:          'mori-01',
  name:        SYSTEM_INFO.name,
  shortName:   SYSTEM_INFO.shortName,
  tag:         SYSTEM_INFO.tag,
  region:      SYSTEM_INFO.region,
  race:        SYSTEM_INFO.race,
  economy:     SYSTEM_INFO.economy,
  conflict:    SYSTEM_INFO.conflict,
  galaxy:      SYSTEM_INFO.galaxy,
  status:      'active',
  signature:   SYSTEM_SIGNATURE,
  hexAddress:  _moriCoords ? _moriCoords.hexAddress : null,
  cartesian:   _moriCoords ? { x: _moriCoords.x, y: _moriCoords.y, z: _moriCoords.z } : null,
  systemIndex: _moriCoords ? _moriCoords.systemIndex : null,
  planets:     PLANETS.map(p => ({ ...p })),
  createdAt:   0,
  updatedAt:   0,
});

const coloniesRef = collection(db, 'colonies');

// Enriquece una colonia con coordenadas Cartesianas si tiene signature pero no cartesian
function enrichCartesian(colony) {
  if (colony.signature && !colony.cartesian) {
    const coords = _glyphsToCartesian(colony.signature);
    if (coords) {
      colony.cartesian = { x: coords.x, y: coords.y, z: coords.z };
      colony.hexAddress = coords.hexAddress;
      colony.systemIndex = coords.systemIndex;
    }
  }
  return colony;
}

// Todas las colonias activas (MORI-01 siempre primero)
export async function loadAllColonies(){
  try{
    const q = query(coloniesRef, where('status', '==', 'active'));
    const snap = await getDocs(q);
    const firestore = snap.docs.map(d => enrichCartesian({ docId: d.id, ...d.data() }));
    if(!firestore.length) return [MORI01_COLONY];
    const hasMori = firestore.some(c => c.id === 'mori-01');
    return hasMori ? firestore : [MORI01_COLONY, ...firestore];
  }catch(e){
    console.warn('loadAllColonies: Firestore no disponible, usando MORI-01 embebido', e);
    return [MORI01_COLONY];
  }
}

// Todas las colonias (para el admin — incluye borradores e inactivas)
export async function loadAllColoniesAdmin(){
  try{
    const q = query(coloniesRef, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const firestore = snap.docs.map(d => enrichCartesian({ docId: d.id, ...d.data() }));
    if(!firestore.length) return [MORI01_COLONY];
    const hasMori = firestore.some(c => c.id === 'mori-01');
    return hasMori ? firestore : [MORI01_COLONY, ...firestore];
  }catch(e){
    console.warn('loadAllColoniesAdmin: Firestore no disponible, usando MORI-01 embebido', e);
    return [MORI01_COLONY];
  }
}

// Una colonia específica
export async function loadColony(colonyId){
  if(colonyId === 'mori-01') return MORI01_COLONY;
  const snap = await getDoc(doc(db, 'colonies', colonyId));
  if(!snap.exists()) return null;
  return enrichCartesian({ docId: snap.id, ...snap.data() });
}

// Planetas de una colonia
export async function getColonyPlanets(colonyId){
  const colony = await loadColony(colonyId);
  return colony ? (colony.planets || []) : [];
}

// Crear o actualizar colonia
// Si la firma de glifos cambió, recalcula las coordenadas Cartesianas automáticamente.
export async function saveColony(data){
  const id = data.id;
  if(!id) throw new Error('La colonia debe tener un id');

  // Auto-calcula cartesian si hay signature
  if (data.signature && data.signature.length === 12) {
    const coords = _glyphsToCartesian(data.signature);
    if (coords) {
      data.cartesian = { x: coords.x, y: coords.y, z: coords.z };
      data.hexAddress = coords.hexAddress;
      data.systemIndex = coords.systemIndex;
    }
  }

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

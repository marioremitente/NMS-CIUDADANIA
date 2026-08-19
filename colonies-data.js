// Módulo de colonias — carga y gestión de colonias desde Firestore.
// Re-exporta funciones helper de mori01-data.js para que las páginas
// que solo necesiten glifos/planetImg no tengan que importar ambos módulos.
import { db } from './firebase-config.js';
import { SYSTEM_INFO, PLANETS, SYSTEM_SIGNATURE, glyphSVG, planetImageSlug, planetImg as _planetImg } from './mori01-data.js';
import {
  collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc, deleteDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export { glyphSVG };
export const planetImg = _planetImg;

// ── Conversión de glifos a posición en el mapa ────────────────────────
// Convierte la firma de 12 glifos (1-16) en coordenadas {x, y} (0-1)
// usando el sistema de coordenadas galácticas de NMS.
// Portal format: P SSS YY ZZZ XXX
// YY → Y, ZZZ → Z (vertical en mapa 2D), XXX → X (horizontal)
export function glyphToPosition(signature){
  if(!signature || signature.length < 12) return null;
  const g = signature.map(v => v - 1);
  const portalY = (g[4] << 4) | g[5];
  const portalZ = (g[6] << 8) | (g[7] << 4) | g[8];
  const portalX = (g[9] << 8) | (g[10] << 4) | g[11];
  const galX = portalX < 0x800 ? portalX + 0x801 : portalX - 0x801;
  const galZ = portalZ < 0x800 ? portalZ + 0x801 : portalZ - 0x801;
  return { x: galX / 4096, y: galZ / 4096 };
}

// ── Decodificador inline (sin dependencia externa) ────────────────────
// Convierte firma de 12 glifos a coordenadas Cartesianas 3D.
// Formato: P SSS GG YYY XXX → X=XXX-0x7FF, Y=GG-0x7F, Z=YYY-0x7FF
function _glyphsToCartesianLocal(signature){
  if(!signature || signature.length < 12) return null;
  var h = signature.map(function(g){ return g - 1; });
  for(var i = 0; i < 12; i++){
    if(typeof h[i] !== 'number' || isNaN(h[i]) || h[i] < 0 || h[i] > 15) return null;
  }
  var P   = h[0];
  var SSS = (h[1] << 8) | (h[2] << 4) | h[3];
  var GG  = (h[4] << 4) | h[5];
  var YYY = (h[6] << 8) | (h[7] << 4) | h[8];
  var XXX = (h[9] << 8) | (h[10] << 4) | h[11];
  var hex = signature.map(function(g){
    return (g - 1).toString(16).toUpperCase().padStart(2, '0');
  }).join('');
  return {
    x: XXX - 0x7FF,
    y: GG - 0x7F,
    z: YYY - 0x7FF,
    planetIndex: P === 0 ? 1 : P,
    systemIndex: SSS,
    hexAddress: hex
  };
}

// ── MORI-01 embebido ──────────────────────────────────────────────────
// Siempre aparece como primera colonia sin necesidad de Firestore.
var _moriCoords = _glyphsToCartesianLocal(SYSTEM_SIGNATURE);

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

function enrichCartesian(colony) {
  if (colony.signature && !colony.cartesian) {
    var coords = _glyphsToCartesianLocal(colony.signature);
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
export async function saveColony(data){
  const id = data.id;
  if(!id) throw new Error('La colonia debe tener un id');
  if (data.signature && data.signature.length === 12) {
    var coords = _glyphsToCartesianLocal(data.signature);
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

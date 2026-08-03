// Datos fijos del sistema MRNG (antes NETINOSTV), compartidos entre todas las páginas.
// Sin dependencias — index.html no necesita cargar Firebase solo para esto.
export const SYSTEM_INFO = {
  tag: '[MRNG]',
  name: 'Moringos PRIME Disonante',
  shortName: 'Moringos PRIME',
  region: 'Cuadrante Delta',
  regionDetail: 'Zona periférica de la galaxia',
  race: 'Korvax',
  economy: 'Generación de Energía',
  conflict: '2 · Tempestuoso',
  galaxy: 'Galaxia de Euclides',
};
export const PLANETS = [
  {i:4, name:'Aizinia', capital:true, clima:'Apacible', centinela:'Remoto', flora:'Generoso', fauna:'Abundante', rec:['Bulbo Estelar','Plata','Parafino','Cobre']},
  {i:3, name:'Agforn Sigma', clima:'Diluvio Ácido', centinela:'Abandonado', flora:'Generoso', fauna:'Copioso', rec:['Moho Fúngico','Chatarra Recuperable','Cobalto','Amonio','Cobre Activado']},
  {i:2, name:'Hibouri', clima:'Aire Sobrecalentado', centinela:'Ejecutor', flora:'Rebosante', fauna:'Profuso', rec:['Solanio','Sodio','Fósforo','Cobre Activado']},
  {i:6, name:'Nuvillus', clima:'Nubes Perdidas', centinela:'Abarca Demasiado', flora:'Desarraigado', fauna:'Entre Mundos', rec:['Cobre','Oro','Sodio']},
  {i:7, name:'Reumodgr VIII', clima:'Vientos Volátiles', centinela:'Mínimo', flora:'Abundante', fauna:'Ocasional', rec:['Raíz Gamma','Cobre','Uranio','Plata']},
  {i:5, name:'Luna de Aizinia', clima:'Vaho Tóxico', centinela:'Ejecutor', flora:'Frecuente', fauna:'Generoso', rec:['Huesos Antiguos','Moho Fúngico','Cobre','Amonio','Plata']},
];
export const SYSTEM_SIGNATURE = [4,2,7,13,11,7,16,8,5,8,3,1];
// Glifos: imágenes numeradas 1.webp a 16.webp, en la raíz del repositorio.
// Compartido por index.html y el selector visual de mori01-hazte-ciudadano.
export function glyphSVG(n){
  const valid = (n >= 1 && n <= 16) ? n : 1;
  return `<img src="./${valid}.webp" alt="Glifo ${valid}" loading="lazy">`;
}
// Imágenes reales de cada planeta: nombre del planeta en minúsculas y sin
// espacios (ej. "Agforn Sigma" -> agfornsigma.webp), en la raíz del repo.
export function planetImageSlug(name){
  return name.toLowerCase().replace(/\s+/g, '');
}
export function planetImg(p){
  return `<img src="./${planetImageSlug(p.name)}.webp" alt="${p.name}" loading="lazy">`;
}
// Cargos ministeriales que el admin puede asignar a un ciudadano.
// Solo se asignan desde mori01-admin — el propio ciudadano nunca puede
// escribir este campo (las reglas de Firestore solo permiten que el
// dueño edite profession/platform/faceIndex, no role).
export const ROLES = [
  'Ministerio del Interior (Gobierno)',
  'Ministerio de Relaciones Exteriores',
  'Ministerio de Defensa',
  'Ministerio de Hacienda',
  'Ministerio de Justicia',
  'Ministerio de Inteligencia',
  'Ministerio de Educación',
  'Ministerio de Vivienda',
  'Ministerio de Salud',
  'Consejo del Arcade',
  'Guardia de Sentinelas',
  'Cronista de Mori-01',
  'CIUDADANO',
];

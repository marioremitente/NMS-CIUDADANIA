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
export const SYSTEM_SIGNATURE = [2,7,13,11,7,16,8,5,8,3,1];

// Glifos de línea (1-16), arte original, no son assets del juego.
// Compartido por index.html y el selector visual de mori01-hazte-ciudadano.
export const GLYPH_PATHS = {
  1:'M4 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0', // onda
  2:'M4 12l6-6 3 3 4-4 3 3M4 12l7 2',    // ala
  3:'M6 4v14M14 4v14M6 9h8M6 14h8',      // puerta
  4:'M12 4c3 2 3 12 0 15',               // cresta
  5:'M8 4a8 8 0 100 16 8 8 0 010-16z M13 5a7 7 0 010 14',// eclipse
  6:'M12 3l6 15H6z',                     // gota
  7:'M5 15h14l-2 3H7zM8 15V8h1v7M12 15V6h1v9M16 15V9h1v6', // nave
  8:'M12 6v6M8 8l-2-2M16 8l2-2M8 16l-2 2M16 16l2 2M8 12H4M16 12h4', // insecto
  9:'M12 6v12M6 8c3 1 4 3 6 4M18 8c-3 1-4 3-6 4M6 16c3-1 4-3 6-4M18 16c-3-1-4-3-6-4', // libélula
 10:'M12 12c2-4 6-4 8 0-2 4-6 4-8 0zM12 12c-2-4-6-4-8 0 2 4 6 4 8 0', // galaxia
 11:'M12 4l7 4v8l-7 4-7-4V8zM12 4v16M5 8l7 4 7-4M5 16l7-4 7 4', // voxel
 12:'M4 12c4-5 12-5 16 0-4 3-8 3-11 1M17 9l3-2', // pez
 13:'M12 5l4 14H8zM12 5l-2 3M12 5l2 3',   // tienda
 14:'M12 3c2 3 2 9 0 13-2-4-2-10 0-13zM10 16l-2 4M14 16l2 4', // cohete
 15:'M12 4v16M12 8L7 4M12 8l5-4M12 13l-5 4M12 13l5 4', // árbol
 16:'M12 4l4 7H8zM12 11l4 7H8zM8 11l4 7-4-7z' // atlas
};
export function glyphSVG(n){
  const d = GLYPH_PATHS[n] || GLYPH_PATHS[1];
  return `<svg viewBox="0 0 24 24"><path d="${d}"/></svg>`;
}
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

// Firma del sistema en formato Hexadecimal estándar de No Man's Sky (0-F)
export const SYSTEM_SIGNATURE = ['4', '2', '7', 'C', 'A', '7', 'F', '7', '4', '7', '3', '1']; 

427CA7F74731

// Glifos: imágenes nombradas en hexadecimal 0.webp a F.webp en la raíz del repositorio.
export function glyphSVG(hexChar) {
// Convierte a mayúscula y valida que sea un solo carácter entre 0-9 o A-F
const upper = String(hexChar).toUpperCase();
const validHex = /^[0-9A-F]$/.test(upper) ? upper : '0';
return <img src="./${validHex}.webp" alt="Glifo ${validHex}" loading="lazy">;
} 

// Imágenes reales de cada planeta: nombre del planeta en minúsculas y sin
// espacios (ej. "Agforn Sigma" -> agfornsigma.webp), en la raíz del repo.
export function planetImageSlug(name) {
return name.toLowerCase().replace(/\s+/g, '');
} 

export function planetImg(p) {
return <img src="./${planetImageSlug(p.name)}.webp" alt="${p.name}" loading="lazy">;
} 

// Cargos ministeriales que el admin puede asignar a un ciudadano.
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
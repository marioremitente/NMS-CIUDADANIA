// ── Decodificador de glifos de portal NMS ────────────────────────────
// Formato del portal: P SSS GG YYY XXX (12 glifos hexadecimales)
// P   = glifo 1  → Planeta (1-6, 0 = planeta 1)
// SSS = glifos 2-4 → Índice del sistema estelar
// GG  = glifos 5-6 → Altura / eje Y (offset 0x7F = 127)
// YYY = glifos 7-9 → Profundidad / eje Z (offset 0x7FF = 2047)
// XXX = glifos 10-12 → Horizontal / eje X (offset 0x7FF = 2047)
//
// Valores de cada glifo: 1 a 16 (equivalente a hex 0-F)
// Referencia: https://nomanssky.fandom.com/wiki/Portal_address

const OFFSET_XZ = 0x7FF; // 2047
const OFFSET_Y  = 0x7F;  // 127
const MAX_HEX_XZ = 0xFFF; // 4095
const MAX_HEX_Y  = 0xFF;  // 255

// ── Validación ──────────────────────────────────────────────────────

/**
 * Valida que una firma tenga exactamente 12 glifos, cada uno entre 1 y 16.
 * @param {number[]} signature - Array de 12 números
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateSignature(signature) {
  if (!Array.isArray(signature)) {
    return { valid: false, error: 'La firma debe ser un arreglo de números.' };
  }
  if (signature.length !== 12) {
    return { valid: false, error: `Se esperan 12 glifos, se recibieron ${signature.length}.` };
  }
  for (let i = 0; i < 12; i++) {
    const g = signature[i];
    if (typeof g !== 'number' || !Number.isInteger(g) || g < 1 || g > 16) {
      return { valid: false, error: `Glifo ${i + 1}: valor inválido "${g}". Debe ser un entero del 1 al 16.` };
    }
  }
  return { valid: true, error: null };
}

// ── Decodificación ──────────────────────────────────────────────────

/**
 * Convierte un array de 12 glifos (1-16) a componentes hex crudos.
 * @param {number[]} signature
 * @returns {{ P: number, SSS: number, GG: number, YYY: number, XXX: number,
 *             hexAddress: string }|null}
 */
export function decodePortalCode(signature) {
  const v = validateSignature(signature);
  if (!v.valid) return null;

  // Restar 1 para obtener valores hex (0-F)
  const h = signature.map(g => g - 1);

  const P   = h[0];
  const SSS = (h[1] << 8) | (h[2] << 4) | h[3];
  const GG  = (h[4] << 4) | h[5];
  const YYY = (h[6] << 8) | (h[7] << 4) | h[8];
  const XXX = (h[9] << 8) | (h[10] << 4) | h[11];

  const hex = signature.map(g => (g - 1).toString(16).toUpperCase().padStart(2, '0')).join('');

  return {
    P,
    SSS,
    GG,
    YYY,
    XXX,
    hexAddress: hex.slice(0, 1) + hex.slice(1, 4) + hex.slice(4, 6) + hex.slice(6, 9) + hex.slice(9, 12),
  };
}

/**
 * Convierte una firma de 12 glifos a coordenadas Cartesianas 3D.
 * El centro de la galaxia es (0, 0, 0).
 * Rango X: -2048 a 2047, Rango Y: -128 a 127, Rango Z: -2048 a 2047.
 * @param {number[]} signature
 * @returns {{ x: number, y: number, z: number,
 *             planetIndex: number, systemIndex: number,
 *             hexAddress: string }|null}
 */
export function glyphsToCartesian(signature) {
  const decoded = decodePortalCode(signature);
  if (!decoded) return null;

  // Aplicar offsets del motor del juego
  const x = decoded.XXX - OFFSET_XZ;
  const y = decoded.GG  - OFFSET_Y;
  const z = decoded.YYY - OFFSET_XZ;

  return {
    x,
    y,
    z,
    planetIndex: decoded.P === 0 ? 1 : decoded.P, // 0 = planeta 1
    systemIndex: decoded.SSS,
    hexAddress: decoded.hexAddress,
  };
}

// ── Codificación (inverso) ──────────────────────────────────────────

/**
 * Convierte coordenadas Cartesianas + planeta + sistema a firma de 12 glifos.
 * Aplica aritmética modular para mantener valores dentro de rango.
 * @param {number} x - Coordenada X (-2048 a 2047)
 * @param {number} y - Coordenada Y (-128 a 127)
 * @param {number} z - Coordenada Z (-2048 a 2047)
 * @param {number} planetIndex - Planeta (1-6)
 * @param {number} systemIndex - Índice del sistema (0-0x2FF = 0-767)
 * @returns {number[]} Array de 12 glifos (1-16)
 */
export function cartesianToGlyphs(x, y, z, planetIndex, systemIndex) {
  // Aritmética modular para envolver el espacio
  const hexX = ((x + OFFSET_XZ) % (MAX_HEX_XZ + 1) + (MAX_HEX_XZ + 1)) % (MAX_HEX_XZ + 1);
  const hexY = ((y + OFFSET_Y)  % (MAX_HEX_Y + 1)  + (MAX_HEX_Y + 1))  % (MAX_HEX_Y + 1);
  const hexZ = ((z + OFFSET_XZ) % (MAX_HEX_XZ + 1) + (MAX_HEX_XZ + 1)) % (MAX_HEX_XZ + 1);
  const hexS = Math.max(0, Math.min(systemIndex, 0x2FF));

  const P  = Math.max(0, Math.min(planetIndex - 1, 15));
  const S1 = (hexS >> 8) & 0xF;
  const S2 = (hexS >> 4) & 0xF;
  const S3 = hexS & 0xF;
  const G1 = (hexY >> 4) & 0xF;
  const G2 = hexY & 0xF;
  const Z1 = (hexZ >> 8) & 0xF;
  const Z2 = (hexZ >> 4) & 0xF;
  const Z3 = hexZ & 0xF;
  const X1 = (hexX >> 8) & 0xF;
  const X2 = (hexX >> 4) & 0xF;
  const X3 = hexX & 0xF;

  return [P, S1, S2, S3, G1, G2, Z1, Z2, Z3, X1, X2, X3].map(v => v + 1);
}

// ── Utilidades de mapa ──────────────────────────────────────────────

/**
 * Determina el cuadrante galáctico de un punto.
 * @param {number} x
 * @param {number} z
 * @returns {'Alpha'|'Beta'|'Gamma'|'Delta'}
 */
export function getGalacticQuadrant(x, z) {
  if (x >= 0 && z >= 0) return 'Alpha';
  if (x < 0 && z >= 0)  return 'Beta';
  if (x < 0 && z < 0)   return 'Gamma';
  return 'Delta';
}

/**
 * Calcula la distancia euclidiana entre dos puntos Cartesianas 3D.
 */
export function cartesianDistance(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Normaliza coordenadas Cartesianas a rango 0-1 para renderizado en canvas 2D.
 * Útil para el mapa del atlas que no necesita 3D real.
 * @param {{ x: number, y: number, z: number }} coords
 * @returns {{ nx: number, ny: number }}
 */
export function cartesianToNormalized(coords) {
  return {
    nx: (coords.x + OFFSET_XZ) / (MAX_HEX_XZ + 1),
    ny: (coords.z + OFFSET_XZ) / (MAX_HEX_XZ + 1),
  };
}

/**
 * Formatea la dirección hexadecimal para mostrar al usuario.
 * Ejemplo: "427D7B108581"
 */
export function formatHexAddress(signature) {
  const decoded = decodePortalCode(signature);
  return decoded ? decoded.hexAddress : null;
}

/**
 * Genera la cadena de texto de un portal para copiar/pegar.
 * Ejemplo: "0427:007B:0108:0581"
 */
export function formatPortalString(signature) {
  const decoded = decodePortalCode(signature);
  if (!decoded) return null;
  const pad = (v, n) => v.toString(16).toUpperCase().padStart(n, '0');
  return `${pad(decoded.SSS, 4)}:${pad(decoded.GG, 4)}:${pad(decoded.YYY, 4)}:${pad(decoded.XXX, 4)}`;
}

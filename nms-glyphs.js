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

export function validateSignature(signature) {
  if (!Array.isArray(signature)) {
    return { valid: false, error: 'La firma debe ser un arreglo de numeros.' };
  }
  if (signature.length !== 12) {
    return { valid: false, error: 'Se esperan 12 glifos, se recibieron ' + signature.length + '.' };
  }
  for (let i = 0; i < 12; i++) {
    const g = signature[i];
    if (typeof g !== 'number' || !Number.isInteger(g) || g < 1 || g > 16) {
      return { valid: false, error: 'Glifo ' + (i + 1) + ': valor invalido "' + g + '". Debe ser un entero del 1 al 16.' };
    }
  }
  return { valid: true, error: null };
}

export function decodePortalCode(signature) {
  const v = validateSignature(signature);
  if (!v.valid) return null;

  const h = signature.map(function(g) { return g - 1; });

  const P   = h[0];
  const SSS = (h[1] << 8) | (h[2] << 4) | h[3];
  const GG  = (h[4] << 4) | h[5];
  const YYY = (h[6] << 8) | (h[7] << 4) | h[8];
  const XXX = (h[9] << 8) | (h[10] << 4) | h[11];

  const hex = signature.map(function(g) {
    return (g - 1).toString(16).toUpperCase().padStart(2, '0');
  }).join('');

  return {
    P: P,
    SSS: SSS,
    GG: GG,
    YYY: YYY,
    XXX: XXX,
    hexAddress: hex
  };
}

export function glyphsToCartesian(signature) {
  const decoded = decodePortalCode(signature);
  if (!decoded) return null;

  const x = decoded.XXX - OFFSET_XZ;
  const y = decoded.GG  - OFFSET_Y;
  const z = decoded.YYY - OFFSET_XZ;

  return {
    x: x,
    y: y,
    z: z,
    planetIndex: decoded.P === 0 ? 1 : decoded.P,
    systemIndex: decoded.SSS,
    hexAddress: decoded.hexAddress
  };
}

export function cartesianToGlyphs(x, y, z, planetIndex, systemIndex) {
  var hexX = ((x + OFFSET_XZ) % (MAX_HEX_XZ + 1) + (MAX_HEX_XZ + 1)) % (MAX_HEX_XZ + 1);
  var hexY = ((y + OFFSET_Y)  % (MAX_HEX_Y + 1)  + (MAX_HEX_Y + 1))  % (MAX_HEX_Y + 1);
  var hexZ = ((z + OFFSET_XZ) % (MAX_HEX_XZ + 1) + (MAX_HEX_XZ + 1)) % (MAX_HEX_XZ + 1);
  var hexS = Math.max(0, Math.min(systemIndex, 0x2FF));

  var P  = Math.max(0, Math.min(planetIndex - 1, 15));
  var S1 = (hexS >> 8) & 0xF;
  var S2 = (hexS >> 4) & 0xF;
  var S3 = hexS & 0xF;
  var G1 = (hexY >> 4) & 0xF;
  var G2 = hexY & 0xF;
  var Z1 = (hexZ >> 8) & 0xF;
  var Z2 = (hexZ >> 4) & 0xF;
  var Z3 = hexZ & 0xF;
  var X1 = (hexX >> 8) & 0xF;
  var X2 = (hexX >> 4) & 0xF;
  var X3 = hexX & 0xF;

  return [P, S1, S2, S3, G1, G2, Z1, Z2, Z3, X1, X2, X3].map(function(v) { return v + 1; });
}

export function cartesianDistance(a, b) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  var dz = b.z - a.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function formatHexAddress(signature) {
  var decoded = decodePortalCode(signature);
  return decoded ? decoded.hexAddress : null;
}

export class GlyphDecoder {
  decode(hexString) {
    if (!hexString || hexString.length !== 24) return null;
    const signature = [];
    for (let i = 0; i < 12; i++) {
      const byte = parseInt(hexString.substr(i * 2, 2), 16);
      signature.push(byte + 1);
    }
    return glyphsToCartesian(signature);
  }
}

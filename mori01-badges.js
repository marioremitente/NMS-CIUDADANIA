import { PLANETS } from './mori01-data.js';

export const PIONEER_COUNT = 10;
export const VETERAN_MONTHS = 3;
const VETERAN_MS = VETERAN_MONTHS * 30 * 24 * 60 * 60 * 1000;

export function computeBadges(citizens){
  const approved = citizens
    .filter(c => c.status === 'citizen')
    .slice()
    .sort((a,b) => a.ts - b.ts);

  const pioneerIds = new Set(approved.slice(0, PIONEER_COUNT).map(c => c.id));

  const firstByPlanet = new Map();
  approved.forEach(c => {
    if(!firstByPlanet.has(c.planetIndex)) firstByPlanet.set(c.planetIndex, c.id);
  });

  const now = Date.now();
  const badgesById = new Map();

  approved.forEach(c => {
    const badges = [];

    if(pioneerIds.has(c.id)){
      badges.push({
        label: 'Pionero', icon: '🏅',
        title: `Entre los primeros ${PIONEER_COUNT} ciudadanos de Mori-01`
      });
    }

    if(firstByPlanet.get(c.planetIndex) === c.id){
      const planetName = PLANETS.find(p => p.i === c.planetIndex)?.name || 'su mundo';
      badges.push({
        label: `Colono de ${planetName}`, icon: '🌍',
        title: `Primer ciudadano asentado en ${planetName}`
      });
    }

    if(now - c.ts >= VETERAN_MS){
      badges.push({
        label: 'Veterano', icon: '⏳',
        title: `Ciudadano desde hace más de ${VETERAN_MONTHS} meses`
      });
    }

    if(c.profession && c.platform && c.friendCode){
      badges.push({
        label: 'Perfil completo', icon: '📋',
        title: 'Completó profesión, plataforma y código de amigo'
      });
    }

    badgesById.set(c.id, badges);
  });

  return badgesById;
}

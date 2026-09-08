export const COUNTRY_NAMES: Record<string, string> = {
  AD: 'Andorra',
  AE: 'UAE',
  AF: 'Afghanistan',
  AL: 'Albania',
  AM: 'Armenia',
  AR: 'Argentina',
  AT: 'Austria',
  AU: 'Australia',
  AZ: 'Azerbaijan',
  BA: 'Bosnia',
  BD: 'Bangladesh',
  BE: 'Belgium',
  BG: 'Bulgaria',
  BH: 'Bahrain',
  BR: 'Brazil',
  BY: 'Belarus',
  CA: 'Canada',
  CH: 'Switzerland',
  CL: 'Chile',
  CN: 'China',
  CO: 'Colombia',
  CY: 'Cyprus',
  CZ: 'Czechia',
  DE: 'Germany',
  DK: 'Denmark',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  GB: 'UK',
  GE: 'Georgia',
  GR: 'Greece',
  HK: 'Hong Kong',
  HR: 'Croatia',
  HU: 'Hungary',
  ID: 'Indonesia',
  IE: 'Ireland',
  IL: 'Israel',
  IN: 'India',
  IQ: 'Iraq',
  IR: 'Iran',
  IS: 'Iceland',
  IT: 'Italy',
  JP: 'Japan',
  KR: 'South Korea',
  KZ: 'Kazakhstan',
  LT: 'Lithuania',
  LU: 'Luxembourg',
  LV: 'Latvia',
  MD: 'Moldova',
  MX: 'Mexico',
  MY: 'Malaysia',
  NL: 'Netherlands',
  NO: 'Norway',
  NZ: 'New Zealand',
  PL: 'Poland',
  PT: 'Portugal',
  RO: 'Romania',
  RS: 'Serbia',
  RU: 'Russia',
  SA: 'Saudi Arabia',
  SE: 'Sweden',
  SG: 'Singapore',
  TH: 'Thailand',
  TR: 'Turkey',
  TW: 'Taiwan',
  UA: 'Ukraine',
  US: 'USA',
  VN: 'Vietnam',
  ZA: 'South Africa',
}

export const COUNTRY_COORDINATES: Record<string, { x: number; y: number; continent: string }> = {
  US: { x: 220, y: 165, continent: 'North America' },
  CA: { x: 240, y: 110, continent: 'North America' },
  MX: { x: 200, y: 220, continent: 'North America' },
  BR: { x: 335, y: 325, continent: 'South America' },
  AR: { x: 300, y: 395, continent: 'South America' },
  CL: { x: 280, y: 380, continent: 'South America' },
  CO: { x: 275, y: 260, continent: 'South America' },
  PE: { x: 265, y: 300, continent: 'South America' },
  GB: { x: 475, y: 125, continent: 'Europe' },
  IE: { x: 455, y: 125, continent: 'Europe' },
  FR: { x: 490, y: 152, continent: 'Europe' },
  DE: { x: 515, y: 135, continent: 'Europe' },
  NL: { x: 500, y: 128, continent: 'Europe' },
  BE: { x: 495, y: 137, continent: 'Europe' },
  CH: { x: 505, y: 155, continent: 'Europe' },
  AT: { x: 520, y: 150, continent: 'Europe' },
  IT: { x: 518, y: 175, continent: 'Europe' },
  ES: { x: 470, y: 180, continent: 'Europe' },
  PT: { x: 455, y: 180, continent: 'Europe' },
  SE: { x: 530, y: 95, continent: 'Europe' },
  NO: { x: 510, y: 95, continent: 'Europe' },
  FI: { x: 555, y: 95, continent: 'Europe' },
  DK: { x: 510, y: 120, continent: 'Europe' },
  PL: { x: 540, y: 135, continent: 'Europe' },
  CZ: { x: 525, y: 142, continent: 'Europe' },
  SK: { x: 535, y: 148, continent: 'Europe' },
  HU: { x: 535, y: 155, continent: 'Europe' },
  RO: { x: 560, y: 160, continent: 'Europe' },
  BG: { x: 565, y: 172, continent: 'Europe' },
  GR: { x: 555, y: 185, continent: 'Europe' },
  TR: { x: 585, y: 180, continent: 'Asia' },
  UA: { x: 575, y: 140, continent: 'Europe' },
  RU: { x: 680, y: 110, continent: 'Europe' },
  IR: { x: 620, y: 195, continent: 'Asia' },
  IQ: { x: 605, y: 195, continent: 'Asia' },
  SA: { x: 605, y: 230, continent: 'Asia' },
  AE: { x: 635, y: 225, continent: 'Asia' },
  IL: { x: 588, y: 200, continent: 'Asia' },
  IN: { x: 700, y: 230, continent: 'Asia' },
  SG: { x: 775, y: 290, continent: 'Asia' },
  MY: { x: 765, y: 280, continent: 'Asia' },
  ID: { x: 810, y: 310, continent: 'Asia' },
  TH: { x: 745, y: 240, continent: 'Asia' },
  VN: { x: 765, y: 240, continent: 'Asia' },
  HK: { x: 785, y: 225, continent: 'Asia' },
  TW: { x: 805, y: 220, continent: 'Asia' },
  CN: { x: 760, y: 180, continent: 'Asia' },
  JP: { x: 840, y: 175, continent: 'Asia' },
  KR: { x: 815, y: 175, continent: 'Asia' },
  AU: { x: 845, y: 360, continent: 'Oceania' },
  NZ: { x: 910, y: 410, continent: 'Oceania' },
  ZA: { x: 535, y: 365, continent: 'Africa' },
  EG: { x: 555, y: 210, continent: 'Africa' },
  NG: { x: 490, y: 260, continent: 'Africa' },
  KE: { x: 570, y: 275, continent: 'Africa' },
  CY: { x: 575, y: 190, continent: 'Europe' },
  AM: { x: 605, y: 170, continent: 'Asia' },
  AZ: { x: 615, y: 170, continent: 'Asia' },
  GE: { x: 600, y: 165, continent: 'Asia' },
  KZ: { x: 650, y: 140, continent: 'Asia' },
  UZ: { x: 640, y: 160, continent: 'Asia' },
  MD: { x: 565, y: 150, continent: 'Europe' },
  RS: { x: 540, y: 165, continent: 'Europe' },
  BA: { x: 530, y: 165, continent: 'Europe' },
  HR: { x: 525, y: 160, continent: 'Europe' },
  SI: { x: 518, y: 155, continent: 'Europe' },
  AL: { x: 538, y: 175, continent: 'Europe' },
  ME: { x: 535, y: 170, continent: 'Europe' },
  MK: { x: 545, y: 172, continent: 'Europe' },
  EE: { x: 550, y: 110, continent: 'Europe' },
  LV: { x: 550, y: 118, continent: 'Europe' },
  LT: { x: 545, y: 126, continent: 'Europe' },
  BY: { x: 560, y: 128, continent: 'Europe' },
  IS: { x: 435, y: 75, continent: 'Europe' },
  LU: { x: 498, y: 139, continent: 'Europe' },
}

export function getCountryFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐'
  const upper = code.toUpperCase()
  const codePoints = [...upper].map(c => 127397 + c.charCodeAt(0))
  try {
    return String.fromCodePoint(...codePoints)
  } catch {
    return '🌐'
  }
}

export function detectCountryFromText(text: string): { code: string; name: string; flag: string } {
  if (!text) return { code: 'UN', name: 'Global / Anycast', flag: '🌐' }

  // Check for [XX] pattern e.g. [DE], [NL], [US], [IR]
  const bracketMatch = text.match(/\[([A-Za-z]{2})\]/)
  if (bracketMatch) {
    const code = bracketMatch[1].toUpperCase()
    if (COUNTRY_NAMES[code]) {
      return { code, name: COUNTRY_NAMES[code], flag: getCountryFlag(code) }
    }
  }

  // Check common keywords
  const lower = text.toLowerCase()
  for (const [code, name] of Object.entries(COUNTRY_NAMES)) {
    if (lower.includes(name.toLowerCase()) || lower.includes(`_${code.toLowerCase()}_`)) {
      return { code, name, flag: getCountryFlag(code) }
    }
  }

  return { code: 'UN', name: 'Global Relay', flag: '🌐' }
}

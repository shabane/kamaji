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

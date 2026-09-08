import React from 'react'

export interface WorldHexCountry {
  code: string
  name: string
  continent: 'North America' | 'South America' | 'Europe' | 'Africa' | 'Asia' | 'Oceania'
  col: number
  row: number
  flag: string
}

export const WORLD_HEX_COUNTRIES: WorldHexCountry[] = [
  // ================= NORTH AMERICA =================
  { code: 'GL', name: 'Greenland', continent: 'North America', col: 6, row: 1, flag: '🇬🇱' },
  { code: 'CA', name: 'Canada', continent: 'North America', col: 3, row: 2, flag: '🇨🇦' },
  { code: 'US', name: 'United States', continent: 'North America', col: 3, row: 3, flag: '🇺🇸' },
  { code: 'MX', name: 'Mexico', continent: 'North America', col: 3, row: 4, flag: '🇲🇽' },
  { code: 'GT', name: 'Guatemala', continent: 'North America', col: 3, row: 5, flag: '🇬🇹' },
  { code: 'BZ', name: 'Belize', continent: 'North America', col: 4, row: 5, flag: '🇧🇿' },
  { code: 'SV', name: 'El Salvador', continent: 'North America', col: 2, row: 5, flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', continent: 'North America', col: 3, row: 6, flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', continent: 'North America', col: 4, row: 6, flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', continent: 'North America', col: 3, row: 7, flag: '🇨🇷' },
  { code: 'PA', name: 'Panama', continent: 'North America', col: 4, row: 7, flag: '🇵🇦' },
  { code: 'CU', name: 'Cuba', continent: 'North America', col: 5, row: 4, flag: '🇨🇺' },
  { code: 'BS', name: 'Bahamas', continent: 'North America', col: 5, row: 3, flag: '🇧🇸' },
  { code: 'JM', name: 'Jamaica', continent: 'North America', col: 5, row: 5, flag: '🇯🇲' },
  { code: 'HT', name: 'Haiti', continent: 'North America', col: 6, row: 4, flag: '🇭🇹' },
  { code: 'DO', name: 'Dominican Republic', continent: 'North America', col: 6, row: 5, flag: '🇩🇴' },
  { code: 'PR', name: 'Puerto Rico', continent: 'North America', col: 7, row: 5, flag: '🇵🇷' },
  { code: 'TT', name: 'Trinidad and Tobago', continent: 'North America', col: 7, row: 6, flag: '🇹🇹' },

  // ================= SOUTH AMERICA =================
  { code: 'CO', name: 'Colombia', continent: 'South America', col: 4, row: 8, flag: '🇨🇴' },
  { code: 'VE', name: 'Venezuela', continent: 'South America', col: 5, row: 8, flag: '🇻🇪' },
  { code: 'GY', name: 'Guyana', continent: 'South America', col: 6, row: 7, flag: '🇬🇾' },
  { code: 'SR', name: 'Suriname', continent: 'South America', col: 7, row: 7, flag: '🇸🇷' },
  { code: 'EC', name: 'Ecuador', continent: 'South America', col: 3, row: 8, flag: '🇪🇨' },
  { code: 'PE', name: 'Peru', continent: 'South America', col: 3, row: 9, flag: '🇵🇪' },
  { code: 'BR', name: 'Brazil', continent: 'South America', col: 5, row: 9, flag: '🇧🇷' },
  { code: 'BO', name: 'Bolivia', continent: 'South America', col: 4, row: 9, flag: '🇧🇴' },
  { code: 'PY', name: 'Paraguay', continent: 'South America', col: 4, row: 10, flag: '🇵🇾' },
  { code: 'UY', name: 'Uruguay', continent: 'South America', col: 5, row: 10, flag: '🇺🇾' },
  { code: 'CL', name: 'Chile', continent: 'South America', col: 3, row: 10, flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', continent: 'South America', col: 4, row: 11, flag: '🇦🇷' },

  // ================= EUROPE =================
  { code: 'IS', name: 'Iceland', continent: 'Europe', col: 9, row: 1, flag: '🇮🇸' },
  { code: 'NO', name: 'Norway', continent: 'Europe', col: 12, row: 1, flag: '🇳🇴' },
  { code: 'SE', name: 'Sweden', continent: 'Europe', col: 13, row: 1, flag: '🇸🇪' },
  { code: 'FI', name: 'Finland', continent: 'Europe', col: 14, row: 1, flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', continent: 'Europe', col: 10, row: 2, flag: '🇮🇪' },
  { code: 'GB', name: 'United Kingdom', continent: 'Europe', col: 11, row: 2, flag: '🇬🇧' },
  { code: 'DK', name: 'Denmark', continent: 'Europe', col: 12, row: 2, flag: '🇩🇰' },
  { code: 'EE', name: 'Estonia', continent: 'Europe', col: 14, row: 2, flag: '🇪🇪' },
  { code: 'LV', name: 'Latvia', continent: 'Europe', col: 15, row: 2, flag: '🇱🇻' },
  { code: 'LT', name: 'Lithuania', continent: 'Europe', col: 14, row: 3, flag: '🇱🇹' },
  { code: 'NL', name: 'Netherlands', continent: 'Europe', col: 11, row: 3, flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', continent: 'Europe', col: 11, row: 4, flag: '🇧🇪' },
  { code: 'LU', name: 'Luxembourg', continent: 'Europe', col: 12, row: 4, flag: '🇱🇺' },
  { code: 'DE', name: 'Germany', continent: 'Europe', col: 12, row: 3, flag: '🇩🇪' },
  { code: 'PL', name: 'Poland', continent: 'Europe', col: 13, row: 3, flag: '🇵🇱' },
  { code: 'CZ', name: 'Czechia', continent: 'Europe', col: 13, row: 4, flag: '🇨🇿' },
  { code: 'SK', name: 'Slovakia', continent: 'Europe', col: 14, row: 4, flag: '🇸🇰' },
  { code: 'AT', name: 'Austria', continent: 'Europe', col: 13, row: 5, flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', continent: 'Europe', col: 12, row: 5, flag: '🇨🇭' },
  { code: 'FR', name: 'France', continent: 'Europe', col: 10, row: 4, flag: '🇫🇷' },
  { code: 'AD', name: 'Andorra', continent: 'Europe', col: 9, row: 4, flag: '🇦🇩' },
  { code: 'ES', name: 'Spain', continent: 'Europe', col: 9, row: 5, flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', continent: 'Europe', col: 8, row: 5, flag: '🇵🇹' },
  { code: 'IT', name: 'Italy', continent: 'Europe', col: 11, row: 5, flag: '🇮🇹' },
  { code: 'MT', name: 'Malta', continent: 'Europe', col: 12, row: 7, flag: '🇲🇹' },
  { code: 'SI', name: 'Slovenia', continent: 'Europe', col: 12, row: 6, flag: '🇸🇮' },
  { code: 'HR', name: 'Croatia', continent: 'Europe', col: 13, row: 6, flag: '🇭🇷' },
  { code: 'BA', name: 'Bosnia', continent: 'Europe', col: 13, row: 7, flag: '🇧🇦' },
  { code: 'RS', name: 'Serbia', continent: 'Europe', col: 14, row: 6, flag: '🇷🇸' },
  { code: 'ME', name: 'Montenegro', continent: 'Europe', col: 14, row: 7, flag: '🇲🇪' },
  { code: 'AL', name: 'Albania', continent: 'Europe', col: 14, row: 8, flag: '🇦🇱' },
  { code: 'MK', name: 'North Macedonia', continent: 'Europe', col: 15, row: 7, flag: '🇲🇰' },
  { code: 'GR', name: 'Greece', continent: 'Europe', col: 15, row: 8, flag: '🇬🇷' },
  { code: 'HU', name: 'Hungary', continent: 'Europe', col: 14, row: 5, flag: '🇭🇺' },
  { code: 'RO', name: 'Romania', continent: 'Europe', col: 15, row: 5, flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', continent: 'Europe', col: 15, row: 6, flag: '🇧🇬' },
  { code: 'MD', name: 'Moldova', continent: 'Europe', col: 16, row: 5, flag: '🇲🇩' },
  { code: 'UA', name: 'Ukraine', continent: 'Europe', col: 16, row: 4, flag: '🇺🇦' },
  { code: 'BY', name: 'Belarus', continent: 'Europe', col: 15, row: 3, flag: '🇧🇾' },
  { code: 'RU', name: 'Russia', continent: 'Europe', col: 17, row: 2, flag: '🇷🇺' },

  // ================= AFRICA =================
  { code: 'MA', name: 'Morocco', continent: 'Africa', col: 9, row: 7, flag: '🇲🇦' },
  { code: 'DZ', name: 'Algeria', continent: 'Africa', col: 10, row: 7, flag: '🇩🇿' },
  { code: 'TN', name: 'Tunisia', continent: 'Africa', col: 11, row: 7, flag: '🇹🇳' },
  { code: 'LY', name: 'Libya', continent: 'Africa', col: 12, row: 7, flag: '🇱🇾' },
  { code: 'EG', name: 'Egypt', continent: 'Africa', col: 13, row: 8, flag: '🇪🇬' },
  { code: 'SD', name: 'Sudan', continent: 'Africa', col: 13, row: 9, flag: '🇸🇩' },
  { code: 'MR', name: 'Mauritania', continent: 'Africa', col: 9, row: 8, flag: '🇲🇷' },
  { code: 'SN', name: 'Senegal', continent: 'Africa', col: 8, row: 8, flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', continent: 'Africa', col: 9, row: 9, flag: '🇲🇱' },
  { code: 'NE', name: 'Niger', continent: 'Africa', col: 10, row: 9, flag: '🇳🇪' },
  { code: 'TD', name: 'Chad', continent: 'Africa', col: 11, row: 9, flag: '🇹🇩' },
  { code: 'NG', name: 'Nigeria', continent: 'Africa', col: 10, row: 10, flag: '🇳🇬' },
  { code: 'GH', name: 'Ghana', continent: 'Africa', col: 9, row: 10, flag: '🇬🇭' },
  { code: 'CI', name: 'Ivory Coast', continent: 'Africa', col: 8, row: 10, flag: '🇨🇮' },
  { code: 'CM', name: 'Cameroon', continent: 'Africa', col: 11, row: 10, flag: '🇨🇲' },
  { code: 'CF', name: 'Central African Rep.', continent: 'Africa', col: 12, row: 10, flag: '🇨🇫' },
  { code: 'SS', name: 'South Sudan', continent: 'Africa', col: 13, row: 10, flag: '🇸🇸' },
  { code: 'ET', name: 'Ethiopia', continent: 'Africa', col: 14, row: 10, flag: '🇪🇹' },
  { code: 'SO', name: 'Somalia', continent: 'Africa', col: 15, row: 10, flag: '🇸🇴' },
  { code: 'UG', name: 'Uganda', continent: 'Africa', col: 13, row: 11, flag: '🇺🇬' },
  { code: 'KE', name: 'Kenya', continent: 'Africa', col: 14, row: 11, flag: '🇰🇪' },
  { code: 'CD', name: 'DR Congo', continent: 'Africa', col: 12, row: 11, flag: '🇨🇩' },
  { code: 'CG', name: 'Congo', continent: 'Africa', col: 11, row: 11, flag: '🇨🇬' },
  { code: 'GA', name: 'Gabon', continent: 'Africa', col: 10, row: 11, flag: '🇬🇦' },
  { code: 'AO', name: 'Angola', continent: 'Africa', col: 11, row: 12, flag: '🇦🇴' },
  { code: 'TZ', name: 'Tanzania', continent: 'Africa', col: 14, row: 12, flag: '🇹🇿' },
  { code: 'ZM', name: 'Zambia', continent: 'Africa', col: 12, row: 12, flag: '🇿🇲' },
  { code: 'MW', name: 'Malawi', continent: 'Africa', col: 13, row: 12, flag: '🇲🇼' },
  { code: 'MZ', name: 'Mozambique', continent: 'Africa', col: 14, row: 13, flag: '🇲🇿' },
  { code: 'ZW', name: 'Zimbabwe', continent: 'Africa', col: 13, row: 13, flag: '🇿🇼' },
  { code: 'BW', name: 'Botswana', continent: 'Africa', col: 12, row: 13, flag: '🇧🇼' },
  { code: 'NA', name: 'Namibia', continent: 'Africa', col: 11, row: 13, flag: '🇳🇦' },
  { code: 'ZA', name: 'South Africa', continent: 'Africa', col: 12, row: 14, flag: '🇿🇦' },
  { code: 'MG', name: 'Madagascar', continent: 'Africa', col: 15, row: 13, flag: '🇲🇬' },

  // ================= MIDDLE EAST =================
  { code: 'TR', name: 'Turkey', continent: 'Asia', col: 16, row: 6, flag: '🇹🇷' },
  { code: 'CY', name: 'Cyprus', continent: 'Europe', col: 16, row: 7, flag: '🇨🇾' },
  { code: 'SY', name: 'Syria', continent: 'Asia', col: 17, row: 7, flag: '🇸🇾' },
  { code: 'LB', name: 'Lebanon', continent: 'Asia', col: 17, row: 8, flag: '🇱🇧' },
  { code: 'IL', name: 'Israel', continent: 'Asia', col: 17, row: 9, flag: '🇮🇱' },
  { code: 'JO', name: 'Jordan', continent: 'Asia', col: 18, row: 9, flag: '🇯🇴' },
  { code: 'IQ', name: 'Iraq', continent: 'Asia', col: 18, row: 7, flag: '🇮🇶' },
  { code: 'GE', name: 'Georgia', continent: 'Asia', col: 17, row: 5, flag: '🇬🇪' },
  { code: 'AM', name: 'Armenia', continent: 'Asia', col: 18, row: 5, flag: '🇦🇲' },
  { code: 'AZ', name: 'Azerbaijan', continent: 'Asia', col: 19, row: 5, flag: '🇦🇿' },
  { code: 'IR', name: 'Iran', continent: 'Asia', col: 19, row: 7, flag: '🇮🇷' },
  { code: 'KW', name: 'Kuwait', continent: 'Asia', col: 19, row: 8, flag: '🇰🇼' },
  { code: 'SA', name: 'Saudi Arabia', continent: 'Asia', col: 18, row: 8, flag: '🇸🇦' },
  { code: 'BH', name: 'Bahrain', continent: 'Asia', col: 19, row: 9, flag: '🇧🇭' },
  { code: 'QA', name: 'Qatar', continent: 'Asia', col: 20, row: 7, flag: '🇶🇦' },
  { code: 'AE', name: 'UAE', continent: 'Asia', col: 20, row: 8, flag: '🇦🇪' },
  { code: 'OM', name: 'Oman', continent: 'Asia', col: 20, row: 9, flag: '🇴🇲' },
  { code: 'YE', name: 'Yemen', continent: 'Asia', col: 19, row: 10, flag: '🇾🇪' },

  // ================= CENTRAL & SOUTH ASIA =================
  { code: 'KZ', name: 'Kazakhstan', continent: 'Asia', col: 18, row: 3, flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan', continent: 'Asia', col: 18, row: 4, flag: '🇺🇿' },
  { code: 'TM', name: 'Turkmenistan', continent: 'Asia', col: 19, row: 6, flag: '🇹🇲' },
  { code: 'KG', name: 'Kyrgyzstan', continent: 'Asia', col: 19, row: 4, flag: '🇰🇬' },
  { code: 'TJ', name: 'Tajikistan', continent: 'Asia', col: 20, row: 5, flag: '🇹🇯' },
  { code: 'AF', name: 'Afghanistan', continent: 'Asia', col: 20, row: 6, flag: '🇦🇫' },
  { code: 'PK', name: 'Pakistan', continent: 'Asia', col: 21, row: 6, flag: '🇵🇰' },
  { code: 'IN', name: 'India', continent: 'Asia', col: 21, row: 7, flag: '🇮🇳' },
  { code: 'NP', name: 'Nepal', continent: 'Asia', col: 22, row: 6, flag: '🇳🇵' },
  { code: 'BD', name: 'Bangladesh', continent: 'Asia', col: 22, row: 7, flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka', continent: 'Asia', col: 21, row: 8, flag: '🇱🇰' },

  // ================= EAST ASIA =================
  { code: 'MN', name: 'Mongolia', continent: 'Asia', col: 22, row: 3, flag: '🇲🇳' },
  { code: 'CN', name: 'China', continent: 'Asia', col: 22, row: 4, flag: '🇨🇳' },
  { code: 'KP', name: 'North Korea', continent: 'Asia', col: 24, row: 3, flag: '🇰🇵' },
  { code: 'KR', name: 'South Korea', continent: 'Asia', col: 24, row: 4, flag: '🇰🇷' },
  { code: 'JP', name: 'Japan', continent: 'Asia', col: 25, row: 4, flag: '🇯🇵' },
  { code: 'HK', name: 'Hong Kong', continent: 'Asia', col: 22, row: 5, flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', continent: 'Asia', col: 24, row: 5, flag: '🇹🇼' },

  // ================= SOUTHEAST ASIA =================
  { code: 'MM', name: 'Myanmar', continent: 'Asia', col: 23, row: 5, flag: '🇲🇲' },
  { code: 'TH', name: 'Thailand', continent: 'Asia', col: 23, row: 6, flag: '🇹🇭' },
  { code: 'LA', name: 'Laos', continent: 'Asia', col: 24, row: 6, flag: '🇱🇦' },
  { code: 'VN', name: 'Vietnam', continent: 'Asia', col: 25, row: 5, flag: '🇻🇳' },
  { code: 'KH', name: 'Cambodia', continent: 'Asia', col: 24, row: 7, flag: '🇰🇭' },
  { code: 'MY', name: 'Malaysia', continent: 'Asia', col: 23, row: 7, flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore', continent: 'Asia', col: 23, row: 8, flag: '🇸🇬' },
  { code: 'ID', name: 'Indonesia', continent: 'Asia', col: 24, row: 8, flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', continent: 'Asia', col: 25, row: 6, flag: '🇵🇭' },

  // ================= OCEANIA =================
  { code: 'PG', name: 'Papua New Guinea', continent: 'Oceania', col: 26, row: 8, flag: '🇵🇬' },
  { code: 'AU', name: 'Australia', continent: 'Oceania', col: 26, row: 9, flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', continent: 'Oceania', col: 28, row: 10, flag: '🇳🇿' },
  { code: 'FJ', name: 'Fiji', continent: 'Oceania', col: 28, row: 9, flag: '🇫🇯' },
]

export const WORLD_HEX_MAP_BY_CODE: Record<string, WorldHexCountry> = WORLD_HEX_COUNTRIES.reduce(
  (acc, c) => {
    acc[c.code] = c
    return acc
  },
  {} as Record<string, WorldHexCountry>
)

/**
 * Calculates (x, y) center coordinate for a flat-topped hexagon at (col, row).
 */
export function calcHexCenter(
  col: number,
  row: number,
  radius: number,
  offsetX = 0,
  offsetY = 0
): { x: number; y: number } {
  const dx = 1.5 * radius
  const dy = Math.sqrt(3) * radius
  const x = col * dx + offsetX
  const y = row * dy + (col % 2 === 1 ? dy / 2 : 0) + offsetY
  return { x, y }
}

/**
 * Generates SVG polygon points string for a flat-topped regular hexagon.
 */
export function getHexagonPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (60 * i * Math.PI) / 180
    const x = (cx + radius * Math.cos(angle)).toFixed(1)
    const y = (cy + radius * Math.sin(angle)).toFixed(1)
    points.push(`${x},${y}`)
  }
  return points.join(' ')
}

/**
 * Calculates quadratic Bézier control point to produce a high, graceful arc
 * between two points (simulating ballistic flight/ping trajectories).
 */
export function calcArcControlPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { cx: number; cy: number } {
  const mx = (x1 + x2) / 2
  const dist = Math.hypot(x2 - x1, y2 - y1)
  const arcHeight = Math.max(60, Math.min(220, dist * 0.5))
  const cy = Math.min(y1, y2) - arcHeight
  return { cx: mx, cy }
}

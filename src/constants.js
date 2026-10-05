export const varieties = [
  'Co 86032 (Nira)',
  'Co 0238',
  'Co 15023',
  'Co 99004',
  'CoC 671',
]

export const soilTypes = [
  'Medium Black Soil (Vertisol)',
  'Deep Black Soil (Vertisol)',
  'Alluvial Soil',
  'Red Loamy Soil',
  'Sandy Loam',
]

export const growthStages = [
  'Germination (0-45 days)',
  'Tillering (46-100 days)',
  'Grand Growth (101-270 days)',
  'Maturity (271-365 days)',
]

export const locationSuggestions = [
  'Taluka Karad, Satara District, Maharashtra',
  'Karad, Satara, Maharashtra',
  'Koregaon, Satara, Maharashtra',
  'Phaltan, Satara, Maharashtra',
  'Wai, Satara, Maharashtra',
  'Miraj, Sangli, Maharashtra',
  'Tasgaon, Sangli, Maharashtra',
  'Hatkanangale, Kolhapur, Maharashtra',
  'Shirol, Kolhapur, Maharashtra',
  'Baramati, Pune, Maharashtra',
  'Indapur, Pune, Maharashtra',
  'Pandharpur, Solapur, Maharashtra',
  'Malshiras, Solapur, Maharashtra',
  'Shrirampur, Ahmednagar, Maharashtra',
  'Kopargaon, Ahmednagar, Maharashtra',
  'Niphad, Nashik, Maharashtra',
  'Malegaon, Nashik, Maharashtra',
  'Jalna, Maharashtra',
  'Latur, Maharashtra',
  'Nanded, Maharashtra',
]

export const demoRecord = {
  farm_name: 'Sugarcane Farm - Plot A',
  location: 'Taluka Karad, Satara District, Maharashtra',
  area: '2.0',
  sugarcane_variety: 'Co 86032 (Nira)',
  soil_type: 'Medium Black Soil (Vertisol)',
  plantation_date: '2026-05-10',
  growth_stage: 'Grand Growth (101-270 days)',
}

export const emptyRecord = {
  farm_name: '',
  location: '',
  area: '',
  sugarcane_variety: '',
  soil_type: '',
  plantation_date: '',
  growth_stage: '',
}

export const shortStage = (stage = '') => stage.split(' (')[0]

export const formatDate = (value) => {
  if (!value) return 'Not available'
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

export const formatTimestamp = (value) => {
  if (!value) return 'Not available'
  const normalized = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(normalized))
}

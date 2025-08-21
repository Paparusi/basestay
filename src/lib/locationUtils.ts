// Location search utilities for smart property matching

export interface LocationData {
  city: string
  district: string
  ward?: string
  country: string
  coordinates?: {
    lat: number
    lng: number
  }
}

// Vietnam cities and districts mapping
export const VIETNAM_LOCATIONS = {
  'ho-chi-minh': {
    city: 'Ho Chi Minh City',
    aliases: ['saigon', 'hcmc', 'tp hcm', 'thanh pho ho chi minh', 'ho chi minh city'],
    districts: [
      'District 1', 'District 2', 'District 3', 'District 4', 'District 5',
      'District 6', 'District 7', 'District 8', 'District 9', 'District 10',
      'District 11', 'District 12', 'Binh Thanh', 'Go Vap', 'Phu Nhuan',
      'Tan Binh', 'Tan Phu', 'Thu Duc', 'Binh Tan', 'Cu Chi',
      'Can Gio', 'Hoc Mon', 'Nha Be'
    ]
  },
  'hanoi': {
    city: 'Hanoi',
    aliases: ['ha noi', 'capital', 'thu do'],
    districts: [
      'Hoan Kiem', 'Ba Dinh', 'Dong Da', 'Hai Ba Trung', 'Cau Giay',
      'Tay Ho', 'Thanh Xuan', 'Hoang Mai', 'Long Bien', 'Nam Tu Liem',
      'Bac Tu Liem', 'Ha Dong', 'Son Tay', 'Ba Vi', 'Chuong My',
      'Dan Phuong', 'Dong Anh', 'Gia Lam', 'Hoai Duc', 'Me Linh',
      'My Duc', 'Phu Xuyen', 'Phuc Tho', 'Quoc Oai', 'Soc Son',
      'Thach That', 'Thanh Oai', 'Thanh Tri', 'Thuong Tin', 'Ung Hoa'
    ]
  },
  'da-nang': {
    city: 'Da Nang',
    aliases: ['danang'],
    districts: [
      'Hai Chau', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son', 
      'Lien Chieu', 'Cam Le', 'Hoa Vang'
    ]
  }
}

// Normalize Vietnamese text (remove accents, standardize)
export function normalizeVietnameseText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Smart Vietnamese text matching
export function vietnameseTextContains(haystack: string, needle: string): boolean {
  const normalizedHaystack = normalizeVietnameseText(haystack)
  const normalizedNeedle = normalizeVietnameseText(needle)
  
  // Direct match first
  if (normalizedHaystack.includes(normalizedNeedle)) {
    return true
  }
  
  // Word-by-word match for better accuracy
  const needleWords = normalizedNeedle.split(' ').filter(w => w.length > 1)
  const haystackWords = normalizedHaystack.split(' ')
  
  return needleWords.every(needleWord => 
    haystackWords.some(haystackWord => 
      haystackWord.includes(needleWord) || needleWord.includes(haystackWord)
    )
  )
}

// Extract location components from search string
export function parseLocationSearch(searchText: string): {
  city?: string
  district?: string
  keywords: string[]
  confidence: number
} {
  const normalized = normalizeVietnameseText(searchText)
  const words = normalized.split(' ').filter(word => word.length > 1)
  
  let city: string | undefined
  let district: string | undefined
  let confidence = 0
  
  // Try to match city
  for (const [key, locationData] of Object.entries(VIETNAM_LOCATIONS)) {
    const cityName = normalizeVietnameseText(locationData.city)
    const aliases = locationData.aliases.map(alias => normalizeVietnameseText(alias))
    
    // Check direct city match
    if (normalized.includes(cityName)) {
      city = locationData.city
      confidence += 50
      break
    }
    
    // Check aliases
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        city = locationData.city
        confidence += 40
        break
      }
    }
    
    if (city) break
  }
  
  // Try to match district if city is found
  if (city) {
    const locationKey = Object.keys(VIETNAM_LOCATIONS).find(
      key => VIETNAM_LOCATIONS[key as keyof typeof VIETNAM_LOCATIONS].city === city
    )
    
    if (locationKey) {
      const districts = VIETNAM_LOCATIONS[locationKey as keyof typeof VIETNAM_LOCATIONS].districts
      
      for (const dist of districts) {
        const normalizedDistrict = normalizeVietnameseText(dist)
        if (normalized.includes(normalizedDistrict)) {
          district = dist
          confidence += 30
          break
        }
        
        // Try partial matches for districts
        const districtWords = normalizedDistrict.split(' ')
        const matchCount = districtWords.filter(word => normalized.includes(word)).length
        if (matchCount > 0 && matchCount / districtWords.length >= 0.5) {
          district = dist
          confidence += 20
          break
        }
      }
    }
  }
  
  return {
    city,
    district,
    keywords: words,
    confidence
  }
}

// Generate smart search queries for Prisma with Vietnamese support
export function buildSmartLocationQuery(searchText: string) {
  if (!searchText.trim()) return {}
  
  // Parse location with Vietnamese support
  const parsed = parseLocationSearch(searchText)
  const queries = []
  
  // Create flexible search terms
  const searchTerms = []
  
  // Original search term
  searchTerms.push(searchText.trim())
  
  // Normalized search term
  const normalized = normalizeVietnameseText(searchText)
  if (normalized !== searchText.toLowerCase().trim()) {
    searchTerms.push(normalized)
  }
  
  // Add individual words from search
  const words = searchText.trim().split(/\s+/).filter(word => word.length > 1)
  searchTerms.push(...words)
  
  // Add normalized words
  const normalizedWords = normalized.split(/\s+/).filter(word => word.length > 1)
  searchTerms.push(...normalizedWords)
  
  // Remove duplicates
  const uniqueTerms = [...new Set(searchTerms)]
  
  // Create OR query for all terms
  if (uniqueTerms.length > 0) {
    queries.push({
      OR: uniqueTerms.map(term => ({
        location: { contains: term }
      }))
    })
  }
  
  // Fallback: simple contains
  if (queries.length === 0) {
    queries.push({
      location: { contains: searchText }
    })
  }
  
  return queries.length === 1 ? queries[0] : { OR: queries }
}

// Get popular locations for suggestions
export function getLocationSuggestions(searchText?: string): string[] {
  const suggestions = []
  
  // Add popular Vietnamese cities
  for (const locationData of Object.values(VIETNAM_LOCATIONS)) {
    suggestions.push(locationData.city)
    
    // Add some popular districts
    const popularDistricts = locationData.districts.slice(0, 3)
    for (const district of popularDistricts) {
      suggestions.push(`${district}, ${locationData.city}`)
    }
  }
  
  // If search text provided, filter relevant suggestions
  if (searchText) {
    const normalized = normalizeVietnameseText(searchText)
    return suggestions.filter(suggestion => {
      const normalizedSuggestion = normalizeVietnameseText(suggestion)
      return normalizedSuggestion.includes(normalized) || 
             normalized.split(' ').some(word => normalizedSuggestion.includes(word))
    }).slice(0, 10)
  }
  
  return suggestions.slice(0, 10)
}

// Calculate distance between two locations (if coordinates available)
export function calculateDistance(
  lat1: number, lng1: number, 
  lat2: number, lng2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

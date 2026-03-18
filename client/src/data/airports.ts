export interface AirportOption {
  code: string;       // IATA code, e.g. "HAN"
  city: string;       // Display city name (có dấu), e.g. "Hà Nội"
  airport: string;    // Airport name (có dấu), e.g. "Nội Bài"
  country: string;    // e.g. "Việt Nam"
  normalized: string; // Pre-computed search string (no diacritics), e.g. "ha noi noi bai han"
}

function n(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase();
}

function makeNorm(...parts: string[]): string {
  return parts.map(n).join(" ");
}

export const AIRPORTS: AirportOption[] = [
  // ── Việt Nam ──────────────────────────────────────────────────────────────
  { code: "SGN", city: "TP Hồ Chí Minh", airport: "Tân Sơn Nhất",     country: "Việt Nam", normalized: makeNorm("TP Hồ Chí Minh", "Tân Sơn Nhất", "SGN", "TPHCM", "Sài Gòn") },
  { code: "HAN", city: "Hà Nội",          airport: "Nội Bài",           country: "Việt Nam", normalized: makeNorm("Hà Nội", "Nội Bài", "HAN") },
  { code: "DAD", city: "Đà Nẵng",         airport: "Đà Nẵng",           country: "Việt Nam", normalized: makeNorm("Đà Nẵng", "DAD") },
  { code: "CXR", city: "Nha Trang",       airport: "Cam Ranh",          country: "Việt Nam", normalized: makeNorm("Nha Trang", "Cam Ranh", "CXR") },
  { code: "PQC", city: "Phú Quốc",        airport: "Phú Quốc",          country: "Việt Nam", normalized: makeNorm("Phú Quốc", "PQC") },
  { code: "VCA", city: "Cần Thơ",         airport: "Cần Thơ",           country: "Việt Nam", normalized: makeNorm("Cần Thơ", "VCA") },
  { code: "HUI", city: "Huế",             airport: "Phú Bài",           country: "Việt Nam", normalized: makeNorm("Huế", "Phú Bài", "HUI") },
  { code: "UIH", city: "Quy Nhơn",        airport: "Phù Cát",           country: "Việt Nam", normalized: makeNorm("Quy Nhơn", "Phù Cát", "UIH") },
  { code: "DIN", city: "Điện Biên",       airport: "Điện Biên Phủ",     country: "Việt Nam", normalized: makeNorm("Điện Biên", "Điện Biên Phủ", "DIN") },
  { code: "VDH", city: "Đồng Hới",        airport: "Đồng Hới",          country: "Việt Nam", normalized: makeNorm("Đồng Hới", "Quảng Bình", "VDH") },
  { code: "VII", city: "Vinh",            airport: "Vinh",              country: "Việt Nam", normalized: makeNorm("Vinh", "Nghệ An", "VII") },
  { code: "BMV", city: "Buôn Ma Thuột",   airport: "Buôn Ma Thuột",     country: "Việt Nam", normalized: makeNorm("Buôn Ma Thuột", "BMV", "Daklak", "Đắk Lắk") },
  { code: "DLI", city: "Đà Lạt",          airport: "Liên Khương",       country: "Việt Nam", normalized: makeNorm("Đà Lạt", "Liên Khương", "Lâm Đồng", "DLI") },
  { code: "VCL", city: "Chu Lai",         airport: "Chu Lai",           country: "Việt Nam", normalized: makeNorm("Chu Lai", "Quảng Nam", "VCL") },
  { code: "TBB", city: "Tuy Hòa",         airport: "Đông Tác",          country: "Việt Nam", normalized: makeNorm("Tuy Hòa", "Phú Yên", "Đông Tác", "TBB") },
  { code: "HPH", city: "Hải Phòng",       airport: "Cát Bi",            country: "Việt Nam", normalized: makeNorm("Hải Phòng", "Cát Bi", "HPH") },
  { code: "VDO", city: "Vân Đồn",         airport: "Vân Đồn",           country: "Việt Nam", normalized: makeNorm("Vân Đồn", "Quảng Ninh", "VDO") },
  { code: "THD", city: "Thanh Hóa",       airport: "Thọ Xuân",          country: "Việt Nam", normalized: makeNorm("Thanh Hóa", "Thọ Xuân", "THD") },
  { code: "VCS", city: "Côn Đảo",         airport: "Côn Đảo",           country: "Việt Nam", normalized: makeNorm("Côn Đảo", "VCS") },
  { code: "VKG", city: "Rạch Giá",        airport: "Rạch Giá",          country: "Việt Nam", normalized: makeNorm("Rạch Giá", "Kiên Giang", "VKG") },
  { code: "CAH", city: "Cà Mau",          airport: "Cà Mau",            country: "Việt Nam", normalized: makeNorm("Cà Mau", "CAH") },
  { code: "KON", city: "Kon Tum",         airport: "Kon Tum",           country: "Việt Nam", normalized: makeNorm("Kon Tum", "KON") },

  // ── Đông Nam Á ─────────────────────────────────────────────────────────────
  { code: "BKK", city: "Bangkok",    airport: "Suvarnabhumi",   country: "Thái Lan",    normalized: makeNorm("Bangkok", "Suvarnabhumi", "BKK", "Thai Lan") },
  { code: "DMK", city: "Bangkok",    airport: "Don Mueang",     country: "Thái Lan",    normalized: makeNorm("Bangkok", "Don Mueang", "DMK", "Thai Lan") },
  { code: "SIN", city: "Singapore",  airport: "Changi",         country: "Singapore",   normalized: makeNorm("Singapore", "Changi", "SIN") },
  { code: "KUL", city: "Kuala Lumpur", airport: "KLIA",         country: "Malaysia",    normalized: makeNorm("Kuala Lumpur", "KLIA", "KUL", "Malaysia") },
  { code: "PEN", city: "Penang",     airport: "Penang",         country: "Malaysia",    normalized: makeNorm("Penang", "PEN", "Malaysia") },
  { code: "CGK", city: "Jakarta",    airport: "Soekarno–Hatta", country: "Indonesia",   normalized: makeNorm("Jakarta", "Soekarno", "CGK", "Indonesia") },
  { code: "DPS", city: "Bali",       airport: "Ngurah Rai",     country: "Indonesia",   normalized: makeNorm("Bali", "Ngurah Rai", "DPS", "Indonesia") },
  { code: "MNL", city: "Manila",     airport: "Ninoy Aquino",   country: "Philippines", normalized: makeNorm("Manila", "Ninoy Aquino", "MNL", "Philippines") },
  { code: "RGN", city: "Yangon",     airport: "Yangon",         country: "Myanmar",     normalized: makeNorm("Yangon", "Rangoon", "RGN", "Myanmar") },
  { code: "PNH", city: "Phnom Penh", airport: "Phnom Penh",     country: "Campuchia",   normalized: makeNorm("Phnom Penh", "PNH", "Campuchia", "Cambodia") },
  { code: "VTE", city: "Vientiane",  airport: "Wattay",         country: "Lào",         normalized: makeNorm("Vientiane", "Wattay", "VTE", "Lao") },

  // ── Đông Bắc Á ─────────────────────────────────────────────────────────────
  { code: "NRT", city: "Tokyo",      airport: "Narita",         country: "Nhật Bản",    normalized: makeNorm("Tokyo", "Narita", "NRT", "Nhat Ban", "Japan") },
  { code: "HND", city: "Tokyo",      airport: "Haneda",         country: "Nhật Bản",    normalized: makeNorm("Tokyo", "Haneda", "HND", "Nhat Ban", "Japan") },
  { code: "KIX", city: "Osaka",      airport: "Kansai",         country: "Nhật Bản",    normalized: makeNorm("Osaka", "Kansai", "KIX", "Nhat Ban", "Japan") },
  { code: "ICN", city: "Seoul",      airport: "Incheon",        country: "Hàn Quốc",    normalized: makeNorm("Seoul", "Incheon", "ICN", "Han Quoc", "Korea") },
  { code: "GMP", city: "Seoul",      airport: "Gimpo",          country: "Hàn Quốc",    normalized: makeNorm("Seoul", "Gimpo", "GMP", "Han Quoc", "Korea") },
  { code: "PEK", city: "Bắc Kinh",   airport: "Capital",        country: "Trung Quốc",  normalized: makeNorm("Bắc Kinh", "Beijing", "Capital", "PEK", "Trung Quoc", "China") },
  { code: "PKX", city: "Bắc Kinh",   airport: "Daxing",         country: "Trung Quốc",  normalized: makeNorm("Bắc Kinh", "Beijing", "Daxing", "PKX", "Trung Quoc") },
  { code: "PVG", city: "Thượng Hải", airport: "Pudong",         country: "Trung Quốc",  normalized: makeNorm("Thượng Hải", "Shanghai", "Pudong", "PVG", "Trung Quoc") },
  { code: "CAN", city: "Quảng Châu", airport: "Baiyun",         country: "Trung Quốc",  normalized: makeNorm("Quảng Châu", "Guangzhou", "Baiyun", "CAN", "Trung Quoc") },
  { code: "HKG", city: "Hong Kong",  airport: "Hong Kong",      country: "Hong Kong",   normalized: makeNorm("Hong Kong", "HKG") },
  { code: "TPE", city: "Đài Bắc",    airport: "Taoyuan",        country: "Đài Loan",    normalized: makeNorm("Đài Bắc", "Taipei", "Taoyuan", "TPE", "Dai Loan", "Taiwan") },

  // ── Nam Á & Trung Đông ──────────────────────────────────────────────────────
  { code: "DXB", city: "Dubai",      airport: "Dubai",          country: "UAE",         normalized: makeNorm("Dubai", "DXB", "UAE") },
  { code: "DOH", city: "Doha",       airport: "Hamad",          country: "Qatar",       normalized: makeNorm("Doha", "Hamad", "DOH", "Qatar") },
  { code: "AUH", city: "Abu Dhabi",  airport: "Zayed",          country: "UAE",         normalized: makeNorm("Abu Dhabi", "Zayed", "AUH", "UAE") },
  { code: "BOM", city: "Mumbai",     airport: "Chhatrapati Shivaji", country: "Ấn Độ",  normalized: makeNorm("Mumbai", "Bombay", "BOM", "An Do", "India") },
  { code: "DEL", city: "New Delhi",  airport: "Indira Gandhi",  country: "Ấn Độ",       normalized: makeNorm("New Delhi", "Delhi", "Indira Gandhi", "DEL", "An Do", "India") },

  // ── Úc & Châu Đại Dương ─────────────────────────────────────────────────────
  { code: "SYD", city: "Sydney",     airport: "Kingsford Smith", country: "Úc",         normalized: makeNorm("Sydney", "Kingsford", "SYD", "Australia", "Uc") },
  { code: "MEL", city: "Melbourne",  airport: "Tullamarine",    country: "Úc",          normalized: makeNorm("Melbourne", "Tullamarine", "MEL", "Australia", "Uc") },

  // ── Châu Âu ─────────────────────────────────────────────────────────────────
  { code: "LHR", city: "London",     airport: "Heathrow",       country: "Anh",         normalized: makeNorm("London", "Heathrow", "LHR", "UK", "Anh") },
  { code: "CDG", city: "Paris",      airport: "Charles de Gaulle", country: "Pháp",     normalized: makeNorm("Paris", "Charles de Gaulle", "CDG", "Phap", "France") },
  { code: "FRA", city: "Frankfurt",  airport: "Frankfurt",      country: "Đức",         normalized: makeNorm("Frankfurt", "FRA", "Duc", "Germany") },
  { code: "AMS", city: "Amsterdam",  airport: "Schiphol",       country: "Hà Lan",      normalized: makeNorm("Amsterdam", "Schiphol", "AMS", "Ha Lan", "Netherlands") },

  // ── Châu Mỹ ─────────────────────────────────────────────────────────────────
  { code: "LAX", city: "Los Angeles", airport: "LAX",           country: "Mỹ",          normalized: makeNorm("Los Angeles", "LAX", "My", "USA") },
  { code: "SFO", city: "San Francisco", airport: "SFO",         country: "Mỹ",          normalized: makeNorm("San Francisco", "SFO", "My", "USA") },
  { code: "JFK", city: "New York",   airport: "John F. Kennedy", country: "Mỹ",         normalized: makeNorm("New York", "Kennedy", "JFK", "My", "USA") },
];

/** Normalize a query string for comparison */
export function normalizeQuery(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

/** Filter airports by query, returns up to `limit` results */
export function filterAirports(query: string, limit = 8): AirportOption[] {
  if (!query) return AIRPORTS.slice(0, limit);
  const q = normalizeQuery(query);
  return AIRPORTS.filter((a) => a.normalized.includes(q)).slice(0, limit);
}

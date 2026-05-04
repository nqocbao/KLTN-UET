type UnknownRecord = Record<string, unknown>;

export interface FacebookFoodPost {
  url?: string;
  legacyId?: string;
  text?: string;
  time?: string;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  topReactionsCount?: number;
  reactionLikeCount?: number;
  reactionLoveCount?: number;
  groupTitle?: string;
  facebookId?: string;
  inputUrl?: string;
  attachments?: unknown[];
  user?: {
    id?: string;
    name?: string;
  };
}

export interface NormalizedFoodReviewInput {
  title: string;
  summary: string;
  content: string;
  area: {
    city: string;
    district: string | null;
    ward: string | null;
    addressText: string | null;
  };
  dishTags: string[];
  hashtags: string[];
  contactPhones: string[];
  priceMin: number | null;
  priceMax: number | null;
  imageUrls: string[];
  postedAt: Date | null;
  engagement: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    reactionsCount: number;
    score: number;
  };
  source: {
    platform: "facebook";
    groupTitle: string | null;
    groupId: string | null;
    postUrl: string;
    postLegacyId: string | null;
    rawInputUrl: string | null;
    authorName: string | null;
    authorId: string | null;
  };
  isActive: boolean;
  rawPayload: unknown;
}

const UNKNOWN_CITY_LABEL = "Chưa xác định";

interface CityConfig {
  label: string;
  aliases: string[];
  districtAliases: Array<{ key: string; label: string }>;
}

const CITY_CONFIGS: CityConfig[] = [
  {
    label: "Hà Nội",
    aliases: ["ha noi", "hanoi"],
    districtAliases: [
      { key: "hoan kiem", label: "Hoàn Kiếm" },
      { key: "ba dinh", label: "Ba Đình" },
      { key: "tay ho", label: "Tây Hồ" },
      { key: "dong da", label: "Đống Đa" },
      { key: "cau giay", label: "Cầu Giấy" },
      { key: "hai ba trung", label: "Hai Bà Trưng" },
      { key: "hoang mai", label: "Hoàng Mai" },
      { key: "thanh xuan", label: "Thanh Xuân" },
      { key: "long bien", label: "Long Biên" },
      { key: "ha dong", label: "Hà Đông" },
      { key: "bac tu liem", label: "Bắc Từ Liêm" },
      { key: "nam tu liem", label: "Nam Từ Liêm" },
      { key: "dong anh", label: "Đông Anh" },
      { key: "soc son", label: "Sóc Sơn" },
      { key: "gia lam", label: "Gia Lâm" },
      { key: "thanh tri", label: "Thanh Trì" },
      { key: "thuong tin", label: "Thường Tín" },
      { key: "hoai duc", label: "Hoài Đức" },
      { key: "dan phuong", label: "Đan Phượng" },
      { key: "quoc oai", label: "Quốc Oai" },
      { key: "thach that", label: "Thạch Thất" },
      { key: "chuong my", label: "Chương Mỹ" },
      { key: "my duc", label: "Mỹ Đức" },
    ],
  },
  {
    label: "Hồ Chí Minh",
    aliases: ["ho chi minh", "tp ho chi minh", "tphcm", "tp hcm", "sai gon", "saigon"],
    districtAliases: [
      { key: "quan 1", label: "Quận 1" },
      { key: "quan 3", label: "Quận 3" },
      { key: "quan 5", label: "Quận 5" },
      { key: "quan 7", label: "Quận 7" },
      { key: "quan 10", label: "Quận 10" },
      { key: "binh thanh", label: "Bình Thạnh" },
      { key: "phu nhuan", label: "Phú Nhuận" },
      { key: "tan binh", label: "Tân Bình" },
      { key: "go vap", label: "Gò Vấp" },
      { key: "thu duc", label: "Thủ Đức" },
    ],
  },
  {
    label: "Đà Nẵng",
    aliases: ["da nang", "danang"],
    districtAliases: [
      { key: "hai chau", label: "Hải Châu" },
      { key: "son tra", label: "Sơn Trà" },
      { key: "ngu hanh son", label: "Ngũ Hành Sơn" },
      { key: "lien chieu", label: "Liên Chiểu" },
      { key: "thanh khe", label: "Thanh Khê" },
      { key: "cam le", label: "Cẩm Lệ" },
      { key: "hoa vang", label: "Hòa Vang" },
    ],
  },
  {
    label: "Hải Phòng",
    aliases: ["hai phong", "haiphong"],
    districtAliases: [
      { key: "hong bang", label: "Hồng Bàng" },
      { key: "ngo quyen", label: "Ngô Quyền" },
      { key: "le chan", label: "Lê Chân" },
      { key: "hai an", label: "Hải An" },
      { key: "kien an", label: "Kiến An" },
      { key: "do son", label: "Đồ Sơn" },
    ],
  },
  {
    label: "Cần Thơ",
    aliases: ["can tho", "cantho"],
    districtAliases: [
      { key: "ninh kieu", label: "Ninh Kiều" },
      { key: "cai rang", label: "Cái Răng" },
      { key: "binh thuy", label: "Bình Thủy" },
      { key: "o mon", label: "Ô Môn" },
      { key: "thot not", label: "Thốt Nốt" },
    ],
  },
  {
    label: "Thừa Thiên Huế",
    aliases: ["hue", "thua thien hue"],
    districtAliases: [
      { key: "vinh ninh", label: "Vĩnh Ninh" },
      { key: "phu hoi", label: "Phú Hội" },
      { key: "phu nhuan", label: "Phú Nhuận" },
    ],
  },
  {
    label: "Khánh Hòa",
    aliases: ["khanh hoa", "nha trang"],
    districtAliases: [
      { key: "nha trang", label: "Nha Trang" },
      { key: "loc tho", label: "Lộc Thọ" },
      { key: "vinh nguyen", label: "Vĩnh Nguyên" },
    ],
  },
  {
    label: "Lâm Đồng",
    aliases: ["lam dong", "da lat", "dalat"],
    districtAliases: [
      { key: "da lat", label: "Đà Lạt" },
      { key: "phuong 1", label: "Phường 1" },
      { key: "phuong 2", label: "Phường 2" },
      { key: "phuong 3", label: "Phường 3" },
    ],
  },
  {
    label: "Quảng Ninh",
    aliases: ["quang ninh", "ha long", "halong"],
    districtAliases: [
      { key: "ha long", label: "Hạ Long" },
      { key: "bai chay", label: "Bãi Cháy" },
      { key: "hong gai", label: "Hồng Gai" },
    ],
  },
  {
    label: "Kiên Giang",
    aliases: ["kien giang", "phu quoc", "phuquoc"],
    districtAliases: [
      { key: "phu quoc", label: "Phú Quốc" },
      { key: "duong dong", label: "Dương Đông" },
      { key: "an thoi", label: "An Thới" },
    ],
  },
];

const NORMALIZED_CITY_ALIASES = CITY_CONFIGS.flatMap((city) => city.aliases);

const DISH_KEYWORDS = [
  "pho",
  "bun",
  "bun cha",
  "bun rieu",
  "bun dau",
  "mi van than",
  "com tam",
  "com ga",
  "banh mi",
  "banh cuon",
  "banh xeo",
  "nom",
  "lau",
  "nuong",
  "oc",
  "che",
  "tra sua",
  "ca phe",
  "nem",
  "xoi",
  "chao",
  "goi",
  "sua chua",
  "hai san",
  "vit quay",
  "thit nuong",
  "chan ga",
  "chan sua",
];

const TITLE_NOISE_PREFIXES = [
  "hom nay",
  "hay",
  "moi",
  "dia chi",
  "dien thoai",
  "lien he",
  "review",
  "gia",
];

const ADDRESS_CONTEXT_KEYWORDS = [
  "quan",
  "huyen",
  "phuong",
  "xa",
  "duong",
  "street",
  "district",
  "ward",
  "thanh pho",
  "tp",
  "city",
  "thi tran",
  "thi xa",
];

const ADDRESS_PREFIX_HINTS = [
  "co so",
  "cs",
  "chi nhanh",
  "cn",
  "branch",
  "so nha",
  "ngo",
  "ngach",
  "hem",
  "kios",
  "ki ot",
];

function normalizeText(value: string): string {
  const noAccents = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");

  return noAccents.toLowerCase();
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((item) => item.trim().length > 0))];
}

function cleanInlineText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripLeadingBullet(value: string): string {
  return value.replace(/^[\s•·\-*–—|>]+/u, "").trim();
}

function normalizeCompactText(value: string): string {
  return normalizeText(value).replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
}

function sanitizeTitleCandidate(value: string): string {
  return cleanInlineText(
    value
      .replace(/^["'“”‘’`]+/u, "")
      .replace(/["'“”‘’`]+$/u, "")
      .replace(/\s*[-–—|:,;]+\s*$/u, "")
  );
}

function isLikelyBusinessTitle(value: string): boolean {
  const candidate = sanitizeTitleCandidate(value);
  if (candidate.length < 4 || candidate.length > 120) {
    return false;
  }

  if (candidate.includes("http://") || candidate.includes("https://")) {
    return false;
  }

  const normalized = normalizeCompactText(candidate);
  if (!normalized) {
    return false;
  }

  if (TITLE_NOISE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }

  const words = candidate.split(/\s+/).filter(Boolean);
  if (words.length > 18) {
    return false;
  }

  const letters = candidate.match(/\p{L}/gu);
  return Boolean(letters && letters.length >= 3);
}

function extractTitleFromLine(line: string): string | null {
  const cleanedLine = stripLeadingBullet(cleanInlineText(line));
  if (!cleanedLine) {
    return null;
  }

  if (/^(?:📍|📌)?\s*(?:địa\s*chỉ|dia\s*chi|điện\s*thoại|dien\s*thoai|sdt|phone)\b/iu.test(cleanedLine)) {
    return null;
  }

  const patterns = [
    /^(.{4,140}?)\s+(?:là|la)(?=\s|$|[,.!?:;])/iu,
    /^(.{4,140}?)\s*,\s*(?:tọa\s*lạc\s*(?:tại|ở)|toa\s*lac\s*(?:tai|o)|nằm\s*(?:tại|ở)|nam\s*(?:tai|o))(?=\s|$|[,.!?:;])/iu,
    /^(.{4,140}?)\s+(?:tọa\s*lạc\s*(?:tại|ở)|toa\s*lac\s*(?:tai|o)|nằm\s*(?:tại|ở)|nam\s*(?:tai|o))(?=\s|$|[,.!?:;])/iu,
  ];

  for (const pattern of patterns) {
    const match = cleanedLine.match(pattern);
    const candidate = match?.[1] ? sanitizeTitleCandidate(match[1]) : "";
    if (candidate && isLikelyBusinessTitle(candidate)) {
      return candidate;
    }
  }

  const shortLine = sanitizeTitleCandidate(cleanedLine);
  if (shortLine.length <= 90 && isLikelyBusinessTitle(shortLine)) {
    return shortLine;
  }

  return null;
}

function sanitizeAddressCandidate(value: string): string {
  let address = cleanInlineText(stripLeadingBullet(value));

  address = address
    .replace(/^(?:📍|📌)?\s*(?:địa\s*chỉ|dia\s*chi)\s*[:：-]?\s*/iu, "")
    .replace(/\s*(?:📞|☎|📱).*/u, "")
    .replace(/\s*(?:\||-)?\s*(?:điện\s*thoại|dien\s*thoai|sdt|phone)\b.*$/iu, "")
    .replace(/\s*,?\s*(?:chỉ|chi|cách|cach|gần|gan)\b.*$/iu, "")
    .replace(/[.;\s]+$/u, "");

  return cleanInlineText(address);
}

function hasAdditionalSpecificLocationDetail(normalized: string, value: string): boolean {
  const inferredArea = inferArea(value);
  if (!inferredArea.district || inferredArea.city === UNKNOWN_CITY_LABEL) {
    return false;
  }

  let remainder = normalized;
  const matchedCity = CITY_CONFIGS.find((city) => city.label === inferredArea.city);
  const removableTokens = [
    normalizeCompactText(inferredArea.district),
    normalizeCompactText(inferredArea.city),
    ...(matchedCity?.aliases || []).map((alias) => normalizeCompactText(alias)),
  ].filter(Boolean);

  for (const token of removableTokens) {
    remainder = remainder.replace(token, " ").trim();
  }

  return remainder.replace(/\s+/g, " ").trim().length > 0;
}

function isLikelyAddress(value: string): boolean {
  const candidate = sanitizeAddressCandidate(value);
  if (!candidate || candidate.length < 8 || candidate.length > 220) {
    return false;
  }

  const normalized = normalizeCompactText(candidate);
  const hasStreetNumber = /\b\d{1,5}[a-z]?\b/i.test(candidate);
  const hasContextKeyword = ADDRESS_CONTEXT_KEYWORDS.some((keyword) =>
    normalized.includes(keyword)
  );
  const hasKnownCity = NORMALIZED_CITY_ALIASES.some((alias) => normalized.includes(alias));
  const hasSpecificAreaDetail = hasAdditionalSpecificLocationDetail(normalized, candidate);

  return (
    (hasStreetNumber && (hasContextKeyword || hasKnownCity)) ||
    (hasContextKeyword && hasKnownCity) ||
    (hasKnownCity && hasSpecificAreaDetail)
  );
}

function isLikelyAddressPrefixFragment(value: string): boolean {
  const candidate = sanitizeAddressCandidate(value);
  if (!candidate || candidate.length < 3 || candidate.length > 80) {
    return false;
  }

  const normalized = normalizeCompactText(candidate);
  if (!normalized) {
    return false;
  }

  if (NORMALIZED_CITY_ALIASES.some((alias) => normalized.includes(alias))) {
    return false;
  }

  if (ADDRESS_CONTEXT_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return false;
  }

  const hasDigit = /\b\d{1,5}[a-z]?\b/i.test(candidate);
  const hasPrefixHint = ADDRESS_PREFIX_HINTS.some((hint) => normalized.includes(hint));

  return hasDigit || hasPrefixHint;
}

function mergeAddressFragments(...parts: Array<string | null | undefined>): string {
  const merged = parts
    .map((part) => sanitizeAddressCandidate(part || ""))
    .filter(Boolean)
    .join(", ");

  return sanitizeAddressCandidate(merged);
}

function extractHashtags(text: string): string[] {
  const tags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
  return uniqueStrings(tags.map((tag) => tag.slice(1).toLowerCase()));
}

function extractPhones(text: string): string[] {
  const candidates = text.match(/(?:\+?84|0)(?:\d[\s\-.]?){8,10}\d/g) || [];
  return uniqueStrings(
    candidates
      .map((value) => value.replace(/[^0-9+]/g, ""))
      .map((value) => {
        if (value.startsWith("+84")) {
          return `0${value.slice(3)}`;
        }
        if (value.startsWith("84") && value.length >= 10) {
          return `0${value.slice(2)}`;
        }
        return value;
      })
      .filter((value) => /^0\d{9,10}$/.test(value))
  );
}

function parsePriceToken(amountRaw: string, unitRaw: string): number | null {
  const unit = unitRaw.toLowerCase();
  const amount = Number(amountRaw.replace(/,/g, "."));
  if (!Number.isFinite(amount)) {
    return null;
  }

  if (unit === "k" || unit.includes("nghin") || unit.includes("ngàn")) {
    return Math.round(amount * 1000);
  }

  if (unit === "tr" || unit.includes("trieu") || unit === "m") {
    return Math.round(amount * 1_000_000);
  }

  if (unit.includes("vnd") || unit.includes("đ")) {
    if (amount >= 1000) {
      return Math.round(amount);
    }
  }

  return null;
}

function extractPriceRangeVnd(text: string): { min: number | null; max: number | null } {
  const normalized = normalizeText(text);
  const matches = [...normalized.matchAll(/(\d{1,3}(?:[.,]\d{1,2})?)\s*(k|nghin|ngan|tr|trieu|m|vnd|đ)/g)];
  const values: number[] = [];

  for (const match of matches) {
    const amount = match[1];
    const unit = match[2];
    if (!amount || !unit) {
      continue;
    }

    const parsed = parsePriceToken(amount, unit);
    if (parsed !== null && parsed >= 5_000 && parsed <= 10_000_000) {
      values.push(parsed);
    }
  }

  if (values.length === 0) {
    return { min: null, max: null };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

function detectCityConfig(normalized: string): CityConfig | null {
  for (const city of CITY_CONFIGS) {
    if (city.aliases.some((alias) => normalized.includes(alias))) {
      return city;
    }
  }

  return null;
}

function extractDistrictByCity(normalized: string, city: CityConfig): string | null {
  for (const district of city.districtAliases) {
    if (normalized.includes(district.key)) {
      return district.label;
    }
  }

  return null;
}

function inferArea(text: string): { city: string; district: string | null } {
  const normalized = normalizeText(text);
  const matchedCity = detectCityConfig(normalized);

  if (matchedCity) {
    return {
      city: matchedCity.label,
      district: extractDistrictByCity(normalized, matchedCity),
    };
  }

  for (const city of CITY_CONFIGS) {
    const district = extractDistrictByCity(normalized, city);
    if (district) {
      return {
        city: city.label,
        district,
      };
    }
  }

  return {
    city: UNKNOWN_CITY_LABEL,
    district: null,
  };
}

function extractAddressLine(text: string): string | null {
  const labeledAddress = text.match(
    /(?:^|\n)\s*(?:📍|📌)?\s*(?:địa\s*chỉ|dia\s*chi)\s*[:：-]\s*([^\n\r]+)/iu
  );

  if (labeledAddress?.[1]) {
    const candidate = sanitizeAddressCandidate(labeledAddress[1]);
    if (isLikelyAddress(candidate)) {
      return candidate;
    }
  }

  const locationPhrases = text.matchAll(
    /(?:tọa\s*lạc\s*(?:tại|ở)|toa\s*lac\s*(?:tai|o)|nằm\s*(?:tại|ở)|nam\s*(?:tai|o))\s+([^\.\n\r]+)/giu
  );

  for (const match of locationPhrases) {
    const rawCandidate = match[1];
    if (!rawCandidate) {
      continue;
    }

    const candidate = sanitizeAddressCandidate(rawCandidate);
    if (isLikelyAddress(candidate)) {
      return candidate;
    }
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => sanitizeAddressCandidate(line))
    .filter((line) => line.length >= 6);

  const addressLike = lines.find((line) => {
    if (!line) {
      return false;
    }

    if (/^(?:địa\s*chỉ|dia\s*chi|điện\s*thoại|dien\s*thoai|sdt|phone)\b/iu.test(line)) {
      return false;
    }

    const normalized = normalizeText(line);
    const hasKnownCity = NORMALIZED_CITY_ALIASES.some((alias) => normalized.includes(alias));
    return (
      hasKnownCity ||
      /\d+\s+[\p{L}]/u.test(line) ||
      normalized.includes("quan") ||
      normalized.includes("huyen") ||
      normalized.includes("phuong") ||
      normalized.includes("duong") ||
      normalized.includes("xa")
    );
  });

  if (!addressLike) {
    return null;
  }

  const candidate = sanitizeAddressCandidate(addressLike);
  return isLikelyAddress(candidate) ? candidate : null;
}

function extractAddressLineRobust(text: string): string | null {
  const directAddress = extractAddressLine(text);
  if (directAddress) {
    return directAddress;
  }

  const rawLines = text
    .split(/\r?\n/)
    .map((line) => cleanInlineText(line))
    .filter((line) => line.length > 0);

  for (let index = 0; index < rawLines.length; index += 1) {
    const line = rawLines[index] || "";
    const labeledAddress = line.match(
      /^(?:ðŸ“|ðŸ“Œ)?\s*(?:Ä‘á»‹a\s*chá»‰|dia\s*chi)\s*[:ï¼š-]?\s*(.*)$/iu
    );

    if (!labeledAddress) {
      continue;
    }

    const sameLineCandidate = sanitizeAddressCandidate(labeledAddress[1] || "");
    for (let offset = 1; offset <= 2; offset += 1) {
      const nextLine = rawLines[index + offset];
      if (!nextLine) {
        break;
      }

      const mergedCandidate = mergeAddressFragments(sameLineCandidate, nextLine);
      if (isLikelyAddress(mergedCandidate)) {
        return mergedCandidate;
      }
    }
  }

  const lines = rawLines
    .map((line) => sanitizeAddressCandidate(line))
    .filter((line) => line.length >= 3);

  for (const line of lines) {
    if (!line) {
      continue;
    }

    if (isLikelyAddress(line)) {
      return line;
    }
  }

  for (let index = 1; index < lines.length; index += 1) {
    const currentLine = lines[index];
    const previousLine = lines[index - 1];
    if (!currentLine || !previousLine) {
      continue;
    }

    if (!isLikelyAddressPrefixFragment(previousLine)) {
      continue;
    }

    const mergedCandidate = mergeAddressFragments(previousLine, currentLine);
    if (isLikelyAddress(mergedCandidate)) {
      return mergedCandidate;
    }
  }

  return null;
}

function extractDishTags(text: string, hashtags: string[]): string[] {
  const normalized = normalizeText(text);
  const detected = DISH_KEYWORDS.filter((dish) => normalized.includes(dish));
  const fromHash = hashtags.filter((tag) => DISH_KEYWORDS.some((dish) => tag.includes(dish.replace(/\s+/g, ""))));
  return uniqueStrings([...detected, ...fromHash]);
}

function extractImageUrls(attachments: unknown[] | undefined): string[] {
  if (!attachments || attachments.length === 0) {
    return [];
  }

  const imageUrls: string[] = [];

  for (const item of attachments) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const entry = item as UnknownRecord;
    const thumbnail = typeof entry.thumbnail === "string" ? entry.thumbnail : null;

    let imageUri: string | null = null;
    const imageValue = entry.image;
    if (imageValue && typeof imageValue === "object") {
      const imageRecord = imageValue as UnknownRecord;
      if (typeof imageRecord.uri === "string") {
        imageUri = imageRecord.uri;
      }
    }

    if (imageUri) {
      imageUrls.push(imageUri);
      continue;
    }

    if (thumbnail) {
      imageUrls.push(thumbnail);
    }
  }

  return uniqueStrings(imageUrls);
}

function buildTitle(
  text: string,
  dishTags: string[],
  district: string | null,
  city: string
): string {
  const lines = text
    .split(/\r?\n/)
    .map((line) => cleanInlineText(line))
    .filter((line) => line.length >= 4 && !line.startsWith("#"));

  for (const line of lines.slice(0, 6)) {
    const extracted = extractTitleFromLine(line);
    if (extracted) {
      return extracted;
    }
  }

  const firstLine = lines[0] || null;

  if (firstLine) {
    const candidate = sanitizeTitleCandidate(stripLeadingBullet(firstLine));
    if (isLikelyBusinessTitle(candidate)) {
      return candidate;
    }

    const commaPrefix = sanitizeTitleCandidate(candidate.split(",")[0] || "");
    if (commaPrefix && isLikelyBusinessTitle(commaPrefix)) {
      return commaPrefix;
    }

    return candidate.slice(0, 120);
  }

  const dish = dishTags[0] || "Món ngon";
  if (district) {
    return `${dish} ở ${district}`;
  }

  if (city && city !== UNKNOWN_CITY_LABEL) {
    return `${dish} tại ${city}`;
  }

  return `${dish} địa phương`;
}

function buildSummary(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 220) {
    return cleaned;
  }

  return `${cleaned.slice(0, 217)}...`;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function computeEngagementScore(input: {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  reactionsCount: number;
  postedAt: Date | null;
}): number {
  const base =
    input.likesCount * 1 +
    input.commentsCount * 2 +
    input.sharesCount * 3 +
    input.reactionsCount * 1.2;

  let freshnessBonus = 0;
  if (input.postedAt) {
    const ageDays = (Date.now() - input.postedAt.getTime()) / (1000 * 60 * 60 * 24);
    freshnessBonus = Math.max(0, 30 - ageDays);
  }

  return Math.round((base + freshnessBonus) * 100) / 100;
}

function toSafeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return 0;
}

export function normalizeFacebookFoodPost(post: FacebookFoodPost): NormalizedFoodReviewInput | null {
  if (!post || typeof post !== "object") {
    return null;
  }

  const content = (post.text || "").trim();
  const postUrl = (post.url || "").trim();
  if (!content || !postUrl) {
    return null;
  }

  const postedAt = parseDate(post.time);
  const hashtags = extractHashtags(content);
  const dishTags = extractDishTags(content, hashtags);
  const inferredArea = inferArea(content);
  const addressText = extractAddressLineRobust(content);
  const phones = extractPhones(content);
  const prices = extractPriceRangeVnd(content);

  const likesCount = toSafeNumber(post.likesCount);
  const commentsCount = toSafeNumber(post.commentsCount);
  const sharesCount = toSafeNumber(post.sharesCount);
  const reactionsCount =
    toSafeNumber(post.topReactionsCount) +
    toSafeNumber(post.reactionLikeCount) +
    toSafeNumber(post.reactionLoveCount);

  const score = computeEngagementScore({
    likesCount,
    commentsCount,
    sharesCount,
    reactionsCount,
    postedAt,
  });

  const normalized: NormalizedFoodReviewInput = {
    title: buildTitle(content, dishTags, inferredArea.district, inferredArea.city),
    summary: buildSummary(content),
    content,
    area: {
      city: inferredArea.city,
      district: inferredArea.district,
      ward: null,
      addressText,
    },
    dishTags,
    hashtags,
    contactPhones: phones,
    priceMin: prices.min,
    priceMax: prices.max,
    imageUrls: extractImageUrls(post.attachments),
    postedAt,
    engagement: {
      likesCount,
      commentsCount,
      sharesCount,
      reactionsCount,
      score,
    },
    source: {
      platform: "facebook",
      groupTitle: post.groupTitle || null,
      groupId: post.facebookId || null,
      postUrl,
      postLegacyId: post.legacyId || null,
      rawInputUrl: post.inputUrl || null,
      authorName: post.user?.name || null,
      authorId: post.user?.id || null,
    },
    isActive: true,
    rawPayload: post,
  };

  return normalized;
}

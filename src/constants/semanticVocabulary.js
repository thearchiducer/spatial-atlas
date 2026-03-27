export const TYPE_OPTIONS = [
  "Room",
  "Circulation",
  "Threshold",
  "Zone",
  "Open Space",
  "Technical",
  "Service",
  "Concept",
];

export const SCALE_OPTIONS = ["Interior", "Building", "Site", "Urban"];

export const DOMAIN_OPTIONS = [
  "Residential",
  "Civic",
  "Religious",
  "Commercial",
  "Industrial",
  "Landscape",
  "Mixed-Use",
  "General",
  "Educational",
];

export const STATUS_OPTIONS = [
  "Contemporary",
  "Historical",
  "Vernacular",
  "Theoretical",
  "Generic",
];

export const PRIVACY_OPTIONS = [
  "public",
  "semi-public",
  "semi-private",
  "private",
  "restricted",
];

export const ENCLOSURE_OPTIONS = [
  "open",
  "semi-open",
  "enclosed",
  "edge-conditioned",
  "linear-enclosed",
];

export const CIRCULATION_ROLE_OPTIONS = [
  "primary",
  "secondary",
  "threshold",
  "nodal",
  "none",
];

export const SOCIAL_ROLE_OPTIONS = [
  "gathering",
  "reception",
  "movement",
  "waiting",
  "ritual",
  "service",
  "dwelling",
  "mixed",
  "none",
];

export const SPATIAL_LOGIC_OPTIONS = [
  "axial",
  "linear",
  "centralized",
  "distributed",
  "nested",
  "transitional",
  "perimeter",
  "courtyard",
];

export const CULTURAL_SPECIFICITY_OPTIONS = [
  "generalized",
  "regional",
  "highly-specific",
];

export const RITUAL_WEIGHT_OPTIONS = ["none", "low", "medium", "high"];

export const CLIMATE_RESPONSE_OPTIONS = [
  "neutral",
  "shade-oriented",
  "ventilation-oriented",
  "thermal-buffer",
  "courtyard-tempered",
];

export const REGION_OPTIONS = ["Cross-cultural", "Global"];

export const SOURCE_CATEGORY_OPTIONS = [
  // normalized / newer
  "Dwelling",
  "Circulation & Movement",
  "Entry & Threshold",
  "Open & Landscape",
  "Institution & Assembly",
  "Service & Utility",
  "Theory & Concept",
  "Structure & Envelope",
  "Unclassified",

  // legacy dataset values still in use
  "Transitional & In-Between",
  "Urban & Planning Spaces",
  "Social & Gathering",
  "Residential & Domestic",
  "Service Spaces",
  "Work & Institutional",
  "Gathering & Assembly",
  "Technical & Infrastructure",
  "Sacred & Ceremonial",
  "Conceptual & Theoretical",

  // lowercase legacy variants currently in entries
  "transitional & in-between",
  "urban & planning spaces",
  "social & gathering",
  "residential & domestic",
  "service spaces",
  "work & institutional",
  "gathering & assembly",
  "technical & infrastructure",
  "sacred & ceremonial",
  "conceptual & theoretical",
];

export const SORT_OPTIONS = [
  { value: "term", label: "Term" },
  { value: "type", label: "Type" },
  { value: "scale", label: "Scale" },
  { value: "domain", label: "Domain" },
  { value: "status", label: "Status" },
  { value: "region", label: "Region" },
];

export const SEMANTIC_VOCABULARY = {
  type: TYPE_OPTIONS,
  scale: SCALE_OPTIONS,
  domain: DOMAIN_OPTIONS,
  status: STATUS_OPTIONS,
  privacyLevel: PRIVACY_OPTIONS,
  enclosureType: ENCLOSURE_OPTIONS,
  circulationRole: CIRCULATION_ROLE_OPTIONS,
  socialRole: SOCIAL_ROLE_OPTIONS,
  spatialLogic: SPATIAL_LOGIC_OPTIONS,
  culturalSpecificity: CULTURAL_SPECIFICITY_OPTIONS,
  ritualWeight: RITUAL_WEIGHT_OPTIONS,
  climateResponse: CLIMATE_RESPONSE_OPTIONS,
  region: REGION_OPTIONS,
  sourceCategory: SOURCE_CATEGORY_OPTIONS,
};

export function isAllowedValue(fieldName, value) {
  const options = SEMANTIC_VOCABULARY[fieldName];
  if (!options || value == null || value === "") return true;
  return options.includes(value);
}

export function withAllOption(options) {
  return ["", ...options];
}

export function normalizeOptionLabel(value) {
  return String(value || "")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

import {
  CLIMATE_RESPONSE_OPTIONS,
  CULTURAL_SPECIFICITY_OPTIONS,
  DOMAIN_OPTIONS,
  ENCLOSURE_OPTIONS,
  PRIVACY_OPTIONS,
  RITUAL_WEIGHT_OPTIONS,
  SCALE_OPTIONS,
  SOCIAL_ROLE_OPTIONS,
  SOURCE_CATEGORY_OPTIONS,
  SPATIAL_LOGIC_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  CIRCULATION_ROLE_OPTIONS,
} from "../constants/semanticVocabulary.js";

export function validateEntry(entry) {
  const issues = [];

  if (!entry?.id) issues.push("Missing id");
  if (!entry?.term) issues.push("Missing term");
  if (!entry?.type) issues.push("Missing type");
  if (!entry?.scale) issues.push("Missing scale");
  if (!entry?.domain) issues.push("Missing domain");
  if (!entry?.status) issues.push("Missing status");
  if (!entry?.region) issues.push("Missing region");
  if (!entry?.description) issues.push("Missing description");

  if (entry?.type && !TYPE_OPTIONS.includes(entry.type)) {
    issues.push(`Invalid type: ${entry.type}`);
  }

  if (entry?.scale && !SCALE_OPTIONS.includes(entry.scale)) {
    issues.push(`Invalid scale: ${entry.scale}`);
  }

  if (entry?.domain && !DOMAIN_OPTIONS.includes(entry.domain)) {
    issues.push(`Invalid domain: ${entry.domain}`);
  }

  if (entry?.status && !STATUS_OPTIONS.includes(entry.status)) {
    issues.push(`Invalid status: ${entry.status}`);
  }

  if (entry?.privacyLevel && !PRIVACY_OPTIONS.includes(entry.privacyLevel)) {
    issues.push(`Invalid privacyLevel: ${entry.privacyLevel}`);
  }

  if (
    entry?.enclosureType &&
    !ENCLOSURE_OPTIONS.includes(entry.enclosureType)
  ) {
    issues.push(`Invalid enclosureType: ${entry.enclosureType}`);
  }

  if (
    entry?.circulationRole &&
    !CIRCULATION_ROLE_OPTIONS.includes(entry.circulationRole)
  ) {
    issues.push(`Invalid circulationRole: ${entry.circulationRole}`);
  }

  if (entry?.socialRole && !SOCIAL_ROLE_OPTIONS.includes(entry.socialRole)) {
    issues.push(`Invalid socialRole: ${entry.socialRole}`);
  }

  if (
    entry?.spatialLogic &&
    !SPATIAL_LOGIC_OPTIONS.includes(entry.spatialLogic)
  ) {
    issues.push(`Invalid spatialLogic: ${entry.spatialLogic}`);
  }

  if (
    entry?.culturalSpecificity &&
    !CULTURAL_SPECIFICITY_OPTIONS.includes(entry.culturalSpecificity)
  ) {
    issues.push(`Invalid culturalSpecificity: ${entry.culturalSpecificity}`);
  }

  if (
    entry?.ritualWeight &&
    !RITUAL_WEIGHT_OPTIONS.includes(entry.ritualWeight)
  ) {
    issues.push(`Invalid ritualWeight: ${entry.ritualWeight}`);
  }

  if (
    entry?.climateResponse &&
    !CLIMATE_RESPONSE_OPTIONS.includes(entry.climateResponse)
  ) {
    issues.push(`Invalid climateResponse: ${entry.climateResponse}`);
  }

  if (
    entry?.sourceCategory &&
    !SOURCE_CATEGORY_OPTIONS.includes(entry.sourceCategory)
  ) {
    issues.push(`Invalid sourceCategory: ${entry.sourceCategory}`);
  }

  if (entry?.synonyms && !Array.isArray(entry.synonyms)) {
    issues.push("Synonyms must be an array");
  }

  if (entry?.related && !Array.isArray(entry.related)) {
    issues.push("Related must be an array");
  }

  return issues;
}
